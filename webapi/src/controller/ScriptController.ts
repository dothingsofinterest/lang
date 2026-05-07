import fs from "fs";
import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";
import { enhanceDialogueAndExtractMP3, extractAudio } from "../utils/FFmpeg";
import { waveformCreate as waveformCreateService } from "../service/BBCAudioWaveform";
import { Script, ScriptScene, ScriptRole, ScriptParagraph, ScriptSentence } from "../types/Script";

const dataPath = process.env.DATA_PATH;
const dbFile = path.join(`${dataPath}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const create = async (req: Request, res: Response) => {
    try {
        if (!req.file || !req.file.path || !req.file.originalname) {
            return res.status(200).json({
                code: 0,
                message: `Failed`,
            });
        }
        const videoName = path.basename(req.file.originalname, path.extname(req.file.originalname));
        const item = db.prepare<[string], Script>("SELECT id, name FROM `script` WHERE name = ?").get(videoName);
        if (item) {
            return res.status(200).json({
                code: 0,
                message: `Duplicated`,
            });
        }
        const result = db.prepare<[string]>("INSERT INTO `script` (name) VALUES (?)").run(videoName);
        if (!result.lastInsertRowid) {
            return res.status(200).json({
                code: 0,
                message: `Failed`,
            });
        }
        // Init Folders
        const scriptFolder = path.join(`${dataPath}`, `${result.lastInsertRowid}`);
        const scriptSpeechFolder = path.join(`${scriptFolder}`, "speech");
        const scriptImageFolder = path.join(`${scriptFolder}`, "image");
        fs.mkdirSync(scriptFolder, { recursive: true });
        fs.mkdirSync(scriptSpeechFolder);
        fs.mkdirSync(scriptImageFolder);

        const scriptFile = path.join(`${scriptFolder}`, "video.mp4");
        fs.renameSync(req.file.path, scriptFile);

        const audioFile = path.join(scriptFolder, "audio.mp3");
        await extractAudio(`${scriptFile}`, audioFile);

        // Init Waveform
        const audiowaveform = path.join(`${scriptFolder}`, "audiowaveform.json");
        const outputAudio = path.join(`${scriptFolder}`, "audio_enhanced.mp3");
        await enhanceDialogueAndExtractMP3(scriptFile, outputAudio);
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
};

export const update = (req: Request, res: Response) => {
    try {
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
        db.prepare<[string, number]>("UPDATE `script` SET name = ? WHERE id = ?").run(value.name, value.id);
        return res.status(200).json({
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
};

export const remove = (req: Request, res: Response) => {
    try {
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
        // db.prepare<[number]>("DELETE FROM `script` WHERE id = ?").run(value.id);
        return res.status(200).json({
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
};

export const list = (req: Request, res: Response) => {
    try {
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
            SELECT COUNT(*) as total FROM \`script\` 
            ${SQLWhere.join("")}
        `).get(...SQLParams);
        const totalPages = Math.ceil((totalRow ? totalRow.total : 0) / pageSize);

        // prettier-ignore
        const list = db.prepare<[...string[], number, number], Script>(`
            SELECT 
                id, 
                name, 
                study_count as studyCount 
            FROM \`script\` ${SQLWhere.join("")} 
            ORDER BY study_count DESC 
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

export const read = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
        });
        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        const script = db.prepare<[number], Script>("SELECT id, name FROM `script` WHERE id = ?").get(value.scriptId);
        if (!script) {
            return res.status(200).json({
                code: 0,
                message: `Does not exist`,
            });
        }
        // prettier-ignore
        const roles = db.prepare<[number], ScriptRole>(`
            SELECT 
                id, 
                script_id AS scriptId, 
                name 
            FROM script_role WHERE script_id = ?
        `).all(value.scriptId);
        const roleMap = new Map<number, ScriptRole>();
        roles.forEach((s: ScriptRole) => roleMap.set(s.id, s));

        // prettier-ignore
        const scenes = db.prepare<[number], ScriptScene>(`
            SELECT 
                id, 
                script_id as scriptId, 
                name 
            FROM script_scene WHERE script_id = ?
        `).all(value.scriptId);
        const sceneMap = new Map<number, ScriptScene>();
        scenes.forEach((s: ScriptScene) => sceneMap.set(s.id, s));

        // prettier-ignore
        const paragraphs = db.prepare<[number], ScriptParagraph>(`
            SELECT 
                id, 
                script_id AS scriptId, 
                scene_id AS sceneId, 
                role_id AS roleId
            FROM script_paragraph 
            WHERE script_id = ?
            ORDER BY order_num ASC
        `).all(value.scriptId);
        const paragraphIds = paragraphs.map((p: any) => p.id);

        // prettier-ignore
        const sentences = db.prepare<[...number[]], ScriptSentence>(`
            SELECT 
                id, 
                script_id AS scriptId, 
                paragraph_id AS paragraphId, 
                start_time AS startTime, 
                end_time AS endTime, 
                order_num AS orderNum, 
                text,
                piece
            FROM script_sentence
            WHERE paragraph_id IN (${paragraphIds.map(() => "?").join(",")})
            ORDER BY order_num ASC
        `).all(...paragraphIds);
        // prettier-ignore
        const sentenceMap = new Map<number, ScriptSentence[]>();
        sentences.forEach((s: ScriptSentence) => {
            if (!sentenceMap.has(s.paragraphId)) {
                sentenceMap.set(s.paragraphId, []);
            }
            sentenceMap.get(s.paragraphId)!.push(s);
        });
        // prettier-ignore
        const dataMap = new Map<number, {
                name: string;
                paragraphs: { 
                    id: number; 
                    role: string; 
                    sentences: ScriptSentence[] 
                }[];
            }
            >();
        paragraphs.forEach((p: ScriptParagraph) => {
            const sceneId = p.sceneId ? p.sceneId : 0;
            if (!dataMap.has(sceneId)) {
                dataMap.set(sceneId, {
                    name: sceneMap.get(sceneId)?.name || "",
                    paragraphs: [],
                });
            }
            dataMap.get(sceneId)!.paragraphs.push({
                id: p.id,
                role: roleMap.get(p.roleId)?.name || "",
                sentences: sentenceMap.get(p.id) || [],
            });
        });
        res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: {
                id: script.id,
                title: script.name,
                scenes: Array.from(dataMap.values()),
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
