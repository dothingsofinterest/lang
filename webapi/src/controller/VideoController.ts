import fs, { promises as fsPromise } from "fs";
import { Request, Response, NextFunction } from "express";
import { LoggerSystem } from "../lib/Log";
import { compressVideo as utilCompressVideo, compressVideoBefore as utilCompressVideoBefore, copyVideo as utilCopyVideo } from "../utils/FFmpeg";
import path from "path";
import Joi from "joi";

export const importVideo = async (req: Request, res: Response) => {
    if (!req.file) {
        console.error("Failed to find the video.");
        return res.status(200).json({
            code: 0,
            message: `Failed to find the video.`,
        });
    }
    res.status(200).json({
        code: 1,
        message: `Succeed to upload.`,
        data: {
            project: `${req.file?.destination.split("/").reverse()[0]}`,
        },
    });
};

export const streamVideo = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.string().required(),
        video: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.log("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const projectPath = `${process.env.UPLOAD_PATH}/user${req.user?.id}/${value.project}`;
    if (!fs.existsSync(projectPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project does not exist.`,
        });
    }
    const videoPath = `${projectPath}/${value.video}`;
    console.log("videoPath", videoPath);
    if (!fs.existsSync(videoPath)) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    try {
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", "video/mp4");
        const videoStream = fs.createReadStream(videoPath);
        videoStream.pipe(res);
        videoStream.on("error", (err) => {
            console.error("send video stream error: ", err);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Failed to download.`,
            });
        });
    } catch (error: any) {
        console.error("send video stream error: ", error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed to download.`,
        });
    }
};

export const compressVideo = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        project: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.error("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const projectPath = path.join(`${process.env.UPLOAD_PATH}`, value.project);
    if (!fs.existsSync(projectPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project does not exist.`,
        });
    }
    const inputVideo = path.join(`${projectPath}`, `origin.mp4`);
    if (!fs.existsSync(inputVideo)) {
        return res.status(200).json({
            code: 0,
            message: `Input video does not exist.`,
        });
    }
    try {
        const outputVideo = path.join(`${projectPath}`, `origin_compress.mp4`);
        if (!fs.existsSync(outputVideo)) {
            const requireCompress: boolean = utilCompressVideoBefore(inputVideo);
            if (requireCompress) {
                await utilCompressVideo(inputVideo, outputVideo);
            } else {
                utilCopyVideo(inputVideo, outputVideo);
            }
        }
        const stat = fs.statSync(outputVideo);
        const fileSize = stat.size;
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", "video/mp4");
        const videoStream = fs.createReadStream(outputVideo);
        videoStream.pipe(res);
        videoStream.on("end", () => {
            res.end();
        });
        videoStream.on("error", (err) => {
            console.error("send video stream error: ", err);
            LoggerSystem.error(err.message);
            return res.status(500).json({
                code: 0,
                message: `Failed to download.`,
            });
        });
    } catch (error: any) {
        console.error("send video stream error: ", error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed to download.`,
        });
    }
};

export const downloadVideo = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.string().required(),
        video: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.log("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const projectPath = `${process.env.UPLOAD_PATH}/user${req.user?.id}/${value.project}`;
    if (!fs.existsSync(projectPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project does not exist.`,
        });
    }
    const videoPath = `${projectPath}/${value.video}`;
    if (!fs.existsSync(videoPath)) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    res.setHeader("Content-Disposition", 'attachment; filename="downloaded-video.mp4"');
    res.setHeader("Content-Type", "video/mp4");
    res.sendFile(videoPath, (err) => {
        if (err) {
            console.log(`sendFile error: `, err);
            LoggerSystem.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Failed to download.`,
            });
        } else {
            console.log("Succeed to download.");
        }
    });
};
