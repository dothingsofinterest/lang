import { Request, Response, NextFunction } from "express";
import { ServiceLogger, SystemLogger } from "../lib/Log";
import { ServiceError } from "../exception/CustomError";

const GlobalExceptionHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    err instanceof ServiceError ? ServiceLogger.error(err.message) : SystemLogger.error(err.stack);
    res.status(200).json({ code: 0, message: err instanceof ServiceError ? err.message : "System Error" });
};

process.on("unhandledRejection", (reason, promise) => {
    SystemLogger.error(`Unhandled Rejection at: ${promise} -  ${reason}`);
});

process.on("uncaughtException", (error) => {
    SystemLogger.error(`Uncaught Exception thrown: ${error}`);
    process.exit(1);
});

export default GlobalExceptionHandler;
