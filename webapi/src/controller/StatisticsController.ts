import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";

const basePath = process.env.UPLOAD_PATH;

export const countVocab = async (req: Request, res: Response) => {
    try {
        let videoCount = 0;
        let videoVocabCount = 0;
        const videoFolders = await fsPromise.readdir(`${basePath}`);
        for (const videoFolder of videoFolders) {
            if (videoFolder !== "temp") {
                videoCount++;
                const scriptFile = path.join(`${basePath}`, videoFolder, `script.json`);
                if (fs.existsSync(scriptFile)) {
                    const fileBinary = await fsPromise.readFile(scriptFile);
                    const fileString = Buffer.from(fileBinary).toString();
                    if (fileString.length > 0) {
                        const fileObject = JSON.parse(fileString);
                        if (fileObject.hasOwnProperty("vocab")) {
                            videoVocabCount += fileObject.vocab.length;
                        }
                    }
                }
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                videoCount,
                videoVocabCount,
            },
        });
    } catch (error: any) {
        LoggerSystem.error(error);
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
        const videoFolders = await fsPromise.readdir(`${basePath}`);
        for (const videoFolder of videoFolders) {
            if (videoFolder !== "temp") {
                const scriptFile = path.join(`${basePath}`, videoFolder, `script.json`);
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
