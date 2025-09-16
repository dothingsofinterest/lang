import { Request, Response, NextFunction } from "express";
import { Payload } from "../types/JWT";
import { findByID } from "../service/UserFile";
import jwt from "jsonwebtoken";

const checkUnauthorized = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const secret = process.env.APP_JWT_SECRET;
        const header = req.headers.authorization;
        const bearer = header?.split(" ")[1];
        if (!secret || !header || !bearer) {
            return res.status(200).json({
                code: 0,
                message: `Unauthorized.`,
            });
        } else {
            const playload = jwt.verify(bearer, secret) as Payload;
            const user = findByID(playload.id);
            if (user === undefined) {
                return res.status(200).json({
                    code: 0,
                    message: `User does not exist.`,
                });
            } else {
                req.user = user;
                next();
            }
        }
    } catch (error: any) {
        console.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `System Error.`,
        });
    }
};

const checkAuthorized = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const secret = process.env.APP_JWT_SECRET;
        const header = req.headers.authorization;
        const bearer = header?.split(" ")[1];
        if (secret && header && bearer) {
            const playload = jwt.verify(bearer, secret) as Payload;
            return res.json({
                code: 1,
                message: "Success",
                data: { access_token: bearer, expires_in: playload.exp },
            });
        } else {
            next();
        }
    } catch (error: any) {
        console.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `System Error.`,
        });
    }
};

export { checkUnauthorized, checkAuthorized };
