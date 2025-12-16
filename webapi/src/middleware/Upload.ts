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
                    const plan = md5(file.originalname.split(".")[0]).slice(25);
                    const uploadPath = path.join(`${basePath}`, `${plan}`);
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                } else if (file.mimetype === "application/x-zip-compressed" || file.mimetype === "application/json") {
                    const plan = `${req.query.plan}`;
                    if (plan === "undefined" || !/^[a-zA-Z0-9]+$/g.test(plan)) {
                        throw new Error("Plan parameter is missing.");
                    }
                    const uploadPath = path.join(`${basePath}`, `${plan}`);
                    if (!fs.existsSync(uploadPath)) {
                        throw new Error("Plan does not exist.");
                    }
                    cb(null, uploadPath);
                } else {
                    const uploadPath = path.join(`${basePath}`, `temp`);
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
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
                cb(null, `script.json`);
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
