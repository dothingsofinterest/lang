import path from "path";
import multer from "multer";

const storageVideo = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${process.env.UPLOAD_PATH}/videos/`;
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const storageImage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `${process.env.UPLOAD_PATH}/images/`;
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const uploadVideo = multer({
    storage: storageVideo,
    limits: { fileSize: 1000 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|mkv|avi|mov|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(null, false); // 拒绝文件
        }
    },
});

export { uploadVideo };
