import fs from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import { concatSpeech, clipAudio, getAudioCodec } from "../utils/FFmpeg";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;

export const clip = async (req: Request, res: Response) => {
    const schema = Joi.object({
        videoID: Joi.number().required(),
        name: Joi.string().required(),
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
    const audioPath = path.join(`${dataPath}`, `${value.videoID}`, `audio.mp3`);
    if (!fs.existsSync(audioPath)) {
        return res.status(200).json({
            code: 0,
            message: `Audio does not exist.`,
        });
    }
    try {
        const pathUploadTemp = path.join(`${uploadPath}`, `temp`);
        const outputPath = path.join(pathUploadTemp, `${value.name}.mp3`);
        await clipAudio(audioPath, value.start, value.end, outputPath);
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
