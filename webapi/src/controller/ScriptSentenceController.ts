import fs from "fs";
import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { ScriptParagraph, ScriptSentence } from "../types/Script";
import { getPagination } from "../utils/Page";

const dataPath = process.env.DATA_PATH;
const dbFile = path.join(`${dataPath}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);
const GAP = 1000;
const getOrderNum = (prev?: number | null, next?: number | null): number => {
    // =====================
    // 基础校验
    // =====================
    if (prev != null && typeof prev !== "number") {
        throw new Error("prev must be number");
    }
    if (next != null && typeof next !== "number") {
        throw new Error("next must be number");
    }
    // =====================
    // 首次插入
    // =====================
    if (prev == null && next == null) {
        return 0;
    }
    // =====================
    // 插入到最前
    // =====================
    if (prev == null) {
        return next! - GAP;
    }
    // =====================
    // 插入到最后
    // =====================
    if (next == null) {
        return prev + GAP;
    }
    // =====================
    // 逻辑校验
    // =====================
    if (prev >= next) {
        throw new Error("Invalid order: prev must < next");
    }
    const diff = next - prev;
    // =====================
    // 无法再插入 → 需要重排
    // =====================
    if (diff <= 1) {
        throw new Error("NEED_REINDEX");
    }
    // =====================
    // 正常取中间值
    // =====================
    const mid = Math.floor((prev + next) / 2);
    // 防御性校验（极端情况）
    if (mid === prev || mid === next) {
        throw new Error("NEED_REINDEX");
    }
    return mid;
};

export const list = (req: Request, res: Response) => {
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
        // prettier-ignore
        const sentences = db.prepare<[number], ScriptSentence>(`
            SELECT 
                ss.id, 
                ss.script_id AS scriptId, 
                ss.paragraph_id AS paragraphId, 
                ss.start_time AS startTime, 
                ss.end_time AS endTime, 
                ss.order_num AS orderNum, 
                ss.text,
                ss.piece
            FROM script_sentence AS ss
            INNER JOIN script_paragraph AS sp ON sp.id = ss.paragraph_id
            WHERE ss.script_id = ? 
            ORDER BY sp.order_num, ss.order_num
        `).all(value.scriptId);
        res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: sentences,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};

export const insert = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            paragraphId: Joi.number().required(),
            prevId: Joi.number().required().allow(null),
            nextId: Joi.number().required().allow(null),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        const tx = db.transaction((value: { scriptId: number; paragraphId: number; prevId?: number; nextId?: number }) => {
            let prevOrder: number | null = null;
            let nextOrder: number | null = null;
            if (value.prevId) {
                // prettier-ignore
                const row = db.prepare<[number, number, number], ScriptSentence>(`
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
                    WHERE id = ? AND script_id = ? AND paragraph_id = ?
                `).get(value.prevId, value.scriptId, value.paragraphId);
                if (!row) throw new Error("prevId not found");
                prevOrder = row.orderNum;
            }
            if (value.nextId) {
                // prettier-ignore
                const row = db.prepare<[number, number, number], ScriptSentence>(`
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
                    WHERE id = ? AND script_id = ? AND paragraph_id = ?
                `).get(value.nextId, value.scriptId, value.paragraphId);
                if (!row) throw new Error("nextId not found");
                nextOrder = row.orderNum;
            }

            const newOrder = getOrderNum(prevOrder, nextOrder);

            // prettier-ignore
            const result = db.prepare<[number, number, number]>(`
                INSERT INTO script_sentence (script_id, paragraph_id, order_num) VALUES (?, ?, ?)
            `).run(value.scriptId, value.paragraphId, newOrder);
            const sentenceId = Number(result.lastInsertRowid);
            return sentenceId;
        });
        tx({
            scriptId: value.scriptId,
            paragraphId: value.paragraphId,
            prevId: value.prevId,
            nextId: value.nextId,
        });
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
            scriptId: Joi.number().required(),
            paragraphId: Joi.number().required(),
            sentenceId: Joi.number().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        const item = db.prepare<[number, number, number], ScriptSentence>(`
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
            WHERE script_id = ? AND paragraph_id = ? AND id = ? 
        `).get(value.scriptId, value.paragraphId, value.sentenceId);
        if (!item) {
            return res.status(200).json({
                code: 0,
                message: `Does not exist`,
            });
        }
        // prettier-ignore
        const tx = db.transaction((value: {   
            scriptId: number;
            paragraphId: number;
            sentenceId: number; 
        }) => {
            db.prepare(`
                DELETE FROM script_sentence WHERE script_id = ? AND paragraph_id = ? AND id = ? 
            `).run(value.scriptId, value.paragraphId, value.sentenceId);
        });
        tx({
            scriptId: value.scriptId,
            paragraphId: value.paragraphId,
            sentenceId: value.sentenceId,
        });
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

export const insertBatch = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            paragraphId: Joi.number().required(),
            sentences: Joi.array().items(Joi.object()).required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        const item = db.prepare<[number, number], ScriptParagraph>(`
            SELECT 
                id, 
                script_id AS scriptId, 
                scene_id AS sceneId, 
                role_id AS roleId
            FROM script_paragraph 
            WHERE script_id = ? AND id = ? 
        `).get(value.scriptId, value.paragraphId);
        if (!item) {
            return res.status(200).json({
                code: 0,
                message: `Does not exist`,
            });
        }
        let orderNum: null | number = 0;
        value.sentences.forEach((s: any) => {
            orderNum = getOrderNum(orderNum, null);
            // prettier-ignore
            db.prepare<[number, number, number, number, string, number]>(`
                INSERT INTO script_sentence (script_id, paragraph_id, start_time, end_time, text, order_num)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(value.scriptId, value.paragraphId, Number(s.startTime), Number(s.endTime), s.text, orderNum);
        });
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
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            paragraphId: Joi.number().required(),
            sentenceId: Joi.number().required(),
            startTime: Joi.number().required(),
            endTime: Joi.number().required(),
            text: Joi.string().required().allow(null, ""),
            piece: Joi.string().required().allow(null, ""),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        db.prepare<[number, number, string, string, number, number, number]>(`
            UPDATE script_sentence
            SET 
                start_time = ?, 
                end_time = ?, 
                text = ?,
                piece = ?
            WHERE 
                script_id = ? AND 
                paragraph_id = ? AND 
                id = ? 
        `).run(
            value.startTime, 
            value.endTime, 
            value.text, 
            value.piece, 
            value.scriptId, 
            value.paragraphId,
            value.sentenceId
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

export const search = (req: Request, res: Response) => {
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
            SQLWhere.push(" AND `ss`.`text` LIKE ?");
            SQLParams.push(`%${keyword}%`);
        }

        // prettier-ignore
        const totalRow = db.prepare<unknown[], { total: number }>(`
            SELECT COUNT(*) as total FROM script_sentence ss
            ${SQLWhere.join("")}
        `).get(...SQLParams);
        const totalPages = Math.ceil((totalRow ? totalRow.total : 0) / pageSize);
        // prettier-ignore
        const list = db.prepare<[...string[], number, number]>(`
            SELECT 
                ss.id, 
                ss.text, 
                s.name AS sName,
                s.id AS sId
            FROM script_sentence AS ss
            INNER JOIN \`script\` AS s ON s.id = ss.script_id
            ${SQLWhere.join("")} 
            LIMIT ? 
            OFFSET ?
        `).all(...SQLParams, pageSize, offset);

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
