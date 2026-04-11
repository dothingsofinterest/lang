import fs from "fs";
import path from "path";
import { LoggerSystem } from "../lib/Log";
import axios, { AxiosInstance } from "axios";

const basePath = process.env.UPLOAD_PATH;

const http: AxiosInstance = axios.create({
    baseURL: `https://translate.google.com`,
    timeout: 10000,
});

http.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
);

export const speechGenerate = async (content: string, filename: string): Promise<void> => {
    try {
        const tempFolder = path.join(`${basePath}`, `temp`);
        if (!fs.existsSync(tempFolder)) {
            throw new Error(`Temp folder not exist`);
        }

        const filterContent = content.replace(/[^a-zA-Z0-9\'\,\.\%]+/g, " ");
        const response = await http.request({
            method: "get",
            url: "/translate_tts",
            params: { ie: "UTF-8", q: `${filterContent}`, tl: "en", client: "tw-ob" },
            responseType: "stream",
        });

        const filePath = path.join(tempFolder, `${filename}.mp3`);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        LoggerSystem.info(`✅ Google Translate Succeed`);
    } catch (error: any) {
        LoggerSystem.error(error.message);
        throw error;
    }
};
