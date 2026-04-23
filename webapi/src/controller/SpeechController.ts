import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import { concatSpeech, getAudioCodec, transcodeToMp3 } from "../utils/FFmpeg";
import { speechGenerate as speechGenerateByGoogle } from "../service/TTSGoogle";
import { speechGenerate as speechGenerateByPyttsx3 } from "../service/TTSPyttsx3";
import { speechGenerate as speechGenerateByBaidu } from "../service/TTSBaidu";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;

export const concat = async (req: Request, res: Response) => {
    const schema = Joi.object({
        videoIDs: Joi.array().items(Joi.number()).required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.error("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        const speechFiles: string[] = [];
        const speechListFileName = path.join(`${uploadPath}`, `temp`, "speech.txt");
        value.videoIDs.forEach(async (id: number) => {
            const pcFolder = path.join(`${dataPath}`, `${id}`, `speech`);
            if (fs.existsSync(pcFolder)) {
                const allFiles = fs.readdirSync(pcFolder);
                for (const f of allFiles) {
                    const filePath = path.join(pcFolder, f);
                    const fileRealFormat = await getAudioCodec(filePath);
                    if (f.endsWith(".mp3") && fileRealFormat === "mp3") {
                        speechFiles.push(filePath);
                    } else {
                        LoggerSystem.info(`contact failed: ${f}: ${fileRealFormat}`);
                    }
                }
            }
        });
        if (speechFiles.length > 0) {
            fs.writeFileSync(speechListFileName, speechFiles.map((f) => `file '${f}'`).join("\n"));
        }
        const output = path.join(`${uploadPath}`, `temp`, "concat.mp3");
        await concatSpeech(speechListFileName, output);
        const stat = fs.statSync(output);
        const fileSize = stat.size;
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", "audio/mpeg");
        const stream = fs.createReadStream(output);
        stream.pipe(res);
        res.on("finish", () => {
            fs.unlinkSync(output);
        });
        stream.on("error", (err) => {
            return res.status(200).json({
                code: 0,
                message: `Failed.`,
            });
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

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

export const upload = (req: Request, res: Response) => {
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
        videoID: Joi.number().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        return res.status(200).json({
            code: 0,
            message: `Failed to validate params.`,
        });
    }
    const speechFolderPath = path.join(`${dataPath}`, `${valueQuery.videoID}`, "speech");
    if (!fs.existsSync(speechFolderPath)) {
        return res.status(200).json({
            code: 0,
            message: `Video folder does not exist.`,
        });
    }
    try {
        const speechFiles = await fsPromise.readdir(speechFolderPath);
        for (const speechFile of speechFiles) {
            const speechFilePath = path.join(speechFolderPath, speechFile);
            const realFormat = await getAudioCodec(speechFilePath);
            console.log(`${speechFile}: ${realFormat}`);
            if (realFormat !== "mp3") {
                const filename = speechFile.split(".")[0];
                const audioWav = path.join(speechFolderPath, `${filename}.wav`);
                fs.renameSync(speechFilePath, audioWav);
                await transcodeToMp3(audioWav, speechFilePath);
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
