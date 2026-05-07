import fs from "fs";
import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { Script, ScriptScene, ScriptRole, ScriptParagraph, ScriptSentence, ScriptParagraphWithSentences } from "../types/Script";

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

export const insert = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
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
        const tx = db.transaction((value: { scriptId: number; prevId?: number; nextId?: number }) => {
            let prevOrder: number | null = null;
            let nextOrder: number | null = null;
            if (value.prevId) {
                // prettier-ignore
                const row = db.prepare<[number, number], ScriptParagraph>(`
                    SELECT 
                        id, 
                        script_id AS scriptId, 
                        scene_id AS sceneId, 
                        role_id AS roleId,
                        order_num AS orderNum
                    FROM script_paragraph
                    WHERE id = ? AND script_id = ?
                `).get(value.prevId, value.scriptId);
                if (!row) throw new Error("prevId not found");
                prevOrder = row.orderNum;
            }
            if (value.nextId) {
                // prettier-ignore
                const row = db.prepare<[number, number], ScriptParagraph>(`
                    SELECT 
                        id, 
                        script_id AS scriptId, 
                        scene_id AS sceneId, 
                        role_id AS roleId,
                        order_num AS orderNum
                    FROM script_paragraph
                    WHERE id = ? AND script_id = ?
                `).get(value.nextId, value.scriptId);
                if (!row) throw new Error("nextId not found");
                nextOrder = row.orderNum;
            }

            const newOrder = getOrderNum(prevOrder, nextOrder);

            // prettier-ignore
            const result = db.prepare<[number, number]>(`
                INSERT INTO script_paragraph (script_id, order_num)
                VALUES (?, ?)
            `).run(value.scriptId, newOrder);
            const paragraphId = Number(result.lastInsertRowid);

            // prettier-ignore
            db.prepare<[number, number]>(`
                INSERT INTO script_sentence (script_id, paragraph_id, order_num)
                VALUES (?, ?, 0)`
            ).run(value.scriptId, paragraphId);

            return paragraphId;
        });
        const paragraphId = tx({
            scriptId: value.scriptId,
            prevId: value.prevId,
            nextId: value.nextId,
        });
        return res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: paragraphId,
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
            roleId: Joi.number().allow(null).required(),
            sceneId: Joi.number().allow(null).required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        db.prepare(`
            UPDATE script_paragraph
            SET role_id = ?, scene_id = ?
            WHERE script_id = ? AND id = ?
        `).run(
            value.roleId, 
            value.sceneId, 
            value.scriptId, 
            value.paragraphId
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
            scriptId: Joi.number().required(),
            paragraphId: Joi.number().required(),
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
                role_id AS roleId,
                order_num AS orderNum
            FROM script_paragraph
            WHERE script_id = ? AND id = ? 
        `).get(value.scriptId, value.paragraphId);
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
        }) => {
            db.prepare(`
                DELETE FROM script_paragraph
                WHERE script_id = ? AND id = ?
            `).run(value.scriptId, value.paragraphId);
        });
        tx({
            scriptId: value.scriptId,
            paragraphId: value.paragraphId,
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

export const cut = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            prevId: Joi.number().required().allow(null),
            nextId: Joi.number().required().allow(null),
            sentenceIds: Joi.array().items(Joi.number()).required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        const tx = db.transaction((value: { scriptId: number; prevId?: number; nextId?: number; sentenceIds: number[] }) => {
            let prevOrder: number | null = null;
            let nextOrder: number | null = null;
            if (value.prevId) {
                // prettier-ignore
                const row = db.prepare<[number, number], ScriptParagraph>(`
                    SELECT 
                        id, 
                        script_id AS scriptId, 
                        scene_id AS sceneId, 
                        role_id AS roleId,
                        order_num AS orderNum
                    FROM script_paragraph
                    WHERE id = ? AND script_id = ?
                `).get(value.prevId, value.scriptId);
                if (!row) throw new Error("prevId not found");
                prevOrder = row.orderNum;
            }
            if (value.nextId) {
                // prettier-ignore
                const row = db.prepare<[number, number], ScriptParagraph>(`
                    SELECT 
                        id, 
                        script_id AS scriptId, 
                        scene_id AS sceneId, 
                        role_id AS roleId,
                        order_num AS orderNum
                    FROM script_paragraph
                    WHERE id = ? AND script_id = ?
                `).get(value.nextId, value.scriptId);
                if (!row) throw new Error("nextId not found");
                nextOrder = row.orderNum;
            }

            const newOrder = getOrderNum(prevOrder, nextOrder);

            // prettier-ignore
            const result = db.prepare<[number, number]>(`
                INSERT INTO script_paragraph (script_id, order_num)
                VALUES (?, ?)
            `).run(value.scriptId, newOrder);
            const paragraphId = Number(result.lastInsertRowid);

            // prettier-ignore
            db.prepare<[number, ...number[]]>(`
                UPDATE script_sentence
                SET paragraph_id = ?
                WHERE script_id = ? AND id IN (${value.sentenceIds.map(() => "?").join(",")})
            `).run(paragraphId, value.scriptId, ...value.sentenceIds);
            return paragraphId;
        });
        tx({
            scriptId: value.scriptId,
            prevId: value.prevId,
            nextId: value.nextId,
            sentenceIds: value.sentenceIds,
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
        const list = db.prepare<[number], any>(`
            SELECT
            p.id            AS p_id,
            p.script_id     AS p_script_id,
            p.scene_id      AS p_scene_id,
            p.role_id       AS p_role_id,
            p.order_num     AS p_order,
            s.id            AS s_id,
            s.start_time    AS s_start,
            s.end_time      AS s_end,
            s.order_num     AS s_order,
            s.text          AS s_text,
            s.piece         AS s_piece
            FROM script_paragraph p
            LEFT JOIN script_sentence s ON s.paragraph_id = p.id
            WHERE p.script_id = ?
            ORDER BY p.order_num ASC, s.order_num ASC
        `).all(value.scriptId);
        const map = new Map<number, ScriptParagraphWithSentences>();
        list.forEach((row) => {
            let paragraph = map.get(row.p_id);
            if (!paragraph) {
                paragraph = {
                    id: row.p_id,
                    scriptId: row.p_script_id,
                    sceneId: row.p_scene_id,
                    roleId: row.p_role_id,
                    orderNum: row.p_order,
                    sentences: [],
                };
                map.set(row.p_id, paragraph);
            }
            // Possibly sentence is empty due to LEFT JOIN
            if (row.s_id) {
                paragraph.sentences.push({
                    id: row.s_id,
                    startTime: row.s_start,
                    endTime: row.s_end,
                    orderNum: row.s_order,
                    text: row.s_text,
                    piece: row.s_piece
                });
            }
        });
        res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: Array.from(map.values()),
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};
