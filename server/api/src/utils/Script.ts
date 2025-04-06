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

export const fnGetScriptWithTimeOffset = (script: DataScript, scriptTimeOffset: number): DataScript => {
    const newParagraghs = script.paragraghs.map((value) => {
        const newChildren = value.children.map((v) => {
            let startTime = v.startTime;
            let endTime = v.endTime;
            if (scriptTimeOffset && fnSRTTimeToFloat(script.paragraghs[0].children[0].startTime) + scriptTimeOffset > 0) {
                startTime = fnFloatToSRTTime(fnSRTTimeToFloat(v.startTime) + scriptTimeOffset);
                endTime = fnFloatToSRTTime(fnSRTTimeToFloat(v.endTime) + scriptTimeOffset);
            }
            return {
                ...v,
                texts: v.texts.map((vv: any) => {
                    return vv.replaceAll(/[^\S\n]+/g, " ").trim();
                }),
                startTime: startTime,
                endTime: endTime,
            };
        });
        return { ...value, children: newChildren };
    });
    return { ...script, paragraghs: newParagraghs };
};

export const fnGenerateSRT = (script: DataScript, scriptTimeOffset: number): string => {
    let count = 1;
    const subArr: string[] = [];
    script.paragraghs.forEach((paragragh, key, origin) => {
        const childrenArr = paragragh.children.map((sentence, k) => {
            let startTime = sentence.startTime;
            let endTime = sentence.endTime;
            let text = "";
            if (scriptTimeOffset && fnSRTTimeToFloat(script.paragraghs[0].children[0].startTime) + scriptTimeOffset > 0) {
                startTime = fnFloatToSRTTime(fnSRTTimeToFloat(sentence.startTime) + scriptTimeOffset);
                endTime = fnFloatToSRTTime(fnSRTTimeToFloat(sentence.endTime) + scriptTimeOffset);
            }
            if (sentence.texts[0]) {
                const textTrans = sentence.texts[0].split("\n");
                if (paragragh.roles.length < 2) {
                    text = `${textTrans[0]}\n${textTrans[1]}`;
                } else {
                    text = sentence.texts
                        .map((partOfSentence, n, whole) => {
                            let text = "";
                            if (whole.length === paragragh.roles.length) {
                                const roleTrans = paragragh.roles[n].split("-");
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
        subArr.push(...childrenArr);
    });
    return subArr.join("\n");
};

export const fnGenerateASS = (script: DataScript, scriptTimeOffset: number): string => {
    let base = `[Script Info]
Title: ${script.name}
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Yantramanav,6,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,10,0,8,4,4,216,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
    const subArr: string[] = [];
    script.paragraghs.forEach((paragragh, key, origin) => {
        const childrenArr = paragragh.children.map((sentence, k) => {
            let startTime = sentence.startTime;
            let endTime = sentence.endTime;
            let text = "";
            if (scriptTimeOffset && fnSRTTimeToFloat(script.paragraghs[0].children[0].startTime) + scriptTimeOffset > 0) {
                startTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.startTime) + scriptTimeOffset);
                endTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.endTime) + scriptTimeOffset);
            } else {
                // TODO
                startTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.startTime));
                endTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.endTime));
            }
            if (sentence.texts[0]) {
                const textTrans = sentence.texts[0].split("\n");
                if (paragragh.roles.length < 2) {
                    text = `${textTrans[0]}\\N\\N{\\fs5}${textTrans[1]}`;
                } else {
                    text = sentence.texts
                        .map((partOfSentence, n, whole) => {
                            let text = "";
                            if (whole.length === paragragh.roles.length) {
                                const roleTrans = paragragh.roles[n].split("-");
                                const textTrans = partOfSentence.split("\n");
                                text = `${roleTrans[0]}: ${textTrans[0]}\\N{\\fs5}${roleTrans[1]}: ${textTrans[1]}`;
                            } else {
                                text = `${text[0]}\\N\\N{\\fs5}${text[1]}`;
                            }
                            return text;
                        })
                        .join("\\N---\\N{\\fs6}");
                }
            }
            return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`;
        });
        subArr.push(...childrenArr);
    });
    return base + subArr.join("\n");
};

export const fnWriteASS = async (input: string, output: string) => {
    const contentJSON = await fsPromise.readFile(input, "utf8");
    const data = JSON.parse(contentJSON);
    const contentASS = fnGenerateASS(data, 0);
    await fsPromise.writeFile(output, contentASS, "utf8");
};
