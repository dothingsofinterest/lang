import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";

const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

interface Vocabulary {
    id: number;
    definition: string;
    image: string;
    speech: string;
    category: number;
}

export const create = (req: Request, res: Response) => {
    const schema = Joi.object({
        definition: Joi.string().required(),
        image: Joi.string().allow(null),
        speech: Joi.string().allow(null),
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
        const result = db.prepare<[string, string, string , number]>(`
            INSERT INTO \`vocabulary\` 
            (definition, speech, image, category) VALUES (?, ?, ?, ?)`,
        ).run(
            value.definition, 
            value.speech, 
            value.image, 
            value.category
        );
        return res.status(200).json({
            code: result.lastInsertRowid ? 1 : 0,
            message: result.lastInsertRowid ? `Succeed` : `Failed`,
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
        const result = db.prepare<[string, string, string , number, number]>(`
            UPDATE \`vocabulary\` 
            SET definition = ?, speech = ?, image = ?, category = ?
            WHERE id = ?
        `).run(
            value.definition, 
            value.speech, 
            value.image, 
            value.category, 
            value.id
        );
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
        const result = db.prepare<[number]>("DELETE `vocabulary` WHERE id = ?").run(value.id);
        res.status(200).json({
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
            SQLWhere.push(" AND `definition` LIKE ?");
            SQLParams.push(`%${keyword}%`);
        }

        // prettier-ignore
        const totalRow = db.prepare<unknown[], { total: number }>(`
            SELECT COUNT(*) as total FROM \`vocabulary\` 
            ${SQLWhere.join("")}
        `).get(...SQLParams);
        const totalPages = Math.ceil((totalRow ? totalRow.total : 0) / pageSize);

        // prettier-ignore
        const list = db.prepare<[...string[], number, number], Vocabulary>(`
            SELECT * FROM \`vocabulary\` ${SQLWhere.join("")} 
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
