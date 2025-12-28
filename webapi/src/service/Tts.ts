import { exec } from "child_process";
import { promises as fsPromise } from "fs";
import util from "util";
import path from "path";
import { LoggerSystem } from "../lib/Log";

const execPromise = util.promisify(exec);
const uploadRootPath = process.env.UPLOAD_PATH;

export const audioGenerate = async (content: string, filename: string, voice: number = 1, speed: number = 150) => {
    try {
        const file = path.join(`${uploadRootPath}`, `temp`, filename);
        const filterContent = content.replace(/[^a-zA-Z0-9\'\,\.\%]+/g, " ");
        const command = `python ${process.cwd()}/scripts/english.py "${filterContent}" "${voice}" "${speed}" "${file}"`;
        await execPromise(command);
        LoggerSystem.info(`✅ ${command}`);
        const binary = await fsPromise.readFile(file);
        const base64 = Buffer.from(binary).toString("base64");
        return base64;
    } catch (error: any) {
        console.error(error);
        LoggerSystem.error(error.message);
        throw new Error(error.message);
    }
};
