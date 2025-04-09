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

/*
 * 中英混合显示，位于中下
 */
export const assCreateDefault = (script: DataScript): string => {
    let base = `[Script Info]
Title: ${script.name}
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Yantramanav,8,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,0,8,4,4,216,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
    const dialogues: string[] = [];
    const vocabsSet: string[] = [];
    script.vocabs.forEach((v) => {
        const lineArr = v.split(", ");
        if (lineArr[1] !== undefined) {
            vocabsSet.push(...lineArr[1].split("/"));
        }
    });
    script.paragraphs.forEach((paragraph) => {
        const sentences = paragraph.sentences.map((sentence, k) => {
            let text = "";
            let startTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.startTime));
            let endTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.endTime));
            if (sentence.texts.length === 1) {
                const textTrans = sentence.texts[0].split("\n");
                text = `${textTrans[0]}\\N\\N{\\fs6}${textTrans[1]}`;
            } else if (sentence.texts.length > 1) {
                text = sentence.texts
                    .map((line, index, texts) => {
                        const roleDia = paragraph.roles.length === texts.length ? paragraph.roles[index].split("-") : [];
                        const textDia = line.split("\n");
                        return roleDia.length === 2 ? `${roleDia[0]}: ${textDia[0]}\\N{\\fs6}${roleDia[1]}: ${textDia[1]}` : `${textDia[0]}\\N{\\fs6}${textDia[1]}`;
                    })
                    .join("\\N---\\N{\\fs8}");
            }
            return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,text}`;
        });
        dialogues.push(...sentences);
    });
    return base + dialogues.join("\n");
};

/*
 * 中英单独显示，中文中间，英文底部
 */
