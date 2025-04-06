import fs, { promises as fsPromise } from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { videoUploader } from "../lib/Upload";
import { ServiceLogger } from "../lib/Log";
import { compressVideo, compressVideoBefore, copyVideo, generateBgVideo, getDuration, bakeSubtitle } from "../utils/FFmpeg";

export const upload = async (req: Request, res: Response, next: NextFunction) => {
    videoUploader.single("video")(req, res, (err) => {
        if (err) {
            ServiceLogger.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `${err.message}`,
            });
        }
        if (!req.file) {
            ServiceLogger.error("Video format error.");
            return res.status(200).json({
                code: 0,
                message: `Video format error.`,
            });
        }
        res.status(200).json({
            code: 1,
            message: `Upload succeed`,
            data: {
                project: `${req.file?.destination.split("/").reverse()[0]}`,
            },
        });
    });
};

export const download = async (req: Request, res: Response, next: NextFunction) => {
    const projectName = req.query.project;
    const projectFullPath = `${process.env.UPLOAD_PATH}/${projectName}`;
    if (!projectName || !fs.existsSync(projectFullPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project name is required.`,
        });
    }
    const videoName = req.query.video;
    if (!videoName) {
        return res.status(200).json({
            code: 0,
            message: `Video name is required.`,
        });
    }
    const videoPath = `${projectFullPath}/${videoName}`;
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
            ServiceLogger.error(err.message);
            return res.status(200).json({
                code: 0,
                message: `Download failed.`,
            });
        } else {
            console.log("Download succeed.");
        }
    });
};

export const stream = async (req: Request, res: Response, next: NextFunction) => {
    const projectName = req.query.project;
    const projectFullPath = `${process.env.UPLOAD_PATH}/${projectName}`;
    if (!projectName || !fs.existsSync(projectFullPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project name is required.`,
        });
    }
    const videoName = req.query.video;
    if (!videoName) {
        return res.status(200).json({
            code: 0,
            message: `Video name is required.`,
        });
    }
    const videoPath = `${projectFullPath}/${videoName}`;
    if (!fs.existsSync(videoPath)) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    res.setHeader("Content-Length", fileSize);
    res.setHeader("Content-Type", "video/mp4");

    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
    videoStream.on("error", (err) => {
        ServiceLogger.error(err.message);
        return res.status(200).json({
            code: 0,
            message: `Download failed.`,
        });
    });
    return res.status(200).json({
        code: 1,
        message: `Success`,
    });
};

export const compress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectName = req.query.project;
        const projectFullPath = `${process.env.UPLOAD_PATH}/${projectName}`;
        if (!projectName || !fs.existsSync(projectFullPath)) {
            return res.status(200).json({
                code: 0,
                message: `Project name is required.`,
            });
        }
        const inputVideo = `${projectFullPath}/origin.mp4`;
        if (!fs.existsSync(inputVideo)) {
            return res.status(200).json({
                code: 0,
                message: `Input video does not exist.`,
            });
        }
        const outputVideo = `${projectFullPath}/origin_compress.mp4`;
        const requireCompress: boolean = await compressVideoBefore(inputVideo);
        if (requireCompress) {
            await compressVideo(inputVideo, outputVideo);
        } else {
            await copyVideo(inputVideo, outputVideo);
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
            ServiceLogger.error(err.message);
            return res.status(500).json({
                code: 0,
                message: `Download failed.`,
            });
        });
    } catch (error: any) {
        return res.status(200).json({
            code: 0,
            message: `Error.`,
        });
    }
};

export const clear = () => {
    const folderPath = path.join("./", "uploads", "videos");
    fs.readdir(folderPath, (err, files) => {
        if (!err) {
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                fs.unlink(filePath, (err) => {});
            });
        }
    });
};

export const streamSubtitle = async (req: Request, res: Response, next: NextFunction) => {
    const projectName = req.query.project;
    const projectFullPath = `${process.env.UPLOAD_PATH}/${projectName}`;
    if (!projectName || !fs.existsSync(projectFullPath)) {
        return res.status(200).json({
            code: 0,
            message: `Project name is required.`,
        });
    } else {
        try {
            const inputVideo = `${process.env.UPLOAD_PATH}/${projectName}/origin.mp4`;
            const inputFileJSON = `${process.env.UPLOAD_PATH}/${projectName}/origin.json`;
            const inputFileAss = `${process.env.UPLOAD_PATH}/${projectName}/origin.ass`;
            const outputOriginVideoBg = `${process.env.UPLOAD_PATH}/${projectName}/origin_bg.mp4`;
            const outputOriginVideoBgAss = `${process.env.UPLOAD_PATH}/${projectName}/origin_bg_ass.mp4`;
            if (fs.existsSync(inputVideo) && fs.existsSync(inputFileJSON) && fs.existsSync(inputFileAss)) {
                const duration = (await getDuration(inputVideo)) as number;
                if (typeof duration !== "number" || duration < 0) {
                    return res.status(200).json({
                        code: 0,
                        message: `Duration value invalid.`,
                    });
                }
                const contentJSON = await fsPromise.readFile(inputFileJSON, "utf8");
                const scriptData = JSON.parse(contentJSON);
                const scriptTitlt = scriptData.name.split("/");
                await generateBgVideo(duration, [scriptTitlt[0], scriptTitlt[1]], outputOriginVideoBg);
                if (!fs.existsSync(outputOriginVideoBg)) {
                    return res.status(200).json({
                        code: 0,
                        message: `origin_bg.mp4 file does not exist.`,
                    });
                }
                await bakeSubtitle(outputOriginVideoBg, outputOriginVideoBgAss, inputFileAss);
                if (!fs.existsSync(outputOriginVideoBgAss)) {
                    return res.status(200).json({
                        code: 0,
                        message: `origin_bg_ass.mp4 file does not exist.`,
                    });
                }
                const stat = fs.statSync(outputOriginVideoBgAss);
                const fileSize = stat.size;
                res.setHeader("Content-Length", fileSize);
                res.setHeader("Content-Type", "video/mp4");
                const videoStream = fs.createReadStream(outputOriginVideoBgAss);
                videoStream.pipe(res);
                videoStream.on("error", (err) => {
                    ServiceLogger.error(err.message);
                    return res.status(200).json({
                        code: 0,
                        message: `Download failed.`,
                    });
                });
            } else {
                return res.status(200).json({
                    code: 0,
                    message: `Video or ASS or JSON file do not exist.`,
                });
            }
        } catch (error: any) {
            ServiceLogger.error(error.message);
            return res.status(200).json({
                code: 0,
                message: `Error`,
            });
        }
    }
};
