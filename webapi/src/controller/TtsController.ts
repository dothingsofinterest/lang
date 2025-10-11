import { Request, Response } from "express";
import { generateAudio, searchAudio } from "../service/Tts";
import { LoggerSystem } from "../lib/Log";
import { Response as HttpResponse } from "../types/Http";
import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import AdmZip from "adm-zip";

const httpResponse: HttpResponse = { code: 1, message: `success`, data: `` };

export const conGenerate = async (req: Request, res: Response) => {
    const schemaQuery = Joi.object({
        type: Joi.number().integer().valid(1, 2, 3).required(), // 1:EN, 2:CN, 3:external audio
        content: Joi.string().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        console.error("Failed to validate params: ", errorQuery.message);
        httpResponse.code = 0;
        httpResponse.message = errorQuery.message;
        return res.status(200).json(httpResponse);
    }
    try {
        let sound: string;
        if (valueQuery.type === 3) {
            sound = await searchAudio(valueQuery.content.replaceAll(", ", "_"));
        } else {
            sound = await generateAudio(valueQuery.content, valueQuery.type);
        }
        httpResponse.code = 1;
        httpResponse.message = `success`;
        httpResponse.data = sound;
        return res.json(httpResponse);
    } catch (error: any) {
        console.error("Failed to tts: ", error);
        LoggerSystem.error(error.message);
        httpResponse.code = 0;
        httpResponse.message = `Failed to tts.`;
        return res.status(200).json(httpResponse);
    }
};

export const importTts = async (req: Request, res: Response) => {
    const errMsg = `Failed to find the tts zip`;
    if (!req.file) {
        console.error(errMsg);
        return res.status(200).json({ code: 0, message: errMsg });
    }
    try {
        const zip = new AdmZip(req.file.path);
        zip.extractAllTo(`${req.file.destination}/tts`, true);
        fs.unlinkSync(req.file.path);
        res.status(200).json(httpResponse);
    } catch (error: any) {
        console.error(errMsg, error);
        LoggerSystem.error(error.message);
        httpResponse.code = 0;
        httpResponse.message = errMsg;
        return res.status(200).json(httpResponse);
    }
};

export const streamTts = async (req: Request, res: Response) => {
    try {
        const zipFile = path.join(`${process.env.UPLOAD_PATH}`, `tts.zip`);
        const zip = new AdmZip();
        zip.addLocalFolder(path.join(`${process.env.UPLOAD_PATH}`, "tts"));
        zip.writeZip(zipFile);
        const stat = fs.statSync(zipFile);
        const fileSize = stat.size;
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", "application/zip");
        const videoStream = fs.createReadStream(zipFile);
        videoStream.pipe(res);
        res.on("finish", () => {
            fs.unlinkSync(zipFile);
        });
        videoStream.on("error", (err) => {
            console.error("send stream error: ", err);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Failed to download.`,
            });
        });
    } catch (error: any) {
        console.error("send stream error: ", error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed to download.`,
        });
    }
};
