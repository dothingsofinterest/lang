import fs from "fs";
import path from "path";
import multer from "multer";

const storageVideo = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${process.env.UPLOAD_PATH}/${Date.now()}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `origin.mp4`);
    },
});

const storageJSON = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${process.env.UPLOAD_PATH}/${req.query.project}`;
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `origin.json`);
    },
});

const videoUploader = multer({
    storage: storageVideo,
    limits: { fileSize: 1000 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|MP4/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(null, false); // 拒绝文件
        }
    },
});

const scriptUploader = multer({
    storage: storageJSON,
    limits: { fileSize: 1000 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /json|JSON/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(null, false); // 拒绝文件
        }
    },
});

export { videoUploader, scriptUploader };
