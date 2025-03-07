import { Request, Response, NextFunction } from "express";
import { SystemError, ServiceError } from "../exception/CustomError";
import { JwtPayload } from "../types/User";
import jwt from "jsonwebtoken";
import { findByID } from "../service/User";

const checkUnauthorized = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const secret = process.env.APP_JWT_SECRET;
        const header = req.headers.authorization;
        const bearer = header?.split(" ")[1];
        if (!secret) throw new SystemError("Env error: secret is required.");
        if (!header || !bearer) return res.json({ code: 0, message: "Unauthorized" });
        const playload = jwt.verify(bearer, secret) as JwtPayload;
        const user = await findByID(playload.id);
        if (user.status === 0) {
            req.user = user;
        }
        next();
    } catch (error) {
        if (error instanceof SystemError) {
            next(new Error(error.message));
        }
        next(new ServiceError((error as Error).message));
    }
};

const checkAuthorized = (req: Request, res: Response, next: NextFunction) => {
    try {
        const secret = process.env.APP_JWT_SECRET;
        const header = req.headers.authorization;
        const bearer = header?.split(" ")[1];
        if (!secret) throw new Error("Env error: secret is required.");
        if (header && bearer) {
            const playload = jwt.verify(bearer, secret) as JwtPayload;
            return res.json({
                code: 1,
                message: "Success",
                data: { access_token: bearer, expires_in: playload.exp },
            });
        }
        next();
    } catch (err) {
        next();
    }
};

export { checkUnauthorized, checkAuthorized };
