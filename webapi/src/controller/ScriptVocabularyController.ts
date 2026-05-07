import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { Vocabulary } from "../types/Vocabulary";

const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const create = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            vocabId: Joi.number().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        const item = db.prepare<[number, number], any>(`
            SELECT id FROM script_vocabulary
            WHERE script_id = ? AND vocab_id = ? 
        `).get(value.scriptId, value.vocabId);
        if (item) {
            return res.status(200).json({
                code: 0,
                message: `Duplicated`,
            });
        }
        // prettier-ignore
        db.prepare<[number , number]>(`
            INSERT INTO script_vocabulary (script_id, vocab_id) VALUES (?, ?)
        `).run(value.scriptId, value.vocabId);
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
            vocabId: Joi.number().required(),
            scriptId: Joi.number().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        const item = db.prepare<[number, number], any>(`
            SELECT id FROM script_vocabulary WHERE script_id = ? AND id = ?
        `).get(value.scriptId, value.vocabId);
        if (!item) {
            return res.status(200).json({
                code: 0,
                message: `Does not exist`,
            });
        }
        // prettier-ignore
        db.prepare<[number, number]>(`
            DELETE FROM script_vocabulary WHERE script_id = ? AND id = ?
        `).run(value.scriptId, value.vocabId);
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
        const list = db.prepare<[number], Vocabulary>(`
            SELECT 
                sv.id,
                v.definition, 
                v.image, 
                v.speech, 
                v.category
            FROM script_vocabulary sv
            JOIN vocabulary v ON v.id = sv.vocab_id
            WHERE sv.script_id = ?
            ORDER BY sv.id DESC
        `).all(value.scriptId);
        res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: list,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};
