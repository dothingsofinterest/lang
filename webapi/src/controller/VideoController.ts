import fs from "fs";
import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";
import { enhanceDialogueAndExtractMP3, extractAudio } from "../utils/FFmpeg";
import { waveformCreate as waveformCreateService } from "../service/BBCAudioWaveform";

const dataPath = process.env.DATA_PATH;
const dbFile = path.join(`${dataPath}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

interface Video {
    id: number;
    name: string;
}

export const create = async (req: Request, res: Response) => {
    if (req.file && req.file.path && req.file.originalname) {
        try {
            const videoName = path.basename(req.file.originalname, path.extname(req.file.originalname));
            const item = db.prepare<[string], Video>("SELECT id, name FROM `video` WHERE name = ?").get(videoName);
            if (item) {
                return res.status(200).json({
                    code: 0,
                    message: `Video duplicated`,
                });
            }
            const result = db.prepare<[string]>("INSERT INTO `video` (name) VALUES (?)").run(videoName);
            if (!result.lastInsertRowid) {
                return res.status(200).json({
                    code: 0,
                    message: `Failed to create`,
                });
            }

            // Init Folders
            const videoFolder = path.join(`${dataPath}`, `${result.lastInsertRowid}`);
            const videoSpeechFolder = path.join(`${videoFolder}`, "speech");
            const videoImageFolder = path.join(`${videoFolder}`, "image");
            fs.mkdirSync(videoFolder, { recursive: true });
            fs.mkdirSync(videoSpeechFolder);
            fs.mkdirSync(videoImageFolder);

            // Init Video
            const videoFile = path.join(`${videoFolder}`, "video.mp4");
            fs.renameSync(req.file.path, videoFile);

            // Init Audio
            const audioFile = path.join(videoFolder, "audio.mp3");
            await extractAudio(`${videoFile}`, audioFile);

            // Init Waveform
            const audiowaveform = path.join(`${videoFolder}`, "audiowaveform.json");
            const outputAudio = path.join(`${videoFolder}`, "audio_enhanced.mp3");
            await enhanceDialogueAndExtractMP3(videoFile, outputAudio);
            await waveformCreateService(`${outputAudio}`, `${audiowaveform}`);
            fs.unlinkSync(outputAudio);

            res.status(200).json({
                code: 1,
                message: `Succeed`,
            });
        } catch (error: any) {
            LoggerSystem.error(error.message);
            return res.status(200).json({
                code: 0,
                message: `Failed`,
            });
        }
    } else {
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};

export const update = (req: Request, res: Response) => {
    const schema = Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        const result = db.prepare<[string, number]>("UPDATE `video` SET name = ? WHERE id = ?").run(value.name, value.id);
        return res.status(200).json({
            code: result.changes ? 1 : 0,
            message: result.changes ? `Succeed` : `Failed`,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};

export const remove = (req: Request, res: Response) => {
    const schema = Joi.object({
        id: Joi.number().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        const result = db.prepare<[number]>("DELETE `video` WHERE id = ?").run(value.id);
        return res.status(200).json({
            code: result.changes ? 1 : 0,
            message: result.changes ? `Succeed` : `Failed`,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};

export const list = (req: Request, res: Response) => {
    const schema = Joi.object({
        keyword: Joi.string().allow(null, ""),
        page: Joi.number().required(),
        pageSize: Joi.number().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        const { page, offset, pageSize } = getPagination({ page: value.page, pageSize: value.pageSize });

        const SQLWhere = ["WHERE 1=1"];
        const SQLParams: string[] = [];

        const keyword = value.keyword || "";
        if (keyword) {
            SQLWhere.push(" AND `name` LIKE ?");
            SQLParams.push(`%${keyword}%`);
        }

        // prettier-ignore
        const totalRow = db.prepare<unknown[], { total: number }>(`
            SELECT COUNT(*) as total FROM \`video\` 
            ${SQLWhere.join("")}
        `).get(...SQLParams);
        const totalPages = Math.ceil((totalRow ? totalRow.total : 0) / pageSize);

        // prettier-ignore
        const list = db.prepare<[...string[], number, number], Video>(`
            SELECT * FROM \`video\` ${SQLWhere.join("")} 
            ORDER BY id DESC 
            LIMIT ? 
            OFFSET ?`,
        ).all(...SQLParams, pageSize, offset);

        res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: {
                list,
                listParams: {
                    keyword,
                    page,
                    pageSize,
                    totalPages,
                },
            },
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};
