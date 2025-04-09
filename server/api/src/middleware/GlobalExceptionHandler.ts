import { Request, Response, NextFunction } from "express";
import { LoggerService, LoggerSystem } from "../lib/Log";
import { ServiceError } from "../exception/CustomError";

const GlobalExceptionHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    err instanceof ServiceError ? LoggerService.error(err.message) : LoggerSystem.error(err.stack);
    res.status(200).json({ code: 0, message: err instanceof ServiceError ? err.message : "system error" });
};

process.on("unhandledRejection", (reason, promise) => {
    LoggerSystem.error(`Unhandled Rejection at: ${promise} - ${reason}`);
});

process.on("uncaughtException", (error) => {
    LoggerSystem.error(`Uncaught Exception thrown: ${error}`);
    process.exit(1);
});

export default GlobalExceptionHandler;
