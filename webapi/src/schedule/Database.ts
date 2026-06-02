import fs from "fs";
import path from "path";
import { LoggerSystem } from "../lib/Log";

const dataPath = process.env.DATA_PATH;
const dbFile = path.join(`${dataPath}`, `${process.env.DATA_DATABASE}`);

export const run = () => {
    try {
        if (fs.existsSync(`${dataPath}`) && fs.existsSync(`${dbFile}`)) {
            const time = new Date().toISOString().replace(/:/g, "-");
            const target = path.join(`${dataPath}`, `Lang_${time}.db`);
            fs.copyFileSync(dbFile, target);
            LoggerSystem.info(`✅ Database backup succeed: ${time}, ${target}`);
        }
    } catch (error: any) {
        LoggerSystem.error(error.message);
    }
};
