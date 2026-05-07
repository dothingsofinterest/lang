import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import { concatSpeech } from "../utils/FFmpeg";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";
import { Vocabulary } from "../types/Vocabulary";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;
const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const create = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            definition: Joi.string().required(),
            image: Joi.string().allow(null, ""),
            speech: Joi.string().allow(null, ""),
            category: Joi.number(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        const item = db.prepare<[string], Vocabulary>(`
            SELECT id FROM vocabulary WHERE definition = ?
        `).get(value.definition);
        if (item) {
            return res.status(200).json({
                code: 0,
                message: `Duplicated`,
            });
        }
        // prettier-ignore
        db.prepare<[string, string, string , number]>(`
            INSERT INTO vocabulary (definition, speech, image, category) VALUES (?, ?, ?, ?)
        `).run(
            value.definition, 
            value.speech, 
            value.image, 
            value.category
        );
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

export const update = (req: Request, res: Response) => {
    const schema = Joi.object({
        id: Joi.number().required(),
        definition: Joi.string().required(),
        image: Joi.string().allow(null, ""),
        speech: Joi.string().allow(null, ""),
        category: Joi.number(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        // prettier-ignore
        db.prepare<[string, string, string , number, number]>(`
            UPDATE 
                vocabulary 
            SET 
                definition = ?, 
                speech = ?, 
                image = ?, 
                category = ?
            WHERE id = ?
        `).run(
            value.definition, 
            value.speech, 
            value.image, 
            value.category, 
            value.id
        );
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
        const item = db.prepare<[number], Vocabulary>("SELECT id, speech, image FROM `vocabulary` WHERE id = ?").get(value.id);
        if (!item) {
            return res.status(200).json({
                code: 0,
                message: `Does not exist`,
            });
        }
        if (item.speech) {
            const speechPath = path.join(`${dataPath}`, "speech", item.speech);
            if (fs.existsSync(speechPath)) {
                const stat = fs.statSync(speechPath);
                if (stat.isFile()) {
                    fs.unlinkSync(speechPath);
                }
            }
        }
        if (item.image) {
            const imagePath = path.join(`${dataPath}`, "image", item.image);
            if (fs.existsSync(imagePath)) {
                const stat = fs.statSync(imagePath);
                if (stat.isFile()) {
                    fs.unlinkSync(imagePath);
                }
            }
        }
        db.prepare<[number]>("DELETE FROM `vocabulary` WHERE id = ?").run(value.id);
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
            SQLWhere.push(" AND v.definition LIKE ?");
            SQLParams.push(`%${keyword}%`);
        }
        // prettier-ignore
        const totalRow = db.prepare<unknown[], { total: number }>(`
            SELECT COUNT(*) as total FROM vocabulary v ${SQLWhere.join("")}
        `).get(...SQLParams);
        const totalPages = Math.ceil((totalRow ? totalRow.total : 0) / pageSize);

        // prettier-ignore
        const list = db.prepare<[...string[], number, number], Vocabulary>(`
            SELECT
                v.id,
                v.definition, 
                v.speech, 
                v.image, 
                v.category,
                GROUP_CONCAT(sv.script_id) AS script_ids
            FROM vocabulary v 
            LEFT JOIN script_vocabulary sv ON sv.vocab_id = v.id
            ${SQLWhere.join("")} 
            GROUP BY v.id
            ORDER BY v.id DESC 
            LIMIT ? OFFSET ?`,
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

export const moveFile = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            image: Joi.string().allow(null, ""),
            speech: Joi.string().allow(null, ""),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        let fileSpeech = ``;
        let fileImage = ``;
        const tempFolder = path.join(`${uploadPath}`, `temp`);
        const todayFolder = new Date().toISOString().slice(0, 10);
        if (value.speech) {
            const fileOrigin = path.join(tempFolder, value.speech);
            if (fs.existsSync(fileOrigin)) {
                const speechFolder = path.join(`${dataPath}`, `speech`);
                const speechDateFolder = path.join(speechFolder, todayFolder);
                if (!fs.existsSync(speechDateFolder)) {
                    fs.mkdirSync(speechDateFolder, { recursive: true });
                }
                const fileTarget = path.join(speechDateFolder, value.speech);
                fs.renameSync(fileOrigin, fileTarget);
                fileSpeech = `${todayFolder}/${value.speech}`;
            }
        }
        if (value.image) {
            const fileOrigin = path.join(tempFolder, value.image);
            if (fs.existsSync(fileOrigin)) {
                const imageFolder = path.join(`${dataPath}`, `image`);
                const imageDateFolder = path.join(imageFolder, new Date().toISOString().slice(0, 10));
                if (!fs.existsSync(imageDateFolder)) {
                    fs.mkdirSync(imageDateFolder, { recursive: true });
                }
                const fileTarget = path.join(imageDateFolder, value.image);
                fs.renameSync(fileOrigin, fileTarget);
                fileImage = `${todayFolder}/${value.image}`;
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                speech: fileSpeech,
                image: fileImage,
            },
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const removeFile = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            image: Joi.string().allow(null, ""),
            speech: Joi.string().allow(null, ""),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            console.error("Failed to validate params: ", error.message);
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        if (value.speech) {
            const speechFile = path.join(`${dataPath}`, "speech", value.speech);
            if (fs.existsSync(speechFile)) {
                const stat = fs.statSync(speechFile);
                if (stat.isFile()) {
                    fs.unlinkSync(speechFile);
                }
            }
        }
        if (value.image) {
            const imageFile = path.join(`${dataPath}`, `image`, value.image);
            if (fs.existsSync(imageFile)) {
                const stat = fs.statSync(imageFile);
                if (stat.isFile()) {
                    fs.unlinkSync(imageFile);
                }
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const uploadImage = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
    res.status(200).json({
        code: 1,
        message: `Succeed.`,
        data: { filename: req.file.originalname },
    });
};

export const exportSpeech = async (req: Request, res: Response) => {
    try {
        // prettier-ignore
        const list = db.prepare(`SELECT id, speech FROM vocabulary`).all();
        const listSorted = [...list].sort((a: any, b: any) => {
            const nameA = a.speech.split("/").pop();
            const nameB = b.speech.split("/").pop();
            return nameA.localeCompare(nameB);
        });
        const listPathSorted = listSorted.map((item: any) => item.speech);
        const files: string[] = [];
        const fileInput = path.join(`${dataPath}`, "speech_list.txt");
        const fileOutput = path.join(`${dataPath}`, "speech_all.mp3");
        listPathSorted.forEach((item: any) => {
            const fullPath = path.join(`${dataPath}`, "speech", item);
            if (fs.existsSync(fullPath)) {
                files.push(`file '${fullPath}'`);
            } else {
                LoggerSystem.info(`contact failed: ${fullPath}`);
            }
        });
        if (!files.length) {
            return res.status(200).json({
                code: 0,
                message: `Failed.`,
            });
        }
        await fsPromise.writeFile(fileInput, files.join("\n"), "utf-8");
        await concatSpeech(fileInput, fileOutput);
        const stat = fs.statSync(fileOutput);
        const fileSize = stat.size;
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", "audio/mpeg");
        const stream = fs.createReadStream(fileOutput);
        stream.pipe(res);
        stream.on("error", (err) => {
            return res.status(200).json({
                code: 0,
                message: `Failed.`,
            });
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
