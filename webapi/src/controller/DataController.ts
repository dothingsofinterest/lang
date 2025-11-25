import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import AdmZip from "adm-zip";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import { audioGenerate } from "../service/Tts";

const basePath = process.env.UPLOAD_PATH;

export const dataImport = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
    try {
        const zip = new AdmZip(req.file.path);
        zip.extractAllTo(path.join(`${req.file.destination}`), true);
        fs.unlinkSync(req.file.path);
        return res.status(200).json({
            code: 1,
            message: `Succeed.`,
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

export const dataExport = async (req: Request, res: Response) => {
    const schema = Joi.object({
        plan: Joi.string().required(),
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
        const zipFolder = path.join(`${basePath}`, value.plan);
        const zipFile = path.join(zipFolder, `data.zip`);
        const zip = new AdmZip();
        zip.addLocalFolder(zipFolder);
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
            console.error(err);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Failed.`,
            });
        });
    } catch (error: any) {
        console.error(error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const scriptSync = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
    const scriptBinary = await fsPromise.readFile(req.file.path);
    const scriptString = Buffer.from(scriptBinary).toString();
    const scriptObject = JSON.parse(scriptString);
    const vocabImages = scriptObject.vocabs.filter((v: any) => v.image).map((v: any) => v.image);
    const vocabPronunciations = scriptObject.vocabs.map((v: any) => v.pronunciation);
    if (vocabImages.length > 0) {
        const pathVocabImages = path.join(req.file.destination, "vocab_images");
        const filesVocabImages = await fsPromise.readdir(pathVocabImages);
        for (const image of filesVocabImages) {
            if (!vocabImages.includes(image)) {
                fs.unlinkSync(path.join(pathVocabImages, image));
            }
        }
    }
    if (vocabPronunciations.length > 0) {
        const pathVocabPronunciations = path.join(req.file.destination, "vocab_pronunciations");
        const filesVocabPronunciations = await fsPromise.readdir(pathVocabPronunciations);
        for (const pronunciation of filesVocabPronunciations) {
            if (!vocabPronunciations.includes(pronunciation)) {
                fs.unlinkSync(path.join(pathVocabPronunciations, pronunciation));
            }
        }
    }
    res.status(200).json({
        code: 1,
        message: `Succeed.`,
    });
};

export const vocabImageUpload = (req: Request, res: Response) => {
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

export const vocabPronunciationUpload = (req: Request, res: Response) => {
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

export const vocabPronunciationGenerate = async (req: Request, res: Response) => {
    const schemaQuery = Joi.object({
        content: Joi.string().required(),
        filename: Joi.string().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        return res.status(200).json({
            code: 0,
            message: `Failed to validate params.`,
        });
    }
    try {
        const base64Data = await audioGenerate(valueQuery.content, valueQuery.filename);
        return res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: base64Data,
        });
    } catch (error: any) {
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const vocabImagePronunciationMove = (req: Request, res: Response) => {
    const schema = Joi.object({
        plan: Joi.string().required(),
        vocabImage: Joi.string().required(),
        vocabPronunciation: Joi.string().required(),
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
        const planPath = path.join(`${basePath}`, value.plan);
        if (!fs.existsSync(planPath)) {
            return res.status(200).json({
                code: 0,
                message: `Plan does not exist.`,
            });
        }
        const tempPath = path.join(`${basePath}`, `temp`);
        if (!fs.existsSync(tempPath)) {
            fs.mkdirSync(tempPath, { recursive: true });
        }
        const imageTempFile = path.join(tempPath, value.vocabImage);
        if (fs.existsSync(imageTempFile)) {
            fs.renameSync(imageTempFile, path.join(planPath, "vocab_images", value.vocabImage));
        }
        const pronunciationTempFile = path.join(tempPath, value.vocabPronunciation);
        if (fs.existsSync(pronunciationTempFile)) {
            fs.renameSync(pronunciationTempFile, path.join(planPath, "vocab_pronunciations", value.vocabPronunciation));
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        console.error(error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const vocabImagePronunciationRemove = (req: Request, res: Response) => {
    const schema = Joi.object({
        plan: Joi.string().required(),
        vocabImage: Joi.string().required(),
        vocabPronunciation: Joi.string().required(),
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
        const planPath = path.join(`${basePath}`, value.plan);
        if (!fs.existsSync(planPath)) {
            return res.status(200).json({
                code: 0,
                message: `Plan does not exist.`,
            });
        }
        const imageFile = path.join(planPath, "vocab_images", value.vocabImage);
        if (fs.existsSync(imageFile)) {
            fs.unlinkSync(imageFile);
        }
        const pronunciationFile = path.join(planPath, "vocab_pronunciations", value.vocabPronunciation);
        if (fs.existsSync(pronunciationFile)) {
            fs.unlinkSync(pronunciationFile);
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        console.error(error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