export const assCreate = (script: DataScript): string => {
    let assBase = `[Script Info]
Title: ${script.name}
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: EN,Yantramanav,${script.assFormat.enFontSize},&${script.assFormat.enFontColor},&H000000FF,&${script.assFormat.enFontOutlineColor},&H80000000,-1,0,0,0,100,100,0,0,1,${script.assFormat.enFontOutlineWidth},0,${script.assFormat.enAlignment},${script.assFormat.enMarginLR},${script.assFormat.enMarginLR},${script.assFormat.enMarginV},1
Style: CN,Arial,${script.assFormat.cnFontSize},&${script.assFormat.cnFontColor},&H000000FF,&${script.assFormat.cnFontOutlineColor},&H80000000,-1,0,0,0,100,100,0,0,1,${script.assFormat.cnFontOutlineWidth},0,${script.assFormat.cnAlignment},${script.assFormat.cnMarginLR},${script.assFormat.cnMarginLR},${script.assFormat.cnMarginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
    const dialogues: string[] = [];
    const vocabsEnSet: string[] = [];
    const vocabsCnSet: string[] = [];
    const textEnSpecStyle: string[] = [`{\\c&${script.assFormat.enFontColorInline}&\\bord${script.assFormat.enFontOutlineWidth}\\3c&${script.assFormat.enFontOutlineColor}&}`, `{\\c&${script.assFormat.enFontColor}&\\bord${script.assFormat.enFontOutlineWidth}\\3c&${script.assFormat.enFontOutlineColor}&}`];
    const textCnSpecStyle: string[] = [`{\\c&${script.assFormat.cnFontColorInline}&\\bord${script.assFormat.cnFontOutlineWidth}\\3c&${script.assFormat.cnFontOutlineColor}&}`, `{\\c&${script.assFormat.cnFontColor}&\\bord${script.assFormat.cnFontOutlineWidth}\\3c&${script.assFormat.cnFontOutlineColor}&}`];
    script.vocabs.forEach((v) => {
        const linePar = v.split(", ");
        if (linePar[1] !== undefined) {
            vocabsEnSet.push(...linePar[1].split("/"));
        }
        if (linePar[0] !== undefined) {
            const cnPar = linePar[0].split(".");
            if (cnPar[1] !== undefined) {
                vocabsCnSet.push(...cnPar[1].split(";"));
            }
        }
    });
    script.paragraphs.forEach((paragraph) => {
        paragraph.sentences.forEach((sentence, k) => {
            const startTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.startTime));
            const endTime = fnFloatToASSTime(fnSRTTimeToFloat(sentence.endTime));
            if (sentence.texts.length === 1) {
                const textTrans = sentence.texts[0].split("\n");
                dialogues.push(`Dialogue: 0,${startTime},${endTime},EN,,0,0,0,,${assTextFilter(textTrans[0], 0, vocabsEnSet, textEnSpecStyle, script.assFormat.cnLineBreak)}`);
                dialogues.push(`Dialogue: 0,${startTime},${endTime},CN,,0,0,0,,${assTextFilter(textTrans[1], 1, vocabsCnSet, textCnSpecStyle, script.assFormat.cnLineBreak)}`);
            } else if (sentence.texts.length > 1) {
                sentence.texts.forEach((line, index, texts) => {
                    const roleDia = paragraph.roles.length === texts.length ? paragraph.roles[index].split("-") : [];
                    const roleEN = roleDia.length === 2 ? roleDia[0] : "";
                    const roleCN = roleDia.length === 2 ? roleDia[1] : "";
                    const textDia = line.split("\n");
                    dialogues.push(`Dialogue: 0,${startTime},${endTime},EN,,0,0,0,,${roleEN}: ${assTextFilter(textDia[0], 0, vocabsEnSet, textEnSpecStyle, script.assFormat.cnLineBreak)}`);
                    dialogues.push(`Dialogue: 0,${startTime},${endTime},CN,,0,0,0,,${roleCN}: ${assTextFilter(textDia[1], 1, vocabsCnSet, textCnSpecStyle, script.assFormat.cnLineBreak)}`);
                });
            }
        });
    });
    return assBase + dialogues.join("\n");
};

/*
 * 中英单独显示，中文中间，英文底部
 */
export const assDemoCreate = (script: DataScript): string => {
    let assBase = `[Script Info]
Title: ${script.name}
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
Timer: 100.0000
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: EN,Yantramanav,${script.assFormat.enFontSize},&${script.assFormat.enFontColor},&H000000FF,&${script.assFormat.enFontOutlineColor},&H80000000,-1,0,0,0,100,100,0,0,1,${script.assFormat.enFontOutlineWidth},0,${script.assFormat.enAlignment},${script.assFormat.enMarginLR},${script.assFormat.enMarginLR},${script.assFormat.enMarginV},1
Style: CN,Arial,${script.assFormat.cnFontSize},&${script.assFormat.cnFontColor},&H000000FF,&${script.assFormat.cnFontOutlineColor},&H80000000,-1,0,0,0,100,100,0,0,1,${script.assFormat.cnFontOutlineWidth},0,${script.assFormat.cnAlignment},${script.assFormat.cnMarginLR},${script.assFormat.cnMarginLR},${script.assFormat.cnMarginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
    const dialogues: string[] = [];
    const vocabsEnSet: string[] = [];
    const vocabsCnSet: string[] = [];
    const textEnSpecStyle: string[] = [`{\\c&${script.assFormat.enFontColorInline}&\\bord${script.assFormat.enFontOutlineWidth}\\3c&${script.assFormat.enFontOutlineColor}&}`, `{\\c&${script.assFormat.enFontColor}&\\bord${script.assFormat.enFontOutlineWidth}\\3c&${script.assFormat.enFontOutlineColor}&}`];
    const textCnSpecStyle: string[] = [`{\\c&${script.assFormat.cnFontColorInline}&\\bord${script.assFormat.cnFontOutlineWidth}\\3c&${script.assFormat.cnFontOutlineColor}&}`, `{\\c&${script.assFormat.cnFontColor}&\\bord${script.assFormat.cnFontOutlineWidth}\\3c&${script.assFormat.cnFontOutlineColor}&}`];
    script.vocabs.forEach((v) => {
        const linePar = v.split(", ");
        if (linePar[1] !== undefined) {
            vocabsEnSet.push(...linePar[1].split("/"));
        }
        if (linePar[0] !== undefined) {
            const cnPar = linePar[0].split(".");
            if (cnPar[1] !== undefined) {
                vocabsCnSet.push(...cnPar[1].split(";"));
            }
        }
    });
    dialogues.push(`Dialogue: 0,00:00:00.00,00:00:00.01,EN,,0,0,0,,Jack: ${assTextFilter("Do you trust me?", 0, vocabsEnSet, textEnSpecStyle, script.assFormat.cnLineBreak)}`);
    dialogues.push(`Dialogue: 0,00:00:00.00,00:00:00.01,EN,,0,0,0,,Rose: ${assTextFilter("At least 113 people, including Dotel, were killed, according to emergency services in an update on Wednesday. The National Emergency System previously announced on Tuesday that more than 200 people had been injured in the roof collapse.", 0, vocabsEnSet, textEnSpecStyle, script.assFormat.cnLineBreak)}`);
    dialogues.push(`Dialogue: 0,00:00:00.00,00:00:00.01,CN,,0,0,0,,杰克：${assTextFilter("方俊凯解释，这与台湾女性经济自主与职场竞争压力有关，而他的女性患者中高阶主管比例高，她们比一般白领女性更需社交应酬、与男性竞争资源与地位。台湾戒酒暨酒瘾防治中心主任方俊凯指出，目前全台湾参与戒酒方案者25%为女性。他从2000年初 开设酒瘾戒瘾团体治疗，其诊女性患者从个位数至今已达36%？", 1, vocabsCnSet, textCnSpecStyle, script.assFormat.cnLineBreak)}`);
    dialogues.push(`Dialogue: 0,00:00:00.00,00:00:00.01,CN,,0,0,0,,罗丝：${assTextFilter("我相信你。", 1, vocabsCnSet, textCnSpecStyle, script.assFormat.cnLineBreak)}`);
    return assBase + dialogues.join("\n");
};

export const assWrite = async (input: string, output: string): Promise<void> => {
    try {
        if (!fs.existsSync(input)) {
            throw new Error(`origin.json does not exist.`);
        }
        const contentJson = await fsPromise.readFile(input, "utf8");
        const data: DataScript = JSON.parse(contentJson);
        const contentAss = assCreate(data);
        await fsPromise.writeFile(output, contentAss, "utf8");
    } catch (error) {
        throw new Error(`Failed to write ass file: ${(error as Error).message}`);
    }
};

export const assDemoWrite = async (input: string, output: string): Promise<void> => {
    try {
        if (!fs.existsSync(input)) {
            throw new Error(`origin.json does not exist.`);
        }
        const contentJson = await fsPromise.readFile(input, "utf8");
        const data: DataScript = JSON.parse(contentJson);
        const contentAss = assDemoCreate(data);
        await fsPromise.writeFile(output, contentAss, "utf8");
    } catch (error) {
        throw new Error(`Failed to write ass file: ${(error as Error).message}`);
    }
};

export const assTextFilter = (text: string, type: number, vocabs: string[], style: string[], vocabsLimit: number): string => {
    let content = type === 0 ? text : assInsertLineBreak(text, vocabsLimit);
    vocabs.forEach((vocab: string) => {
        const regex = type === 0 ? new RegExp(`\\b${vocab}\\b`, "gi") : new RegExp(vocab, "g");
        const maRes = text.match(regex);
        if (maRes && maRes[0]) {
            content = content.replaceAll(maRes[0], `${style[0]}${maRes[0]}${style[1]}`);
        }
    });
    return content;
};

// 处理汉字无法自动换行的问题
export const assInsertLineBreak = (text: string, limit: number = 20) => {
    let res = "";
    let cnCount = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        res += char;
        if (/[\u4e00-\u9fa5\uff00-\uffef]/.test(char)) {
            cnCount++;
            if (cnCount > 0 && cnCount % limit === 0) {
                res += "\\N";
            }
        }
    }
    return res;
};

