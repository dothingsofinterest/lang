import fs, { promises as fsPromise } from "fs";
import { Request, Response, NextFunction } from "express";
import { LoggerSystem } from "../lib/Log";
import Joi from "joi";

export const upload = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        console.log("Failed to find the file.");
        return res.status(200).json({
            code: 0,
            message: `Failed to find the file.`,
        });
    }
    const schema = Joi.object({
        project: Joi.number().integer().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        console.log("Failed to validate params: ", error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed to validate params.`,
        });
    }
    try {
        res.status(200).json({
            code: 1,
            message: `Upload succeed.`,
        });
    } catch (error: any) {
        console.error("Failed to write ass: ", error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed to write ass.`,
        });
    }
};

export const updateAss = async (req: Request, res: Response, next: NextFunction) => {
    const schemaQuery = Joi.object({
        project: Joi.number().integer().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        console.error("Failed to validate params: ", errorQuery.message);
        return res.status(200).json({
            code: 0,
            message: errorQuery.message,
        });
    }
    const schema = Joi.object({
        enFontSize: Joi.number().integer().required(),
        enFontColor: Joi.string().valid("H00FFFFFF", "H00000000", "H002CB2FE").required(),
        enFontColorInline: Joi.string().valid("H3517DC", "H2CB2FE").required(),
        enFontOutlineWidth: Joi.number().integer().required(),
        enFontOutlineColor: Joi.string().valid("H00FFFFFF", "H00000000").required(),
        enAlignment: Joi.number().integer().valid(5, 8, 2).required(),
        enMarginLR: Joi.number().integer().required(),
        enMarginV: Joi.number().integer().required(),
        cnFontSize: Joi.number().integer().required(),
        cnFontColor: Joi.string().valid("H00FFFFFF", "H00000000", "H002CB2FE").required(),
        cnFontColorInline: Joi.string().valid("H3517DC", "H2CB2FE").required(),
        cnFontOutlineWidth: Joi.number().integer().required(),
        cnFontOutlineColor: Joi.string().valid("H00FFFFFF", "H00000000").required(),
        cnAlignment: Joi.number().integer().valid(5, 8, 2).required(),
        cnMarginLR: Joi.number().integer().required(),
        cnMarginV: Joi.number().integer().required(),
        cnLineBreak: Joi.number().integer().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        console.error("Failed to validate body: ", error.message);
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    const inputJson = `${process.env.UPLOAD_PATH}/${valueQuery.project}/origin.json`;
    if (!fs.existsSync(inputJson)) {
        return res.status(200).json({
            code: 0,
            message: `Data file does not exist.`,
        });
    }
    try {
        const contentJson = await fsPromise.readFile(inputJson, "utf8");
        const contentObj = JSON.parse(contentJson);
        contentObj.assFormat = value;
        await fsPromise.writeFile(inputJson, JSON.stringify(contentObj, null, 4), "utf8");
        return res.status(200).json({
            code: 1,
            message: `Succeed to update.`,
        });
    } catch (error: any) {
        console.error("Failed to update data: ", error);
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed to update data.`,
        });
    }
};
