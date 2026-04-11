import util from "util";
import { exec } from "child_process";
import { LoggerSystem } from "../lib/Log";

const execPromise = util.promisify(exec);
const audiowaveformBin = process.env.AUDIOWAVEFORM_PATH;

export const waveformCreate = async (input: string, output: string): Promise<void> => {
    try {
        const command = `${audiowaveformBin} -i ${input} -o ${output} -b 8`;
        await execPromise(command);
        LoggerSystem.info(`✅ ${command}`);
    } catch (error: any) {
        console.error(error.message);
        LoggerSystem.error(error.message);
        throw new Error(error.message);
    }
};
