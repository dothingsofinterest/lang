import fs from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { enhanceDialogueAndExtractMP3 } from "../utils/FFmpeg";
import { waveformCreate as waveformCreateService } from "../service/Audio";

const videoFile = "video.mp4";
const audioFile = "origin.mp3";
const JsonFile = "audiowaveform.json";
const scriptFile = "script.json";
const basePath = process.env.UPLOAD_PATH;

export const videoImport = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
    const plan = path.basename(req.file?.destination);
    const planPath = path.join(`${basePath}`, plan);
    const vocabImagesFolder = path.join(planPath, "vocab_images");
    if (!fs.existsSync(vocabImagesFolder)) {
        fs.mkdirSync(vocabImagesFolder, { recursive: true });
    }
    const vocabPronunciationsFolder = path.join(planPath, "vocab_pronunciations");
    if (!fs.existsSync(vocabPronunciationsFolder)) {
        fs.mkdirSync(vocabPronunciationsFolder, { recursive: true });
    }
    const script = path.join(planPath, scriptFile);
    if (!fs.existsSync(script)) {
        fs.writeFileSync(script, "");
    }
    res.status(200).json({
        code: 1,
        message: `Succeed.`,
        data: { plan },
    });
};

export const waveformCreate = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        plan: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const planPath = path.join(`${basePath}`, value.plan);
    if (!fs.existsSync(planPath)) {
        return res.status(200).json({
            code: 0,
            message: `Plan does not exist.`,
        });
    }
    const inputVideo = path.join(planPath, videoFile);
    if (!fs.existsSync(inputVideo)) {
        return res.status(200).json({
            code: 0,
            message: `Input video does not exist.`,
        });
    }
    try {
        const outputJson = path.join(planPath, JsonFile);
        if (!fs.existsSync(outputJson)) {
            const outputAudio = path.join(planPath, audioFile);
            if (!fs.existsSync(outputAudio)) {
                await enhanceDialogueAndExtractMP3(inputVideo, outputAudio);
            }
            await waveformCreateService(`${outputAudio}`, `${outputJson}`);
            fs.unlinkSync(outputAudio);
        }
        fs.unlinkSync(inputVideo);
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: { filename: `${JsonFile}` },
        });
    } catch (error: any) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
