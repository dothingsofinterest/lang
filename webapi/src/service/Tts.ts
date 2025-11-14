import { exec } from "child_process";
import { promises as fsPromise } from "fs";
import util from "util";
import path from "path";
import { LoggerSystem } from "../lib/Log";

const execPromise = util.promisify(exec);
const uploadRootPath = process.env.UPLOAD_PATH;

export const audioGenerate = async (content: string, filename: string) => {
    try {
        const file = path.join(`${uploadRootPath}`, `temp`, filename);
        const filterContent = content.replace(/[^a-zA-Z',\.]+/g, " ");
        await execPromise(`python ${process.cwd()}/scripts/english.py "${filterContent}" "1" "${file}"`);
        const binary = await fsPromise.readFile(file);
        const base64 = Buffer.from(binary).toString("base64");
        return base64;
    } catch (error: any) {
        console.error(error);
        LoggerSystem.error(error.message);
        throw new Error(error.message);
    }
};
