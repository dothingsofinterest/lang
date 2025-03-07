import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../exception/CustomError";
import { generateAudio } from "../service/Tts";
import { findByID } from "../service/Item";

const conGenerate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.query.id);
        const type = Number(req.query.type);
        if (isNaN(type)) {
            throw new ServiceError("Invalid type parameter");
        }
        if (![1, 2].includes(type)) {
            throw new ServiceError("Invalid type parameter");
        }
        const content = req.query.content || "";
        if (typeof content !== "string") {
            throw new ServiceError("Content is required");
        }
        let sound: string | null = null;
        if (id) {
            const [one] = await findByID(id);
            sound = one[0].sound;
        }
        if (!sound) {
            sound = await generateAudio(content, type);
        }
        res.json({
            code: 1,
            message: "success",
            data: sound,
        });
    } catch (error) {
        next(error);
    }
};

export { conGenerate };
