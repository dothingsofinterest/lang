import fs from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import { clipAudio } from "../utils/FFmpeg";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;

export const clip = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            scriptId: Joi.number().required(),
            start: Joi.number().required(),
            end: Joi.number().required(),
        });
        const { error, value } = schema.validate(req.query);
        if (error) {
            console.error("Failed to validate params: ", error.message);
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        const audioPath = path.join(`${dataPath}`, `${value.scriptId}`, `audio.mp3`);
        if (!fs.existsSync(audioPath)) {
            return res.status(200).json({
                code: 0,
                message: `Audio does not exist.`,
            });
        }
        const tempPath = path.join(`${uploadPath}`, `temp`);
        if (!fs.existsSync(tempPath)) {
            return res.status(200).json({
                code: 0,
                message: `Temp folder does not exist.`,
            });
        }
        const fileName = `${Date.now()}.mp3`;
        const outputPath = path.join(tempPath, fileName);
        await clipAudio(audioPath, value.start, value.end, outputPath);
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: fileName,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
