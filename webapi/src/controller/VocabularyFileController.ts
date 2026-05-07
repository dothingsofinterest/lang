import fs, { promises as fsPromise } from "fs";
import path from "path";
import Joi from "joi";
import Database from "better-sqlite3";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import { concatSpeech } from "../utils/FFmpeg";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;
const dbFile = path.join(`${process.env.DATA_PATH}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

export const moveFile = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            image: Joi.string().allow(null, ""),
            speech: Joi.string().allow(null, ""),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        let fileSpeech = ``;
        let fileImage = ``;
        const tempFolder = path.join(`${uploadPath}`, `temp`);
        const todayFolder = new Date().toISOString().slice(0, 10);
        if (value.speech) {
            const fileOrigin = path.join(tempFolder, value.speech);
            if (fs.existsSync(fileOrigin)) {
                const speechFolder = path.join(`${dataPath}`, `speech`);
                const speechDateFolder = path.join(speechFolder, todayFolder);
                if (!fs.existsSync(speechDateFolder)) {
                    fs.mkdirSync(speechDateFolder, { recursive: true });
                }
                const fileTarget = path.join(speechDateFolder, value.speech);
                fs.renameSync(fileOrigin, fileTarget);
                fileSpeech = `${todayFolder}/${value.speech}`;
            }
        }
        if (value.image) {
            const fileOrigin = path.join(tempFolder, value.image);
            if (fs.existsSync(fileOrigin)) {
                const imageFolder = path.join(`${dataPath}`, `image`);
                const imageDateFolder = path.join(imageFolder, new Date().toISOString().slice(0, 10));
                if (!fs.existsSync(imageDateFolder)) {
                    fs.mkdirSync(imageDateFolder, { recursive: true });
                }
                const fileTarget = path.join(imageDateFolder, value.image);
                fs.renameSync(fileOrigin, fileTarget);
                fileImage = `${todayFolder}/${value.image}`;
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                speech: fileSpeech,
                image: fileImage,
            },
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const removeFile = (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            image: Joi.string().allow(null, ""),
            speech: Joi.string().allow(null, ""),
        });
        const { error, value } = schema.validate(req.body);
        if (error) {
            console.error("Failed to validate params: ", error.message);
            return res.status(200).json({
                code: 0,
                message: error.message,
            });
        }
        if (value.speech) {
            const speechFile = path.join(`${dataPath}`, "speech", value.speech);
            if (fs.existsSync(speechFile)) {
                fs.unlinkSync(speechFile);
            }
        }
        if (value.image) {
            const imageFile = path.join(`${dataPath}`, `image`, value.image);
            if (fs.existsSync(imageFile)) {
                fs.unlinkSync(imageFile);
            }
        }
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

export const uploadImage = (req: Request, res: Response) => {
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

export const exportSpeech = async (req: Request, res: Response) => {
    try {
        // prettier-ignore
        const list = db.prepare(`SELECT id, speech FROM vocabulary`).all();
        const listSorted = [...list].sort((a: any, b: any) => {
            const nameA = a.speech.split("/").pop();
            const nameB = b.speech.split("/").pop();
            return nameA.localeCompare(nameB);
        });
        const listPathSorted = listSorted.map((item: any) => item.speech);
        const files: string[] = [];
        const fileInput = path.join(`${dataPath}`, "speech_list2.txt");
        const fileOutput = path.join(`${dataPath}`, "speech_all.mp3");
        listPathSorted.forEach((item: any) => {
            const fullPath = path.join(`${dataPath}`, "speech", item);
            if (fs.existsSync(fullPath)) {
                files.push(`file '${fullPath}'`);
            } else {
                LoggerSystem.info(`contact failed: ${fullPath}`);
            }
        });
        console.log(files);
        // const baseDir = path.join(`${dataPath}`, "speech");
        // const output = path.join(`${dataPath}`, "speech_all.mp3");

        // const files: string[] = [];
        // const dirs = (await fsPromise.readdir(baseDir)).sort();
        // for (const dir of dirs) {
        //     const fullDir = path.join(baseDir, dir);
        //     const stat = await fsPromise.stat(fullDir);
        //     if (!stat.isDirectory()) continue;
        //     // const subFiles = (await fsPromise.readdir(fullDir)).sort();
        //     const subFiles = (await fsPromise.readdir(fullDir)).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
        //     for (const f of subFiles) {
        //         if (!f.endsWith(".mp3")) continue;
        //         const fullPath = path.join(fullDir, f);
        //         const safePath = fullPath.replace(/'/g, "'\\''");
        //         files.push(`file '${safePath}'`);
        //     }
        // }
        if (!files.length) {
            return res.status(200).json({
                code: 0,
                message: `Failed.`,
            });
        }
        await fsPromise.writeFile(fileInput, files.join("\n"), "utf-8");
        await concatSpeech(fileInput, fileOutput);
        // const stat = fs.statSync(output);
        // const fileSize = stat.size;
        // res.setHeader("Content-Length", fileSize);
        // res.setHeader("Content-Type", "audio/mpeg");
        // const stream = fs.createReadStream(output);
        // stream.pipe(res);
        // stream.on("error", (err) => {
        //     return res.status(200).json({
        //         code: 0,
        //         message: `Failed.`,
        //     });
        // });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
