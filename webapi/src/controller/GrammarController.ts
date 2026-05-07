import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";
import { Grammar } from "../types/Grammar";

const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const create = (req: Request, res: Response) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        text: Joi.string().required(),
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
        db.prepare<[string, string]>(`
            INSERT INTO grammar (name, text) VALUES (?, ?)
        `).run(value.name, value.text);
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
        name: Joi.string().required(),
        text: Joi.string().required(),
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
        db.prepare<[string, string, number]>(`
            UPDATE grammar 
            SET name = ?, text = ?
            WHERE id = ?
        `).run(
            value.name, 
            value.text, 
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
        db.prepare<[number]>("DELETE FROM `grammar` WHERE id = ?").run(value.id);
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
            SQLWhere.push(" AND `name` LIKE ?");
            SQLParams.push(`%${keyword}%`);
        }

        // prettier-ignore
        const totalRow = db.prepare<unknown[], { total: number }>(`
            SELECT COUNT(*) as total FROM grammar ${SQLWhere.join("")}
        `).get(...SQLParams);
        const totalPages = Math.ceil((totalRow ? totalRow.total : 0) / pageSize);

        // prettier-ignore
        const list = db.prepare<[...string[], number, number], Grammar>(`
            SELECT
                id,
                name, 
                text
            FROM grammar ${SQLWhere.join("")} 
            ORDER BY id DESC 
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
