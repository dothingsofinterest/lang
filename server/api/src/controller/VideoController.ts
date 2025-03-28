import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { exec, execSync } from "child_process";
import { uploadVideo } from "../lib/Upload";
import { ServiceError } from "../exception/CustomError";

export const videoUpload = async (req: Request, res: Response, next: NextFunction) => {
    const folderPath = path.join("./", "uploads", "videos");
    fs.readdir(folderPath, (err, files) => {
        if (!err) {
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                fs.unlink(filePath, (err) => {});
            });
        }
    });
    uploadVideo.single("video")(req, res, (err) => {
        try {
            if (err) {
                throw new ServiceError(`${err.message}`);
            }
            if (!req.file) {
                throw new ServiceError(`Upload error`);
            }
            res.status(200).json({
                code: 1,
                message: `${req.file?.filename}`,
            });
        } catch (err: any) {
            next(err);
        }
    });
};

export const videoCompress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const videoFile = req.query.video as string;
        if (!videoFile) {
            throw new ServiceError(`Compress error`);
        }
        const input = `${process.env.UPLOAD_PATH}/videos/${req.query.video}`;
        const output = `${process.env.UPLOAD_PATH}/videos/${path.basename(videoFile, path.extname(videoFile))}_2.mp4`;
        execSync(`${process.env.FFMPEG_PATH} -i ${input} -vf scale=600:-2 -c:v libx264 -b:v 600k -profile:v baseline -level 3.0 -g 24 -c:a copy -r 24 -video_track_timescale 24 -vsync 1 -shortest -movflags faststart ${output}`);
        res.status(200).json({
            code: 1,
            message: `Success: ${process.env.SITE_STATIC}/videos/${path.basename(videoFile, path.extname(videoFile))}_2.mp4`,
        });
    } catch (err: any) {
        next(err);
    }
};
