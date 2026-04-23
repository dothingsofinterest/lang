import fs from "fs";
import path from "path";
import multer from "multer";
import { LoggerSystem } from "../lib/Log";
import { Request, Response, NextFunction } from "express";
import { md5 } from "js-md5";

const basePath = process.env.UPLOAD_PATH;

export const upload = (req: Request, res: Response, next: NextFunction) => {
    uploader.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error(err.message);
            LoggerSystem.error(err.message);
        } else if (err) {
            console.error(err.message);
            LoggerSystem.error(err.message);
        }
        next();
    });
};

const uploader = multer({
    limits: { fileSize: 9000 * 1024 * 1024 }, // 9GB
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                if (file.mimetype === "video/mp4") {
                    const videoPath = path.join(`${basePath}`, `temp`);
                    if (!fs.existsSync(videoPath)) {
                        fs.mkdirSync(videoPath, { recursive: true });
                    }
                    cb(null, videoPath);
                } else if (file.mimetype === "application/x-zip-compressed" || file.mimetype === "application/json") {
                    const videoHash = `${req.query.hash}`;
                    if (videoHash === "undefined" || !/^[a-zA-Z0-9]+$/g.test(videoHash)) {
                        throw new Error("hash is missing.");
                    }
                    const videoPath = path.join(`${basePath}`, `${videoHash}`);
                    if (!fs.existsSync(videoPath)) {
                        throw new Error("Video does not exist.");
                    }
                    cb(null, videoPath);
                } else {
                    const tempPath = path.join(`${basePath}`, `temp`);
                    if (!fs.existsSync(tempPath)) {
                        fs.mkdirSync(tempPath, { recursive: true });
                    }
                    cb(null, tempPath);
                }
            } catch (error: any) {
                console.error(error.message);
                LoggerSystem.error(error.message);
                cb(new Error(error.message), "");
            }
        },
        filename: (req, file, cb) => {
            if (file.mimetype === "video/mp4") {
                cb(null, `video.mp4`);
            } else if (file.mimetype === "application/x-zip-compressed") {
                cb(null, `data.zip`);
            } else if (file.mimetype === "application/json") {
                cb(null, `${file.originalname}`);
            } else if (file.mimetype === "audio/mpeg") {
                cb(null, `${file.originalname}`);
            } else if (file.mimetype === "audio/wav") {
                cb(null, `${file.originalname}`);
            } else if (file.mimetype === "image/png") {
                cb(null, `${file.originalname}`);
            } else if (file.mimetype === "image/jpeg") {
                cb(null, `${file.originalname}`);
            } else {
                cb(new Error("File extensions not allowed"), "");
            }
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|zip|json|mp3|mpeg|wav|png|jpg|jpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("File extensions not allowed."));
        }
    },
});
