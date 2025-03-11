import { exec } from "child_process";
import { promises } from "fs";
import util from "util";

const execPromise = util.promisify(exec);
const generateAudio = async (content: string, type: number) => {
    try {
        const file = `${process.cwd()}/uploads/${Date.now()}.wav`;
        const filterContent = type === 1 ? content.replace(/[^a-zA-Z',\.]+/g, " ") : content.replace(/[^\u4e00-\u9fa5]+/g, ", ");
        await execPromise(`python ${process.cwd()}/scripts/english.py "${filterContent}" "${type}" "${file}"`);
        const binary = await promises.readFile(file);
        const base64 = Buffer.from(binary).toString("base64");
        promises.rm(file); // Async
        return base64;
    } catch (err) {
        throw new Error((err as Error).message);
    }
};

export { generateAudio };
