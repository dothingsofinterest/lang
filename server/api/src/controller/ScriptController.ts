import { Request, Response, NextFunction } from "express";
import { scriptUploader } from "../lib/Upload";
import { ServiceLogger } from "../lib/Log";
import { fnWriteASS } from "../utils/Script";

export const upload = async (req: Request, res: Response, next: NextFunction) => {
    const projectName = req.query.project;
    if (!projectName) {
        return res.status(200).json({
            code: 0,
            message: `Project name is required.`,
        });
    } else {
        scriptUploader.single("file")(req, res, (err) => {
            if (err) {
                ServiceLogger.error(err.message);
                return res.status(200).json({
                    code: 0,
                    message: `${err.message}`,
                });
            }
            if (!req.file) {
                ServiceLogger.error("File format error.");
                return res.status(200).json({
                    code: 0,
                    message: `File format error.`,
                });
            }
            fnWriteASS(`${process.env.UPLOAD_PATH}/${projectName}/origin.json`, `${process.env.UPLOAD_PATH}/${projectName}/origin.ass`);
            res.status(200).json({
                code: 1,
                message: `Upload succeed`,
            });
        });
    }
};
