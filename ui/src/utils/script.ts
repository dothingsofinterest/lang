import { Script as DataScript, FormattedData, Paragraph as DataParagraph, Sentence } from "../types/Data";
import { scriptSync } from "../api/requestAuth";
import { Domain } from "../settings.js";
import Joi from "joi";

export const fnCreateJson = (script: DataScript, scriptTimeOffset: number): DataScript => {
    const newParagraphs = script.paragraphs.map((value) => {
        const newSentences = value.sentences.map((v) => {
            let startTime = v.startTime;
            let endTime = v.endTime;
            if (scriptTimeOffset && fnSRTTimeToFloat(script.paragraphs[0].sentences[0].startTime) + scriptTimeOffset > 0) {
                startTime = fnFloatToSRTTime(fnSRTTimeToFloat(v.startTime) + scriptTimeOffset);
                endTime = fnFloatToSRTTime(fnSRTTimeToFloat(v.endTime) + scriptTimeOffset);
            }
            return {
                ...v,
                startTime: startTime,
                endTime: endTime,
            };
        });
        return { ...value, sentences: newSentences };
    });
    return { ...script, paragraphs: newParagraphs };
};

export const fnParseVocabs = (text: string): string => {
    let r = ``;
    if (text) {
        const res = [];
        const types = [/(n)\.\s*([^\n]+)/, /\b(v|vi|vt)\.\s*([^\n]+)/, /(adj)\.\s*([^\n]+)/, /(adv)\.\s*([^\n]+)/, /(conj)\.\s*([^\n]+)/, /(pron)\.\s*([^\n]+)/, /(prep)\.\s*([^\n]+)/];
        for (let i = 0; i < types.length; i++) {
            const matchCN = text.match(types[i]);
            if (matchCN && matchCN[2]) {
                let str = "";
                str += i === 1 ? `v.${matchCN[2]}, ` : `${matchCN[1]}.${matchCN[2]}, `; // 区分 v|vi|vt
                const matchName = text.match(/^([a-zA-Z ]+)/); // 单词本身
                if (matchName && matchName[1]) {
                    str += matchName[1];
                    if (i === 0) {
                        const nameExt = [/复数(.*?)(\w+)/];
                        for (let k = 0; k < nameExt.length; k++) {
                            const matchNameExt = text.match(nameExt[k]);
                            if (matchNameExt && matchNameExt[2]) {
                                str += `/${matchNameExt[2]}`;
                            }
                        }
                    }
                    if (i === 1) {
                        const nameExt = [/第三人称单数(.*?)(\w+)/, /过去式(.*?)(\w+)/, /过去分词(.*?)(\w+)/, /现在进行时(.*?)(\w+)/];
                        for (let k = 0; k < nameExt.length; k++) {
                            const matchNameExt = text.match(nameExt[k]);
                            if (matchNameExt && matchNameExt[2]) {
                                str += `/${matchNameExt[2]}`;
                            }
                        }
                    }
                    if (i === 2) {
                        const nameExt = [/比较级(.*?)(\w+)/, /最高级(.*?)(\w+)/];
                        for (let k = 0; k < nameExt.length; k++) {
                            const matchNameExt = text.match(nameExt[k]);
                            if (matchNameExt && matchNameExt[2]) {
                                str += `/${matchNameExt[2]}`;
                            }
                        }
                    }
                }
                const matchPronounce = text.match(/\/(.*?)\//g);
                if (matchPronounce && matchPronounce[1]) {
                    str += `, ${matchPronounce[1]}`;
                }
                res.push(str);
            }
        }
        r = res.join("\n");
    }
    return r;
};

export const fnGetFormattedData = (plan: string, script: DataScript): FormattedData => {
    const data: FormattedData = {
        title: script.title,
        vocabs: [],
        grammars: script.grammars,
        scenes: [],
        sentences: [],
    };
    const staticPrefix = `${Domain}/data/${plan}`;
    data.vocabs = script.vocabs.map((v) => ({ ...v, image: v.image ? `${staticPrefix}/vocab_images/${v.image}` : ``, pronunciation: `${staticPrefix}/vocab_pronunciations/${v.pronunciation}` }));
    script.paragraphs.forEach((v: DataParagraph) => {
        data.sentences.push(...v.sentences);
    });
    const hasScene = script.paragraphs.find(({ scene }) => {
        return scene === "";
    });
    if (hasScene === undefined) {
        script.paragraphs.forEach((v: DataParagraph, k: number, a: DataParagraph[]) => {
            const sceneArr = v.scene.split("-");
            const sceneKey = sceneArr[0].replaceAll(/[\s\'\,]/g, "");
            if (sceneKey) {
                if (k === 0) {
                    data.scenes.push({
                        name: v.scene,
                        paragraphs: [v],
                    });
                } else {
                    if (v.scene !== a[k - 1].scene) {
                        data.scenes.push({
                            name: v.scene,
                            paragraphs: [v],
                        });
                    } else {
                        data.scenes[data.scenes.length - 1].paragraphs.push(v);
                    }
                }
            }
        });
    } else {
        data.scenes.push({
            name: "",
            paragraphs: [],
        });
        script.paragraphs.forEach((v: DataParagraph) => {
            data.scenes[0].paragraphs.push(v);
        });
    }
    return data;
};

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

export const fnPadZero = (num: number, length: number = 2): string => {
    return num.toString().padStart(length, "0");
};

export const fnIsSRTTime = (value: string): boolean => {
    return value.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/) ? true : false;
};

export const fnValidateJsonFile = (data: any): boolean => {
    const schema = Joi.object({
        title: Joi.string().required(),
        roles: Joi.array().items(Joi.string()).required(),
        scenes: Joi.array().items(Joi.string()).required(),
        vocabs: Joi.array().items(Joi.object()).required(),
        grammars: Joi.array().items(Joi.string()).required(),
        paragraphs: Joi.array().items(Joi.object()).required(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
        console.log("Json file validatation error:", error);
        return false;
    }
    return true;
};

export const fnGetMaxTimeFromSentences = (sentences: Sentence[]): number => {
    const timeArr: number[] = [];
    sentences.forEach((v) => {
        timeArr.push(fnSRTTimeToFloat(v.startTime));
        timeArr.push(fnSRTTimeToFloat(v.endTime));
    });
    return Math.max(...timeArr);
};

export const fnSyncScript = async (plan: string, script: DataScript, scriptTimeOffset: number) => {
    const blob = new Blob([JSON.stringify(fnCreateJson(script, scriptTimeOffset), null, 4)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "script.json");
    scriptSync({ plan }, formData);
};
