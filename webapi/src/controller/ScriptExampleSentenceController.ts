import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";

const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const create = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            text: Joi.string().required(),
            piece: Joi.string().required(),
            scriptId: Joi.number().required(),
            grammarId: Joi.number().required().allow(null),
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
            INSERT INTO script_example_sentence 
            (text, piece, script_id, grammar_id) 
            VALUES (?, ?, ?, ?)
        `).run(
            value.text, 
            value.piece, 
            value.scriptId, 
            value.grammarId
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
        text: Joi.string().required(),
        piece: Joi.string().required(),
        scriptId: Joi.number().required(),
        grammarId: Joi.number().required().allow(null),
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
        db.prepare(`
            UPDATE script_example_sentence
            SET 
                text = ?, 
                piece = ?, 
                grammar_id= ?
            WHERE 
                id = ? AND script_id = ?
        `).run(
            value.text, 
            value.piece, 
            value.grammarId, 
            value.id,
            value.scriptId, 
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
            SELECT id FROM script_example_sentence WHERE script_id = ? AND id = ?
        `).get(value.scriptId, value.id);
        if (!item) {
            return res.status(200).json({
                code: 0,
                message: `Does not exist`,
            });
        }
        // prettier-ignore
        db.prepare<[number, number]>(`
            DELETE FROM script_example_sentence WHERE script_id = ? AND id = ?
        `).run(value.scriptId, value.id);
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
        const list = db.prepare<[number], any>(`
            SELECT 
                ses.id,
                ses.text,
                ses.piece,
                ses.speech,
                g.name as grammarName
            FROM script_example_sentence ses
            LEFT JOIN grammar g ON g.id = ses.grammar_id
            WHERE ses.script_id = ?
            ORDER BY ses.id DESC
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
