import { Request, Response, NextFunction, query } from "express";
import AdmZip from "adm-zip";
import fs, { promises as fsPromise } from "fs";
import { LoggerSystem } from "../lib/Log";
import Joi from "joi";
import path from "path";

export const importScript = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        console.error("Failed to find the file.");
        return res.status(200).json({
            code: 0,
            message: `Failed to find the file.`,
        });
    }
    res.status(200).json({ code: 1, message: `Import succeed.` });
};

export const importVocabImg = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.error("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    if (!fs.existsSync(path.join(`${req.file?.destination}`, value.project))) {
        return res.status(200).json({ code: 0, message: `Project does not exist.` });
    }
    if (!req.file) {
        return res.status(200).json({ code: 0, message: `Failed to find the vocabs img zip` });
    }
    try {
        const zip = new AdmZip(req.file.path);
        zip.extractAllTo(path.join(`${req.file.destination}`, value.project, `images`), true);
        fs.unlinkSync(req.file.path);
        res.status(200).json({
            code: 1,
            message: `Upload succeed.`,
            data: ``,
        });
    } catch (error: any) {
        console.error(error.message, error);
        LoggerSystem.error(error.message);
        return res.status(200).json({ code: 0, message: error.message });
    }
};

export const streamVocabImg = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.string().required(),
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
        const zipFile = path.join(`${process.env.UPLOAD_PATH}`, value.project, `images.zip`);
        const zip = new AdmZip();
        zip.addLocalFolder(path.join(`${process.env.UPLOAD_PATH}`, value.project, `images`));
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

export const uploadVocabImg = async (req: Request, res: Response) => {
    if (!req.file) {
        console.error("Failed to find the image.");
        return res.status(200).json({ code: 0, message: `Failed to find the image.` });
    }
    res.status(200).json({
        code: 1,
        message: `Succeed to upload.`,
        data: { filename: `${req.query.vocab}.png` },
    });
};
