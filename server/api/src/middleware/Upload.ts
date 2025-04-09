import fs from "fs";
import path from "path";
import multer from "multer";
import { LoggerSystem } from "../lib/Log";
import { Request, Response, NextFunction } from "express";

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    uploaderFile.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error(`Failed to upload file: `, err.message);
            return res.status(200).json({
                code: 0,
                message: err.message,
            });
        } else if (err) {
            console.error(`Failed to upload file - 2: `, err.message);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Failed to upload file - 2.`,
            });
        }
        next();
    });
};

const uploadVideo = (req: Request, res: Response, next: NextFunction) => {
    uploaderVideo.single("video")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error(`Failed to upload video: `, err.message);
            return res.status(200).json({
                code: 0,
                message: err.message,
            });
        } else if (err) {
            console.error(`Failed to upload video - 2: `, err.message);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Failed to upload video - 2.`,
            });
        }
        next();
    });
};

const storageVideo = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${process.env.UPLOAD_PATH}/${Date.now()}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `origin.mp4`);
    },
});

const storageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${process.env.UPLOAD_PATH}/${req.query.project}`;
        cb(null, fs.existsSync(dir) ? dir : "abcdefg");
    },
    filename: (req, file, cb) => {
        cb(null, `origin.json`);
    },
});

const uploaderVideo = multer({
    storage: storageVideo,
    limits: { fileSize: 1000 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|MP4/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Video ext error."));
        }
    },
});

const uploaderFile = multer({
    storage: storageFile,
    limits: { fileSize: 1000 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /json|JSON/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("File ext error."));
        }
    },
});

export { uploadFile, uploadVideo };
