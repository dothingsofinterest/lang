import fs from "fs";
import path from "path";
import Joi from "joi";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";

const dataPath = process.env.DATA_PATH;
const uploadPath = process.env.UPLOAD_PATH;
const dbFile = path.join(`${dataPath}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

type Video = {
    id: number;
    name: string;
};

export const move = (req: Request, res: Response) => {
    const schema = Joi.object({
        videoID: Joi.number().required(),
        image: Joi.string().allow(null, ""),
        pronunciation: Joi.string().allow(null, ""),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const video = db.prepare<[number], Video>("SELECT * FROM `video` WHERE id = ?").get(value.videoID);
    if (!video) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    try {
        const videoFilePath = path.join(`${dataPath}`, `${video.id}`);
        const pathUploadTemp = path.join(`${uploadPath}`, `temp`);
        if (value.pronunciation) {
            const pronunciationOriginalFile = path.join(videoFilePath, "pronunciation", value.pronunciation);
            if (fs.existsSync(pronunciationOriginalFile)) {
                fs.unlinkSync(pronunciationOriginalFile);
            }
            const pronunciationTempFile = path.join(pathUploadTemp, value.pronunciation);
            if (fs.existsSync(pronunciationTempFile)) {
                fs.renameSync(pronunciationTempFile, pronunciationOriginalFile);
            }
        }
        if (value.image) {
            const imageOriginalFile = path.join(videoFilePath, "image", value.image);
            if (fs.existsSync(imageOriginalFile)) {
                fs.unlinkSync(imageOriginalFile);
            }
            const imageTempFile = path.join(pathUploadTemp, value.image);
            if (fs.existsSync(imageTempFile)) {
                fs.renameSync(imageTempFile, imageOriginalFile);
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};

export const remove = (req: Request, res: Response) => {
    const schema = Joi.object({
        videoID: Joi.number().required(),
        image: Joi.string().allow(null, ""),
        pronunciation: Joi.string().allow(null, ""),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.error("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const video = db.prepare<[number], Video>("SELECT * FROM `video` WHERE id = ?").get(value.videoID);
    if (!video) {
        return res.status(200).json({
            code: 0,
            message: `Video does not exist.`,
        });
    }
    try {
        const videoFilePath = path.join(`${dataPath}`, `${video.id}`);
        if (value.image) {
            const imageFile = path.join(videoFilePath, "image", value.image);
            if (fs.existsSync(imageFile)) {
                fs.unlinkSync(imageFile);
            }
        }
        if (value.pronunciation) {
            const pronunciationFile = path.join(videoFilePath, "pronunciation", value.pronunciation);
            if (fs.existsSync(pronunciationFile)) {
                fs.unlinkSync(pronunciationFile);
            }
        }
        res.status(200).json({
            code: 1,
            message: `Succeed.`,
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed.`,
        });
    }
};
