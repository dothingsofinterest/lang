import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";

const basePath = process.env.UPLOAD_PATH;

export const countVocabs = async (req: Request, res: Response) => {
    try {
        let planCount = 0;
        let planVocabsCount = 0;
        const plans = await fsPromise.readdir(`${basePath}`);
        for (const plan of plans) {
            if (plan !== "temp") {
                const scriptFile = path.join(`${basePath}`, plan, `script.json`);
                if (fs.existsSync(scriptFile)) {
                    const scriptBinary = await fsPromise.readFile(scriptFile);
                    const scriptString = Buffer.from(scriptBinary).toString();
                    const scriptObject = JSON.parse(scriptString);
                    planVocabsCount += scriptObject.vocabs.length;
                    planCount++;
                }
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                planCount,
                planVocabsCount,
            },
        });
    } catch (error: any) {
        console.error(error.message, error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const search = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            keywords: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.query);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        const titles = [];
        const plans = await fsPromise.readdir(`${basePath}`);
        for (const plan of plans) {
            if (plan !== "temp") {
                const scriptFile = path.join(`${basePath}`, plan, `script.json`);
                if (fs.existsSync(scriptFile)) {
                    const scriptBinary = await fsPromise.readFile(scriptFile);
                    const scriptString = Buffer.from(scriptBinary).toString();
                    const res = scriptString.includes(`${value.keywords}`);
                    if (res) {
                        const scriptObject = JSON.parse(scriptString);
                        titles.push(scriptObject.title);
                    }
                }
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: titles,
        });
    } catch (error: any) {
        console.error(error.message, error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
