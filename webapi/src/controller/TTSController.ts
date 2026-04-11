import path from "path";
import fs, { promises as fsPromise } from "fs";
import Joi from "joi";
import { LoggerSystem } from "../lib/Log";
import { Request, Response } from "express";
import { speechGenerate as speechGenerateByGoogle } from "../service/TTSGoogle";
import { speechGenerate as speechGenerateByPyttsx3 } from "../service/TTSPyttsx3";
import { speechGenerate as speechGenerateByBaidu } from "../service/TTSBaidu";
import { getAudioCodec, transcodeToMp3 } from "../utils/FFmpeg";

const basePath = process.env.UPLOAD_PATH;

export const textToSpeech = async (req: Request, res: Response) => {
    const schemaQuery = Joi.object({
        engine: Joi.number().required(),
        content: Joi.string().required(),
        filename: Joi.string().required(),
        voice: Joi.number().required(),
        speed: Joi.number().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        return res.status(200).json({
            code: 0,
            message: `Failed to validate params.`,
        });
    }
    try {
        if (valueQuery.engine === 0) {
            await speechGenerateByGoogle(valueQuery.content, valueQuery.filename);
        } else if (valueQuery.engine === 1) {
            await speechGenerateByBaidu(valueQuery.content, valueQuery.filename);
        } else if (valueQuery.engine === 2) {
            await speechGenerateByPyttsx3(valueQuery.content, valueQuery.filename, valueQuery.voice, valueQuery.speed);
        }
        return res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const uploadSpeech = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
    res.status(200).json({
        code: 1,
        message: `Succeed.`,
        data: { filename: req.file.originalname },
    });
};

export const batchTranscodeToMp3 = async (req: Request, res: Response) => {
    const schemaQuery = Joi.object({
        hash: Joi.string().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        return res.status(200).json({
            code: 0,
            message: `Failed to validate params.`,
        });
    }
    const videoFolder = path.join(`${basePath}`, valueQuery.hash);
    if (!fs.existsSync(videoFolder)) {
        return res.status(200).json({
            code: 0,
            message: `Video folder does not exist.`,
        });
    }
    const vocabPronunciationsFolder = path.join(videoFolder, "vocab_pronunciations");
    if (!fs.existsSync(vocabPronunciationsFolder)) {
        return res.status(200).json({
            code: 0,
            message: `Pronunciations folder does not exist.`,
        });
    }
    try {
        const filesVocabPronunciations = await fsPromise.readdir(vocabPronunciationsFolder);
        for (const pronunciation of filesVocabPronunciations) {
            const pronunciationFilePath = path.join(vocabPronunciationsFolder, pronunciation);
            const realFormat = await getAudioCodec(pronunciationFilePath);
            console.log(`${pronunciation}: ${realFormat}`);
            if (realFormat !== "mp3") {
                const filename = pronunciation.split(".")[0];
                const audioWav = path.join(vocabPronunciationsFolder, `${filename}.wav`);
                fs.renameSync(pronunciationFilePath, audioWav);
                await transcodeToMp3(audioWav, pronunciationFilePath);
                await new Promise((r) => setTimeout(r, 200));
                fs.unlinkSync(audioWav);
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (err: any) {
        LoggerSystem.error(err.message);
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    }
};
