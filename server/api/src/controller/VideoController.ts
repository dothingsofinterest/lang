import fs, { promises as fsPromise } from "fs";
import { Request, Response, NextFunction } from "express";
import { LoggerSystem } from "../lib/Log";
import { assWrite, assDemoWrite } from "../utils/Script";
import { compressVideo, compressVideoBefore, copyVideo, getDuration, rasterizeSubtitleOnVideo, rasterizeSubtitleOnFrame } from "../utils/FFmpeg";
import Joi from "joi";

export const upload = async (req: Request, res: Response) => {
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

export const download = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.number().integer().required(),
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
    const projectPath = `${process.env.UPLOAD_PATH}/${value.project}`;
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

export const stream = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.number().integer().required(),
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
    const projectPath = `${process.env.UPLOAD_PATH}/${value.project}`;
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

export const compress = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        project: Joi.number().integer().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.error("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const projectPath = `${process.env.UPLOAD_PATH}/${value.project}`;
    if (!fs.existsSync(projectPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project does not exist.`,
        });
    }
    const inputVideo = `${projectPath}/origin.mp4`;
    if (!fs.existsSync(inputVideo)) {
        return res.status(200).json({
            code: 0,
            message: `Input video does not exist.`,
        });
    }
    try {
        const outputVideo = `${projectPath}/origin_compress.mp4`;
        const requireCompress: boolean = compressVideoBefore(inputVideo);
        if (requireCompress) {
            await compressVideo(inputVideo, outputVideo);
        } else {
            copyVideo(inputVideo, outputVideo);
        }
        if (!fs.existsSync(outputVideo)) {
            return res.status(200).json({
                code: 0,
                message: `Output video does not exist.`,
            });
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

export const subtitle = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.number().integer().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.log("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const projectPath = `${process.env.UPLOAD_PATH}/${value.project}`;
    if (!fs.existsSync(projectPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project does not exist.`,
        });
    }
    const inputJson = `${projectPath}/origin.json`;
    if (!fs.existsSync(inputJson)) {
        return res.status(200).json({
            code: 0,
            message: `origin.json does not exist.`,
        });
    }
    try {
        const outputAss = `${projectPath}/origin.ass`;
        await assWrite(inputJson, outputAss);
        if (!fs.existsSync(outputAss)) {
            return res.status(200).json({
                code: 0,
                message: `origin.ass does not exist.`,
            });
        }
        const inputVideo = `${projectPath}/origin.mp4`;
        const outputSubtitleVideo = `${projectPath}/origin_subtitle.mp4`;
        if (!fs.existsSync(inputVideo)) {
            return res.status(200).json({
                code: 0,
                message: `origin.mp4 does not exist.`,
            });
        }
        const duration: number = getDuration(inputVideo);
        if (duration < 1) {
            return res.status(200).json({
                code: 0,
                message: `Duration value invalid.`,
            });
        }
        rasterizeSubtitleOnVideo(inputVideo, outputAss, outputSubtitleVideo);
        if (!fs.existsSync(outputSubtitleVideo)) {
            return res.status(200).json({
                code: 0,
                message: `origin_subtitle.mp4 does not exist.`,
            });
        }
        const stat = fs.statSync(outputSubtitleVideo);
        const fileSize = stat.size;
        res.setHeader("Content-Length", fileSize);
        res.setHeader("Content-Type", "video/mp4");
        const videoStream = fs.createReadStream(outputSubtitleVideo);
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

export const subtitlePreview = async (req: Request, res: Response) => {
    const schema = Joi.object({
        project: Joi.number().integer().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.log("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const projectPath = `${process.env.UPLOAD_PATH}/${value.project}`;
    if (!fs.existsSync(projectPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project does not exist.`,
        });
    }
    const inputJson = `${projectPath}/origin.json`;
    if (!fs.existsSync(inputJson)) {
        return res.status(200).json({
            code: 0,
            message: `origin.json does not exist.`,
        });
    }
    try {
        const outputAss = `${projectPath}/origin_demo.ass`;
        await assDemoWrite(inputJson, outputAss);
        if (!fs.existsSync(outputAss)) {
            return res.status(200).json({
                code: 0,
                message: `origin_demo.ass does not exist.`,
            });
        }
        const inputVideo = `${projectPath}/origin.mp4`;
        if (!fs.existsSync(inputVideo)) {
            return res.status(200).json({
                code: 0,
                message: `origin.mp4 does not exist.`,
            });
        }
        const outputPreviewFrame = `${projectPath}/origin_subtitle_preview.png`;
        rasterizeSubtitleOnFrame(inputVideo, outputAss, outputPreviewFrame);
        if (!fs.existsSync(outputPreviewFrame)) {
            return res.status(200).json({
                code: 0,
                message: `origin_subtitle_preview.png does not exist.`,
            });
        }
        return res.status(200).json({
            code: 1,
            message: `Succeed.`,
            data: {
                preview: `${process.env.SITE_STATIC}/${value.project}/origin_subtitle_preview.png`,
            },
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
