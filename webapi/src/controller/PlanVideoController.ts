import fs from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { enhanceDialogueAndExtractMP3, extractAudio } from "../utils/FFmpeg";
import { waveformCreate as waveformCreateService } from "../service/Audio";

const basePath = process.env.UPLOAD_PATH;
const fileNameVideoFile = "video.mp4";
const fileNameAudioEnhanced = "audio_enhanced.mp3";
const fileNameAudio = "audio.mp3";
const fileNameAudiowaveform = "audiowaveform.json";
const fileNameScript = "script.json";
const fileNameDiary = "diary.json";

export const videoImport = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
    res.status(200).json({
        code: 1,
        message: `Succeed.`,
        data: { plan: path.basename(req.file?.destination) },
    });
};

export const videoInit = async (req: Request, res: Response, next: NextFunction) => {
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
    const videoPath = path.join(planPath, fileNameVideoFile);
    if (!fs.existsSync(videoPath)) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    try {
        // Create folder vocab images
        const vocabImagesFolder = path.join(planPath, "vocab_images");
        if (!fs.existsSync(vocabImagesFolder)) {
            fs.mkdirSync(vocabImagesFolder, { recursive: true });
        }
        // Create folder vocab pronunciations
        const vocabPronunciationsFolder = path.join(planPath, "vocab_pronunciations");
        if (!fs.existsSync(vocabPronunciationsFolder)) {
            fs.mkdirSync(vocabPronunciationsFolder, { recursive: true });
        }
        // Create script file
        const dataScript = path.join(planPath, fileNameScript);
        if (!fs.existsSync(dataScript)) {
            fs.writeFileSync(dataScript, "");
        }
        // Create diary file
        const fileDiary = path.join(planPath, fileNameDiary);
        if (!fs.existsSync(fileDiary)) {
            fs.writeFileSync(fileDiary, "");
        }
        // Create file waveform
        const audiowaveform = path.join(planPath, fileNameAudiowaveform);
        if (!fs.existsSync(audiowaveform)) {
            const outputAudio = path.join(planPath, fileNameAudioEnhanced);
            await enhanceDialogueAndExtractMP3(videoPath, outputAudio);
            await waveformCreateService(`${outputAudio}`, `${audiowaveform}`);
            fs.unlinkSync(outputAudio);
        }
        // Create file audio
        const audio = path.join(planPath, fileNameAudio);
        if (!fs.existsSync(audio)) {
            await extractAudio(videoPath, audio);
        }
        fs.unlinkSync(videoPath);
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                audio: `${fileNameAudio}`,
                audiowaveform: `${fileNameAudiowaveform}`,
            },
        });
    } catch (error: any) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
