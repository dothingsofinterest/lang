import { exec } from "child_process";
import fs from "fs";
import util from "util";
import path from "path";
import { LoggerSystem } from "../lib/Log";
import { transcodeToMp3 } from "../utils/FFmpeg";

const execPromise = util.promisify(exec);
const basePath = process.env.UPLOAD_PATH;

export const speechGenerate = async (content: string, filename: string, voice: number = 1, speed: number = 150): Promise<void> => {
    try {
        const tempFolder = path.join(`${basePath}`, `temp`);
        if (!fs.existsSync(tempFolder)) {
            throw new Error(`Temp folder not exist`);
        }
        const audioWav = path.join(tempFolder, `${filename}.wav`);
        const audioMP3 = path.join(tempFolder, `${filename}.mp3`);
        const filterContent = content.replace(/[^a-zA-Z0-9\'\,\.\%]+/g, " ");
        const command = `python ${process.cwd()}/scripts/english.py "${filterContent}" "${voice}" "${speed}" "${audioWav}"`;
        LoggerSystem.info(`✅ ${command}`);
        await execPromise(command);
        await transcodeToMp3(audioWav, audioMP3);
        fs.unlinkSync(audioWav);
    } catch (error: any) {
        LoggerSystem.error(error.message);
        throw error;
    }
};
