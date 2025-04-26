import { exec } from "child_process";
import { promises as fsPromise } from "fs";
import util from "util";

const execPromise = util.promisify(exec);

const generateAudio = async (content: string, type: number) => {
    try {
        const file = `${process.env.UPLOAD_PATH}/tmp/${Date.now()}.wav`;
        const filterContent = type === 1 ? content.replace(/[^a-zA-Z',\.]+/g, " ") : content.replace(/[^\u4e00-\u9fa5]+/g, ", ");
        await execPromise(`python ${process.cwd()}/scripts/english.py "${filterContent}" "${type}" "${file}"`);
        const binary = await fsPromise.readFile(file);
        const base64 = Buffer.from(binary).toString("base64");
        fsPromise.rm(file);
        return base64;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

const searchAudio = async (fileName: string) => {
    try {
        const file = `${process.env.UPLOAD_PATH}/tts/${fileName}.wav`;
        const binary = await fsPromise.readFile(file);
        const base64 = Buffer.from(binary).toString("base64");
        return base64;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

export { generateAudio, searchAudio };
