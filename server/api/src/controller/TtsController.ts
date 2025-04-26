import { Request, Response } from "express";
import { generateAudio, searchAudio } from "../service/Tts";
import { LoggerSystem } from "../lib/Log";
import { Response as HttpResponse } from "../types/Http";
import Joi from "joi";

const httpResponse: HttpResponse = {
    code: 1,
    message: `success`,
    data: ``,
};

const conGenerate = async (req: Request, res: Response) => {
    const schemaQuery = Joi.object({
        type: Joi.number().integer().valid(1, 2, 3).required(),
        content: Joi.string().required(),
    });
    const { error: errorQuery, value: valueQuery } = schemaQuery.validate(req.query);
    if (errorQuery) {
        console.error("Failed to validate params: ", errorQuery.message);
        httpResponse.code = 0;
        httpResponse.message = errorQuery.message;
        return res.status(200).json(httpResponse);
    }
    try {
        let sound: string;
        if (valueQuery.type === 3) {
            sound = await searchAudio(valueQuery.content.replaceAll(", ", "_"));
        } else {
            sound = await generateAudio(valueQuery.content, valueQuery.type);
        }
        httpResponse.data = sound;
        return res.json(httpResponse);
    } catch (error: any) {
        console.error("Failed to tts: ", error);
        LoggerSystem.error(error.message);
        httpResponse.code = 0;
        httpResponse.message = `Failed to tts.`;
        return res.status(200).json(httpResponse);
    }
};

export { conGenerate };
