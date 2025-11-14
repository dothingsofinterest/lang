import { Script as DataScript } from "../types/Script";
import fs, { promises as fsPromise } from "fs";

export const fnFloatToSRTTime = (floatSeconds: number): string => {
    // 计算小时、分钟、秒数和毫秒
    const hours = Math.floor(floatSeconds / 3600);
    const minutes = Math.floor((floatSeconds % 3600) / 60);
    const seconds = Math.floor(floatSeconds % 60);
    const milliseconds = Math.round((floatSeconds % 1) * 1000);
    // 格式化成 SRT 时间格式 (hh:mm:ss,SSS)
    const timeString = `${fnPadZero(hours)}:${fnPadZero(minutes)}:${fnPadZero(seconds)},${fnPadZero(milliseconds, 3)}`;
    return timeString;
};

export const fnSRTTimeToFloat = (SRTTime: string): number => {
    // Split the SRT time into hours, minutes, seconds, and milliseconds
    const timeParts = SRTTime.split(/[:,]/); // Split by ":" and ","
    // Parse the parts
    const hours = parseInt(timeParts[0], 10); // HH
    const minutes = parseInt(timeParts[1], 10); // MM
    const seconds = parseInt(timeParts[2], 10); // SS
    const milliseconds = parseInt(timeParts[3], 10); // SSS
    // Convert to seconds
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

export const fnFloatToASSTime = (floatSeconds: number): string => {
    // 计算小时、分钟、秒数和毫秒
    const hours = Math.floor(floatSeconds / 3600);
    const minutes = Math.floor((floatSeconds % 3600) / 60);
    const seconds = Math.floor(floatSeconds % 60);
    const milliseconds = Math.round((floatSeconds % 1) * 1000);
    // 格式化成 SRT 时间格式 (hh:mm:ss,SSS)
    const timeString = `${fnPadZero(hours)}:${fnPadZero(minutes)}:${fnPadZero(seconds)}.${fnPadZero(milliseconds, 3).slice(0, 2)}`;
    return timeString;
};

// 辅助函数：补零以确保数字有指定的长度
export const fnPadZero = (num: number, length: number = 2): string => {
    return num.toString().padStart(length, "0");
};

export const fnIsSRTTime = (value: string): boolean => {
    return value.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/) ? true : false;
};

export const srtCreate = (script: DataScript, scriptTimeOffset: number): string => {
    let count = 1;
    const subArr: string[] = [];
    script.paragraphs.forEach((paragraph, key, origin) => {
        const sentencesArr = paragraph.sentences.map((sentence, k) => {
            let startTime = sentence.startTime;
            let endTime = sentence.endTime;
            let text = "";
            if (scriptTimeOffset && fnSRTTimeToFloat(script.paragraphs[0].sentences[0].startTime) + scriptTimeOffset > 0) {
                startTime = fnFloatToSRTTime(fnSRTTimeToFloat(sentence.startTime) + scriptTimeOffset);
                endTime = fnFloatToSRTTime(fnSRTTimeToFloat(sentence.endTime) + scriptTimeOffset);
            }
            if (sentence.texts[0]) {
                const textTrans = sentence.texts[0].split("\n");
                if (paragraph.roles.length < 2) {
                    text = `${textTrans[0]}\n${textTrans[1]}`;
                } else {
                    text = sentence.texts
                        .map((partOfSentence, n, whole) => {
                            let text = "";
                            if (whole.length === paragraph.roles.length) {
                                const roleTrans = paragraph.roles[n].split("-");
                                const textTrans = partOfSentence.split("\n");
                                text = `${roleTrans[0]}: ${textTrans[0]}\n${roleTrans[1]}: ${textTrans[1]}`;
                            } else {
                                text = `${text[0]}\n${text[1]}`;
                            }
                            return text;
                        })
                        .join("\n---\n");
                }
            }
            return `${count++}\n${startTime} --> ${endTime}\n${text}\n`;
        });
        subArr.push(...sentencesArr);
    });
    return subArr.join("\n");
};