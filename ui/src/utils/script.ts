import { Script as DataScript, Vocab as DataVocab, Scene as DataScene, Paragraph as DataParagraph, Sentence, ScriptParsed } from "../types/Data";
import { Domain } from "../settings.js";
import { fnRandom } from "./util";
import Joi, { number } from "joi";

export const fnParseVocab = (text: string): string => {
    let r = ``;
    if (text) {
        const res = [];
        const types = [/(n)\.\s*([^\n]+)/, /\b(v|vi|vt)\.\s*([^\n]+)/, /(adj)\.\s*([^\n]+)/, /(adv)\.\s*([^\n]+)/, /(conj)\.\s*([^\n]+)/, /(pron)\.\s*([^\n]+)/, /(prep)\.\s*([^\n]+)/];
        for (let i = 0; i < types.length; i++) {
            const matchCN = text.match(types[i]);
            if (matchCN && matchCN[2]) {
                let str = "";
                // Part of EN
                const matchName = text.match(/^([a-zA-Z ]+)/);
                if (matchName && matchName[1]) {
                    // Base
                    str += matchName[1];
                    // Nouns
                    if (i === 0) {
                        const nameExt = [/复数(.*?)(\w+)/];
                        for (let k = 0; k < nameExt.length; k++) {
                            const matchNameExt = text.match(nameExt[k]);
                            if (matchNameExt && matchNameExt[2]) {
                                str += fnParseVocabCheckNoun(matchName[1], matchNameExt[2]);
                            }
                        }
                    }
                    // Verbs
                    if (i === 1) {
                        const strArr = [];
                        const nameExt = [/第三人称单数(.*?)(\w+)/, /过去式(.*?)(\w+)/, /过去分词(.*?)(\w+)/, /现在进行时(.*?)(\w+)/];
                        for (let k = 0; k < nameExt.length; k++) {
                            const matchNameExt = text.match(nameExt[k]);
                            if (matchNameExt && matchNameExt[2]) {
                                strArr.push(matchNameExt[2]);
                            }
                        }
                        str += fnParseVocabCheckVerbs(matchName[1], strArr);
                    }
                    // Adjective
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
                // Part of pronounce
                const matchPronounce = text.match(/\/(.*?)\//g);
                if (matchPronounce && matchPronounce[1]) {
                    str += ` | ${matchPronounce[1].replaceAll("/", "")}`;
                }
                // Part of CN
                str += i === 1 ? ` | v.${matchCN[2]}` : ` | ${matchCN[1]}.${matchCN[2]}`; // 区分 v|vi|vt
                res.push(str);
            }
        }
        r = res.join("\n");
    }
    return r;
};

export const fnParseVocabCheckNoun = (base: string, plural: string): string => {
    if (base && plural) {
        const vs = new RegExp(`^${base}s`); // +s invents
        const ves = new RegExp(`^${base}es`); // +es touches
        const vies = new RegExp(`^${base.slice(0, base.length - 1)}ies`); // -y +ies studies
        if (!vs.test(plural) && !ves.test(plural) && !vies.test(plural)) {
            return `/${plural}`;
        }
    }
    return "";
};

export const fnParseVocabCheckVerbs = (base: string, variants: string[]): string => {
    const [third, past, participle, gerund] = variants;
    if (third) {
        const vs = new RegExp(`^${base}s`); // +s invents
        const ves = new RegExp(`^${base}es`); // +es touches
        const vies = new RegExp(`^${base.slice(0, base.length - 1)}ies`); // -y +ies studies
        if (!vs.test(third) && !ves.test(third) && !vies.test(third)) {
            return `/${variants.join("/")}`;
        }
    }
    if (past && participle) {
        const vd = new RegExp(`^${base}d`); // +d tortured
        const ved = new RegExp(`^${base}ed`); // +ed invented
        const vied = new RegExp(`^${base.slice(0, base.length - 1)}ied`); // -y +ied carried
        const vced = new RegExp(`^${base}${base.charAt(base.length - 1)}ed`); // +辅 +ed stopped
        if (!vd.test(past) && !ved.test(past) && !vied.test(past) && !vced.test(past)) {
            return `/${variants.join("/")}`;
        }
        if (!vd.test(participle) && !ved.test(participle) && !vied.test(participle) && !vced.test(participle)) {
            return `/${variants.join("/")}`;
        }
    }
    if (gerund) {
        const ving = new RegExp(`^${base}ing`); // +ing inventing
        const veing = new RegExp(`^${base.slice(0, base.length - 1)}ing`); // -e +ing whistling
        const vcing = new RegExp(`^${base}${base.charAt(base.length - 1)}ing`); // +辅 +ing stopping
        if (!ving.test(gerund) && !veing.test(gerund) && !vcing.test(gerund)) {
            return variants.join("/");
        }
    }
    return "";
};

// export const fnGetFormattedData = (hash: string, script: DataScript): ScriptParsed => {
// const data: ScriptParsed = {
//     hash: hash,
//     title: script.title,
//     vocab: [],
//     // grammar: script.grammar,
//     exampleRecogn: [],
//     exampleTranslation: [],
//     scenes: [],
//     sentences: [],
//     impression: {
//         content: "",
//         grammar: [],
//     },
// };
// script.paragraphs.forEach((v: DataParagraph) => {
//     data.sentences.push(...v.sentences);
// });
// const emptyScene = script.paragraphs.find(({ scene }) => scene === "");
// if (emptyScene === undefined) {
//     script.paragraphs.forEach((v: DataParagraph, k: number, a: DataParagraph[]) => {
//         const sceneItem = script.scenes.find(({ index }) => index === v.scene);
//         const sceneName = sceneItem ? sceneItem.value : `${v.scene}-${v.scene}`;
//         if (k === 0) {
//             data.scenes.push({ name: sceneName, paragraphs: [v] });
//         } else {
//             if (v.scene !== a[k - 1].scene) {
//                 data.scenes.push({ name: sceneName, paragraphs: [v] });
//             } else {
//                 data.scenes[data.scenes.length - 1].paragraphs.push(v);
//             }
//         }
//     });
// } else {
//     data.scenes.push({ name: "", paragraphs: [] });
//     script.paragraphs.forEach((v: DataParagraph) => {
//         data.scenes[0].paragraphs.push(v);
//     });
// }
// data.vocab = [...script.vocab].sort((a, b) => a.definition.split(" | ")[0].length - b.definition.split(" | ")[0].length);
// script.grammar.forEach((grammarItem) => {
//     grammarItem.examples.forEach((example) => {
//         const text = [];
//         const textArr = example.text.split("\n---\n");
//         if (textArr.length === 1) {
//             const exm = { text: ["", "", "", ""], type: example.type };
//             data.exampleRecogn.push(exm);
//             data.exampleTranslation.push(exm);
//         } else {
//             textArr[0] && text.push(...textArr[0].split("\n"));
//             textArr[1] && text.push(...textArr[1].split("\n"));
//             const exampleItem = { text, type: example.type };
//             if (Number(example.type) === 0 || Number(example.type) === 2) {
//                 data.exampleRecogn.push(exampleItem);
//             }
//             if (Number(example.type) === 1 || Number(example.type) === 2) {
//                 data.exampleTranslation.push(exampleItem);
//             }
//         }
//     });
// });
// data.impression = script.impression
//     ? script.impression
//     : {
//           content: "",
//           grammar: [],
//       };
// return data;
// };

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

export const fnValidateVideoScript = (data: any): boolean => {
    const schema = Joi.object({
        title: Joi.string().required().allow(""),
        roles: Joi.array().items(Joi.string()).required(),
        scenes: Joi.array()
            .items(Joi.alternatives().try(Joi.object(), Joi.string().allow("")))
            .required(),
        paragraphs: Joi.array().items(Joi.object()).required(),
        vocab: Joi.array().items(Joi.object()).required(),
        grammar: Joi.array().items(Joi.object()).required(),
        impression: Joi.object(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
        console.log("Json file validatation error:1", error);
        return false;
    }
    return true;
};

export const fnGetMaxTimeFromSentences = (sentences: Sentence[]): number => {
    const timeArr: number[] = [];
    sentences.forEach((v) => {
        timeArr.push(v.startTime);
        timeArr.push(v.endTime);
    });
    return Math.max(...timeArr);
};

export const fnSyncScript = async (hash: string, script: DataScript) => {
    const blob = new Blob([JSON.stringify(script, null, 4)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "script.json");
    // await dataSync({ hash }, formData);
};

// Temporary
export const fnDealScenes = (script: DataScript) => {
    const min = 0,
        max = 65535;
    const excluded: number[] = [];
    return script.scenes.map((scene) => {
        if (typeof scene === "object") {
            return scene;
        } else {
            const index = fnRandom(min, max, excluded);
            excluded.push(index);
            return { index: index, value: scene };
        }
    });
};

// Temporary
export const fnDealParagraphs = (script: DataScript) => {
    let i = 1;
    let j = 1;
    // return script.paragraphs.map((paragraph: DataParagraph) => {
    //     return { ...paragraph, id: i++, sentences: paragraph.sentences.map((sentence) => ({ ...sentence, id: j++ })) };
    // });
};

// Temporary
export const fnDealVocab = (script: DataScript) => {
    // let i = 1;
    // return script.vocab.map((v: DataVocab) => ({ ...v, id: i++ }));
};
