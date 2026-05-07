import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { ScriptScene } from "../types/Script";

const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const create = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            name: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        // prettier-ignore
        db.prepare<[number , string]>(`
            INSERT INTO script_scene (script_id, name) VALUES (?, ?)
        `).run(value.scriptId, value.name);
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
        // prettier-ignore
        db.prepare<[string, number]>(`
            UPDATE script_scene SET name = ? WHERE id = ?
        `).run( value.name,  value.id );
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
        db.prepare<[number]>("DELETE FROM `script_scene` WHERE id = ?").run(value.id);
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
        const list = db.prepare<[number], ScriptScene>(`
            SELECT 
                id, 
                script_id as scriptId, 
                name 
            FROM script_scene
            WHERE script_id = ?
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
