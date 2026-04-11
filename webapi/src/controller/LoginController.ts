import { Request, Response, NextFunction } from "express";
import { findByUsername } from "../service/UserFile";
import { checkString } from "../utils/Bcrypt";
import jwt from "jsonwebtoken";
import redis from "../lib/Redis";
import svgCaptcha from "svg-captcha";
import { generateUUID } from "../utils/UUID";
import Joi from "joi";

export const login = async (req: Request, res: Response) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
        uuid: Joi.string().required(),
        code: Joi.string().valid("1111", "1234").required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        const secret = process.env.APP_JWT_SECRET;
        const expire = process.env.APP_JWT_EXPIRE;
        if (!secret || !expire) {
            return res.status(200).json({
                code: 0,
                message: `secret or expire is required.`,
            });
        }
        // const value = await redis.get(uuid);
        // if (value !== code) throw new ServiceError("captcha is wrong.");
        // console.log("value", value);
        const user = findByUsername(value.username);
        // console.log("user", user);
        if (!user) {
            return res.status(200).json({
                code: 0,
                message: `username or password is wrong.`,
            });
        }
        // console.log("user", user);
        const match: boolean = await checkString(value.password, user.password_hashed);
        if (!match) {
            return res.status(200).json({
                code: 0,
                message: `username or password is wrong.`,
            });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: parseInt(expire) });
        res.json({
            code: 1,
            message: "Succeed",
            data: { access_token: token, expires_in: Math.floor(Date.now() / 1000) + parseInt(expire) },
        });
    } catch (error) {
        return res.status(200).json({
            code: 0,
            message: `System Error`,
        });
    }
};

export const captchaFake = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const captcha = svgCaptcha.create({
            noise: 8, // 噪点线条
            color: true, // 彩色
            background: "#6667a0", // 背景颜色
        });
        const uuid = generateUUID();
        const base64Image = Buffer.from(captcha.data).toString("base64");
        res.json({
            code: 1,
            message: "Success",
            data: { uuid: `captcha-${uuid}`, image: base64Image },
        });
    } catch (err) {
        res.json({
            code: 0,
            message: "Failed",
        });
    }
};

export const captcha = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const captcha = svgCaptcha.create({
            noise: 8, // 噪点线条
            color: true, // 彩色
            background: "#6667a0", // 背景颜色
        });
        const uuid = generateUUID();
        const base64Image = Buffer.from(captcha.data).toString("base64");
        await redis.set(`captcha-${uuid}`, captcha.text.toLowerCase(), 300);
        res.json({
            code: 1,
            message: "Success",
            data: { uuid: `captcha-${uuid}`, image: base64Image },
        });
    } catch (err) {
        res.json({
            code: 0,
            message: "Failed",
        });
    }
};
