import fs from "fs";
import path from "path";
import multer from "multer";
import { LoggerSystem } from "../lib/Log";
import { Request, Response, NextFunction } from "express";
import { md5 } from "js-md5";

const basePath = process.env.UPLOAD_PATH;

const uploadVideo = (req: Request, res: Response, next: NextFunction) => {
    uploaderVideo.single("video")(req, res, (err) => {
        const errMsg = `Failed to upload the video.`;
        if (err instanceof multer.MulterError) {
            console.error(errMsg, err.message);
            return res.status(200).json({
                code: 0,
                message: err.message,
            });
        } else if (err) {
            console.error(errMsg, err.message);
            LoggerSystem.error(err.message);
            return res.status(200).json({ code: 0, message: errMsg });
        }
        next();
    });
};

const uploadJson = (req: Request, res: Response, next: NextFunction) => {
    uploaderJson.single("file")(req, res, (err) => {
        const errMsg = `Failed to upload the JSON file.`;
        if (err instanceof multer.MulterError) {
            console.error(errMsg, err.message);
            return res.status(200).json({
                code: 0,
                message: err.message,
            });
        } else if (err) {
            console.error(errMsg, err.message);
            LoggerSystem.error(err.message);
            return res.status(200).json({ code: 0, message: errMsg });
        }
        next();
    });
};

const uploadZip = (req: Request, res: Response, next: NextFunction) => {
    uploaderZip.single("zip")(req, res, (err) => {
        const errMsg = `Failed to upload the zip file.`;
        if (err instanceof multer.MulterError) {
            console.error(errMsg, err.message);
            return res.status(200).json({
                code: 0,
                message: err.message,
            });
        } else if (err) {
            console.error(errMsg, err.message);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: errMsg,
            });
        }
        next();
    });
};

const uploadImg = (req: Request, res: Response, next: NextFunction) => {
    uploaderImg.single("img")(req, res, (err) => {
        const errMsg = `Failed to upload the image.`;
        if (err instanceof multer.MulterError) {
            console.error(errMsg, err.message);
            return res.status(200).json({ code: 0, message: err.message });
        } else if (err) {
            console.error(errMsg, err.message);
            LoggerSystem.error(err.message);
            return res.status(200).json({ code: 0, message: errMsg });
        }
        next();
    });
};

const uploaderVideo = multer({
    limits: { fileSize: 1000 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const project = md5(file.originalname.split(".")[0]).slice(25);
                const uploadDir = `${basePath}/${project}`;
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            } catch (error: any) {
                console.error(error.message);
                LoggerSystem.error(error.message);
                cb(new Error(error.message), "");
            }
        },
        filename: (req, file, cb) => {
            cb(null, `origin.mp4`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|MP4/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("File extensions not allowed."));
        }
    },
});

const uploaderJson = multer({
    limits: { fileSize: 1000 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const project = `${req.query.project}`;
                if (project === "undefined" || !/^[a-zA-Z0-9]+$/g.test(project)) {
                    throw new Error("Project not allowed.");
                }
                const uploadDir = `${basePath}/${project}`;
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            } catch (error: any) {
                console.error(error.message);
                LoggerSystem.error(error.message);
                cb(new Error(error.message), "");
            }
        },
        filename: (req, file, cb) => {
            cb(null, `origin.json`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /json|JSON/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("File extensions not allowed."));
        }
    },
});

const uploaderZip = multer({
    limits: { fileSize: 1000 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const uploadDir = `${basePath}`;
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            } catch (error: any) {
                console.error(error.message);
                LoggerSystem.error(error.message);
                cb(new Error(error.message), "");
            }
        },
        filename: (req, file, cb) => {
            cb(null, `origin.zip`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /zip|ZIP/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("File extensions not allowed."));
        }
    },
});

const uploaderImg = multer({
    limits: { fileSize: 1000 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            try {
                const vocab = `${req.query.vocab}`;
                const project = `${req.query.project}`;
                if (vocab === "undefined" || !/^[a-zA-Z0-9_]+$/g.test(vocab)) {
                    throw new Error("Vocab not allowed.");
                }
                if (project === "undefined" || !/^[a-zA-Z0-9]+$/g.test(project)) {
                    throw new Error("Project not allowed.");
                }
                const uploadDir = path.join(`${basePath}`, project, "images");
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            } catch (error: any) {
                console.error(error.message);
                LoggerSystem.error(error.message);
                cb(new Error(error.message), "");
            }
        },
        filename: (req, file, cb) => {
            try {
                const vocab = `${req.query.vocab}`;
                if (vocab === "undefined" || !/^[a-zA-Z0-9_]+$/g.test(vocab)) {
                    throw new Error("Vocab not allowed.");
                }
                cb(null, `${vocab}.png`);
            } catch (error: any) {
                console.error(error.message);
                LoggerSystem.error(error.message);
                cb(new Error(error.message), "");
            }
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /png|jpg|jpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("File extensions or mimetype not allowed."));
        }
    },
});

export { uploadJson, uploadVideo, uploadZip, uploadImg };
