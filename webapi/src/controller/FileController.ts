import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;

export const uploadImage = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(200).json({
                code: 0,
                message: `Failed.`,
            });
        }
        let fileImage = ``;
        if (req.file.originalname) {
            const tempFolder = path.join(`${uploadPath}`, `temp`);
            const fileOrigin = path.join(tempFolder, req.file.originalname);
            if (fs.existsSync(fileOrigin)) {
                const todayFolder = new Date().toISOString().slice(0, 10);
                const imageFolder = path.join(`${dataPath}`, `image`);
                const imageDateFolder = path.join(imageFolder, todayFolder);
                if (!fs.existsSync(imageDateFolder)) {
                    fs.mkdirSync(imageDateFolder, { recursive: true });
                }
                const fileTarget = path.join(imageDateFolder, req.file.originalname);
                fs.renameSync(fileOrigin, fileTarget);
                fileImage = `${todayFolder}/${req.file.originalname}`;
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: fileImage,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
