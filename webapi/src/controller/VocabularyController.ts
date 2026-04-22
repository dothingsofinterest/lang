import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";

const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

type Video = {
    id: number;
    name: string;
};

type Vocabulary = {
    id: number;
    definition: string;
    image: string;
    pronunciation: string;
    category: number;
};

export const create = (req: Request, res: Response) => {
    const schema = Joi.object({
        videoID: Joi.number().required(),
        definition: Joi.string().required(),
        image: Joi.string().allow(null, ""),
        pronunciation: Joi.string().allow(null, ""),
        category: Joi.number(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const video = db.prepare<[number], Video>("SELECT * FROM `video` WHERE id = ?").get(value.videoID);
    if (!video) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    try {
        const stmt = db.prepare("INSERT INTO `vocabulary` (definition, pronunciation, image, category) VALUES (?, ?, ?, ?)");
        const result = stmt.run(value.definition, value.pronunciation ?? null, value.image ?? null, value.category ?? 7);
        if (!result.lastInsertRowid) {
            return res.status(200).json({
                code: 0,
                message: `Failed to create.`,
            });
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

export const list = (req: Request, res: Response) => {
    const schema = Joi.object({
        videoID: Joi.number().required(),
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
    const video = db.prepare<[number], Video>("SELECT * FROM `video` WHERE id = ?").get(value.videoID);
    if (!video) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    try {
        const { page, offset, pageSize } = getPagination({ page: value.page, pageSize: value.pageSize });

        let where = "WHERE 1=1";
        const params: string[] = [];

        const keyword = value.keyword || "";
        if (keyword) {
            where += " AND `definition` LIKE ?";
            params.push(`%${keyword}%`);
        }

        const countStmt = db.prepare<unknown[], { total: number }>(`SELECT COUNT(*) as total FROM \`vocabulary\` ${where}`);
        const totalRow = countStmt.get(...params);
        const totalNums = totalRow ? totalRow.total : 0;
        const totalPages = Math.ceil(totalNums / pageSize);

        const listStmt = db.prepare<[...any[], number, number], Vocabulary>(`SELECT * FROM vocabulary ${where} ORDER BY id DESC LIMIT ? OFFSET ?`);
        const list = listStmt.all(...params, pageSize, offset);

        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                list,
                pagination: {
                    page,
                    pageSize,
                    totalNums,
                    totalPages,
                },
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
