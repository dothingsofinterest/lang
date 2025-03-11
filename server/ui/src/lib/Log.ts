import { createLogger, format, transports } from "winston";

const SystemLogger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] [${level}] -- ${message}`;
        }),
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: `${process.env.APP_LOG_PATH}/error.log`, level: "error" }), // error 以及 error 以下的日志
        new transports.File({ filename: `${process.env.APP_LOG_PATH}/combined.log` }), // info 以及 info 以下包括 error 的日志
    ],
});

const ServiceLogger = createLogger({
    level: "error",
    format: format.combine(
        format.timestamp(),
        format.printf(({ message, timestamp }) => {
            return `[${timestamp}] -- ${message}`;
        }),
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: `${process.env.APP_LOG_PATH}/service.log`, level: "error" }), // error 以及 error 以下的日志
    ],
});

export { SystemLogger, ServiceLogger };