// Deprecated
export const assMatchProperty = (content: string, params: any): string => {
    const formatLine = content.match(/^Format:([^\r\n]+$)/m);
    const fields = formatLine && formatLine[1] !== undefined ? formatLine[1].split(",").map((f) => f.trim()) : [];
    return content.replace(/^Style:([^\r\n]+$)/m, (lineName, lineValue) => {
        const styles = lineValue.split(",").map((v: string) => v.trim());
        const IndexFontsize = fields.indexOf("Fontsize");
        const IndexPrimaryColour = fields.indexOf("PrimaryColour");
        const IndexOutline = fields.indexOf("Outline");
        const IndexOutlineColour = fields.indexOf("OutlineColour");
        const IndexAlignment = fields.indexOf("Alignment");
        const IndexMarginL = fields.indexOf("MarginL");
        const IndexMarginR = fields.indexOf("MarginR");
        const IndexMarginV = fields.indexOf("MarginV");
        if (IndexFontsize >= 0) {
            styles[IndexFontsize] = params.enFontSize;
        }
        if (IndexPrimaryColour >= 0) {
            styles[IndexPrimaryColour] = `#${params.enFontColor}`;
        }
        if (IndexOutline >= 0) {
            styles[IndexOutline] = params.enFontOutlineWidth;
        }
        if (IndexOutlineColour >= 0) {
            styles[IndexOutlineColour] = `#${params.enFontOutlineColor}`;
        }
        if (IndexAlignment >= 0) {
            styles[IndexAlignment] = params.alignment;
        }
        if (IndexMarginL >= 0) {
            styles[IndexMarginL] = params.marginLR;
        }
        if (IndexMarginR >= 0) {
            styles[IndexMarginR] = params.marginLR;
        }
        if (IndexMarginV >= 0) {
            styles[IndexMarginV] = params.marginV;
        }
        return `Style: ${styles.join(",")}`;
    });
};
