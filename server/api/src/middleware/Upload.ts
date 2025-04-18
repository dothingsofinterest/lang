import fs from "fs";
import path from "path";
import multer from "multer";
import { LoggerSystem } from "../lib/Log";
import { Request, Response, NextFunction } from "express";
import { md5 } from "js-md5";

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
        try {
            const uploadPath = process.env.UPLOAD_PATH;
            const project = md5(file.originalname.split(".")[0]).slice(25);
            const dir = req.user?.id ? `${uploadPath}/user${req.user.id}/${project}` : `${uploadPath}/anonymous/${project}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        } catch (error: any) {
            console.error(error.message);
            LoggerSystem.error(error.message);
            cb(null, "abcdefgh");
        }
    },
    filename: (req, file, cb) => {
        cb(null, `origin.mp4`);
    },
});

const storageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const uploadPath = process.env.UPLOAD_PATH;
            const project = md5(file.originalname.split(".")[0]).slice(25);
            const dir = req.user?.id ? `${uploadPath}/user${req.user.id}/${project}` : `${uploadPath}/anonymous/${project}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        } catch (error: any) {
            console.error(error.message);
            LoggerSystem.error(error.message);
            cb(null, "abcdefgh");
        }
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
