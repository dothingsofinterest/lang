import React, { useState, useRef, useEffect } from "react";
import { Input, Space, Button, Upload, Tree, Select, InputNumber, Mentions } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import "./Script.scss";
interface Script {
    name: string;
    roles: string[];
    scenes: string[];
    words: string[];
    grammers: string[];
    paragraghs: Paragragh[];
}
interface Paragragh {
    key: string;
    scene: string;
    roles: string[];
    children: Sentence[];
}
interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}
const Script = React.memo(() => {
    const [script, setScript] = useState<Script>({
        name: "",
        roles: [],
        scenes: [],
        words: [],
        grammers: [],
        paragraghs: [
            {
                key: "0",
                scene: "",
                roles: [],
                children: [
                    {
                        key: "0-0",
                        startTime: "",
                        endTime: "",
                        texts: [],
                    },
                ],
            },
        ],
    });
    const [renderVersion, setRenderVersion] = useState(0); // 用于强制刷新
    const [parsedWords, setParsedWords] = useState("");
    const [timeOffset, setTimeOffset] = useState<number>(0);
    const refScrollbar = useRef<Scrollbars>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const refCurSentenceKey = useRef("0-0");
    const refScrollTop = useRef(0);
    // Event Handlers
    const handlersSubImportScript = (file: any) => {
        if (/^(.+?)\.(json|JSON)$/g.test(file.name)) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = (e) => {
                try {
                    if (e.target?.result) {
                        const content = e.target.result as string;
                        setScript(JSON.parse(content));
                        setRenderVersion((prev) => prev + 1);
                    }
                } catch (e: any) {
                    alert(e.message);
                }
            };
        } else {
            alert("Please upload json file.");
        }
        return false;
    };
    const handlersSubExportJSON = async () => {
        try {
            const blob = new Blob([JSON.stringify(fnGetScriptWithTimeOffset(), null, 4)], { type: "application/json" });
            const handle = await await (window as any).showSaveFilePicker({
                suggestedName: `${script.name}.json`,
                types: [
                    {
                        description: script.name,
                        accept: { "application/json": [".json"] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error("save error: ", error);
        }
    };
    const handlersSubExportSRT = async () => {
        console.log("script", script);
        try {
            const blob = new Blob([fnGetSRT()], { type: "text/srt" });
            const handle = await await (window as any).showSaveFilePicker({
                suggestedName: `${script.name}.srt`,
                types: [
                    {
                        description: script.name,
                        accept: { "text/srt": [".srt"] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error("save error: ", error);
        }
    };
    // 使用方法：为已存在的字幕添加时间偏移，导出。再导入不再依赖偏移。
    const handlersSubUpdateTimeOffset = (timeOffset: number | null) => {
        if (timeOffset !== null && !isNaN(timeOffset)) {
            const firstStartTime = script.paragraghs[0].children[0].startTime;
            const firstStartTimeN = fnSRTTimeToFloat(firstStartTime) + timeOffset;
            if (firstStartTimeN > 0) {
                setTimeOffset(timeOffset);
                setRenderVersion((prev) => prev + 1);
            }
        }
    };
    const handlersSubInsertParagraph = () => {
        refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
        const curParagraghKey = parseInt(refCurSentenceKey.current.split("-")[0]);
        const a = script.paragraghs.slice(0, curParagraghKey + 1);
        a.push({
            key: ``,
            scene: ``,
            roles: [],
            children: [
                {
                    key: "",
                    startTime: "",
                    endTime: "",
                    texts: [],
                },
            ],
        });
        const b = script.paragraghs.slice(curParagraghKey + 1);
        script.paragraghs = [...a, ...b].map((v, k) => {
            v.key = `${k}`;
            v.children = v.children.map((vv, kk) => {
                vv.key = `${k}-${kk}`;
                return vv;
            });
            return v;
        });
        setRenderVersion((prev) => prev + 1);
    };
    const handlersSubCutParagraph = () => {
        const curKey = refCurSentenceKey.current.split("-");
        const curParagragh = script.paragraghs[parseInt(curKey[0])];
        if (curParagragh !== undefined) {
            if (curParagragh.children.length > 1) {
                const curParagraghChildren = curParagragh.children.slice(0, parseInt(curKey[1]));
                const newParagraghChildren = curParagragh.children.slice(parseInt(curKey[1]));
                curParagragh.children = curParagraghChildren;
                const a = script.paragraghs.slice(0, parseInt(curKey[0]) + 1);
                a.push({
                    key: ``,
                    scene: ``,
                    roles: [],
                    children: newParagraghChildren,
                });
                const b = script.paragraghs.slice(parseInt(curKey[0]) + 1);
                script.paragraghs = [...a, ...b].map((v, k) => {
                    v.key = `${k}`;
                    v.children = v.children.map((vv, kk) => {
                        vv.key = `${k}-${kk}`;
                        return vv;
                    });
                    return v;
                });
                refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
                setRenderVersion((prev) => prev + 1);
            }
        }
    };
    const handlersSubDeleteParagraph = () => {
        if (refCurSentenceKey.current) {
            const curParagraghKey = parseInt(refCurSentenceKey.current.split("-")[0]);
            const curParagragh = script.paragraghs[curParagraghKey];
            if (curParagragh !== undefined) {
                if (script.paragraghs.length > 1) {
                    const a = script.paragraghs.slice(0, curParagraghKey);
                    const b = script.paragraghs.slice(curParagraghKey + 1);
                    script.paragraghs = [...a, ...b].map((v, k) => {
                        v.key = `${k}`;
                        v.children = v.children.map((vv, kk) => {
                            vv.key = `${k}-${kk}`;
                            return vv;
                        });
                        return v;
                    });
                    refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
                    setRenderVersion((prev) => prev + 1);
                }
            }
        }
    };
    const handlersSubUpdateName = (value: string) => {
        if (value !== script.name) {
            setScript({ ...script, name: value });
        }
    };
    const handlersSubUpdateRoles = (value: string) => {
        if (value !== script.roles.join("/")) {
            setScript({ ...script, roles: value ? value.split("/") : [] });
        }
    };
    const handlersSubUpdateScenes = (value: string) => {
        if (value !== script.scenes.join("/")) {
            setScript({ ...script, scenes: value ? value.split("/") : [] });
        }
    };
    const handlersSubUpdateWords = (value: string) => {
        if (value !== script.words.join("\n")) {
            setScript({ ...script, words: value.split("\n") });
        }
    };
    const handlersSubUpdateGrammers = (value: string) => {
        if (value !== script.grammers.join("\n---\n")) {
            setScript({ ...script, grammers: value.split("\n---\n") });
        }
    };
    const handlersSubUpdateStartTime = (event: any, key: string) => {
        if (event.target.value) {
            try {
                if (!fnIsSRTTime(event.target.value)) {
                    throw new Error(`Invalid time format: ${event.target.value}`);
                }
                const keyArr = key.split("-");
                const curParagraghKey: number = parseInt(keyArr[0]);
                const curParagragh = script.paragraghs[curParagraghKey];
                if (curParagragh !== undefined) {
                    const lastParagragh = script.paragraghs[curParagraghKey - 1];
                    if (lastParagragh !== undefined) {
                        const lastSentenceInLastParagragh = lastParagragh.children[lastParagragh.children.length - 1];
                        if (lastSentenceInLastParagragh !== undefined) {
                            if (fnSRTTimeToFloat(event.target.value) < fnSRTTimeToFloat(lastSentenceInLastParagragh.endTime)) {
                                throw new Error(`Subtitle time error.`);
                            }
                        }
                    }
                    const curSentenceKey: number = parseInt(keyArr[1]);
                    const lastSentence = curParagragh.children[curSentenceKey - 1];
                    if (lastSentence !== undefined) {
                        if (fnSRTTimeToFloat(event.target.value) < fnSRTTimeToFloat(lastSentence.endTime)) {
                            throw new Error(`Subtitle time error.`);
                        }
                    }
                    const curSentence = curParagragh.children[curSentenceKey];
                    if (curSentence !== undefined) {
                        if (curSentence.startTime !== event.target.value) {
                            curParagragh.children = curParagragh.children.map((v) => {
                                return v.key == curSentence.key ? { ...curSentence, startTime: event.target.value } : v;
                            });
                            const newParagraghs = script.paragraghs.map((v) => {
                                return v.key == curParagragh.key ? curParagragh : v;
                            });
                            setScript({ ...script, paragraghs: newParagraghs });
                        }
                    }
                }
            } catch (e: any) {
                alert(`${e.message}`);
            }
        }
    };
    const handlersSubUpdateEndTime = (event: any, key: string) => {
        if (event.target.value) {
            try {
                if (!fnIsSRTTime(event.target.value)) {
                    throw new Error(`Invalid time format: ${event.target.value}`);
                }
                const keyArr = key.split("-");
                const curParagraghKey = keyArr[0];
                const curParagragh = script.paragraghs.find((v) => {
                    return v.key == curParagraghKey;
                });
                if (curParagragh !== undefined) {
                    const curSentence = curParagragh.children.find((v) => {
                        return v.key == key;
                    });
                    if (curSentence !== undefined) {
                        if (curSentence.endTime !== event.target.value) {
                            if (fnSRTTimeToFloat(event.target.value) <= fnSRTTimeToFloat(curSentence.startTime)) {
                                throw new Error(`Subtitle time error.`);
                            }
                            curParagragh.children = curParagragh.children.map((v) => {
                                return v.key == curSentence.key ? { ...curSentence, endTime: event.target.value } : v;
                            });
                            const newParagraghs = script.paragraghs.map((v) => {
                                return v.key == curParagragh.key ? curParagragh : v;
                            });
                            setScript({ ...script, paragraghs: newParagraghs });
                        }
                    }
                }
            } catch (e: any) {
                alert(e.message);
            }
        }
    };
    const handlersSubUpdateText = (event: any, key: string) => {
        if (event.target.value) {
            const keyArr = key.split("-");
            const curParagraghKey = keyArr[0];
            const curParagragh = script.paragraghs[parseInt(curParagraghKey)];
            if (curParagragh !== undefined) {
                const curSentence = curParagragh.children.find((v) => {
                    return v.key == key;
                });
                if (curSentence !== undefined) {
                    if (event.target.value !== curSentence?.texts.join("\n---\n")) {
                        curParagragh.children = curParagragh.children.map((v) => {
                            return v.key == curSentence.key
                                ? {
                                      ...curSentence,
                                      texts: event.target.value.split("\n---\n"),
                                  }
                                : v;
                        });
                        const newParagraghs = script.paragraghs.map((v) => {
                            return v.key == curParagragh.key ? curParagragh : v;
                        });
                        setScript({ ...script, paragraghs: newParagraghs });
                    }
                }
            }
        }
    };
    const handlersSubUpdateRole = (value: string, key: string) => {
        const curParagragh = script.paragraghs[parseInt(key)];
        if (curParagragh !== undefined) {
            const match = value ? value.trim().match(/@[^@]+/g) : null;
            const res = match !== null ? match.map((v) => v.slice(1)) : [];
            const newParagragh = {
                ...curParagragh,
                roles: res,
            };
            const newParagraghs = script.paragraghs.map((v) => {
                return v.key === newParagragh.key ? newParagragh : v;
            });
            setScript({ ...script, paragraghs: newParagraghs });
        }
    };
    const handlersSubUpdateScene = (value: string, key: string) => {
        const curParagragh = script.paragraghs[parseInt(key)];
        if (curParagragh !== undefined) {
            const newParagragh = { ...curParagragh, scene: value };
            const newParagraghs = script.paragraghs.map((v) => {
                return v.key === newParagragh.key ? newParagragh : v;
            });
            setScript({ ...script, paragraghs: newParagraghs });
        }
    };
    const handlersKeyboardOnDown = (event: KeyboardEvent) => {
        if (event.key === "7") {
        } else if (event.key === "9") {
        } else if (event.key === "8") {
        }
    };
    const handlersSubInsertSentence = () => {
        const curKey = refCurSentenceKey.current.split("-");
        const curParagragh = script.paragraghs[parseInt(curKey[0])];
        if (curParagragh !== undefined) {
            const a = curParagragh.children.slice(0, parseInt(curKey[1]) + 1);
            a.push({ key: "n", startTime: "", endTime: "", texts: [] });
            const b = curParagragh.children.slice(parseInt(curKey[1]) + 1);
            curParagragh.children = [...a, ...b].map((v, k) => {
                v.key = `${curKey[0]}-${k}`;
                return v;
            });
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubDeleteSentence = () => {
        const curKey = refCurSentenceKey.current.split("-");
        const curParagragh = script.paragraghs[parseInt(curKey[0])];
        if (curParagragh !== undefined) {
            if (curParagragh.children.length > 1) {
                const a = curParagragh.children.slice(0, parseInt(curKey[1]));
                const b = curParagragh.children.slice(parseInt(curKey[1]));
                b.shift();
                curParagragh.children = [...a, ...b].map((v, k) => {
                    v.key = `${curParagragh.key}-${k}`;
                    return v;
                });
                refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
                setRenderVersion((prev) => prev + 1);
            }
        }
    };
    const handlersSubSetCurSentence = (key: string) => {
        refCurSentenceKey.current = key;
    };
    const handlersScroll = (event: React.UIEvent<HTMLElement>) => {
        const target = event.currentTarget;
        if (refPanel.current) {
            if (target.scrollTop > 50) {
                refPanel.current.classList.add("fixed");
            } else {
                refPanel.current.classList.remove("fixed");
            }
        }
    };
    // Event Handlers
    // Template Functions
    const filterPlusOffset = (SRTTime: string): string => {
        if (timeOffset) {
            const res = fnSRTTimeToFloat(SRTTime) + timeOffset;
            return res > 0 ? fnFloatToSRTTime(res) : SRTTime;
        } else {
            return SRTTime;
        }
    };
    const filterItemRoles = (roles: string[]): string => {
        return roles.length > 0 ? roles.map((v: string) => `@${v}`).join(" ") : "";
    };
    // Functions
    const fnFloatToSRTTime = (floatSeconds: number): string => {
        // 计算小时、分钟、秒数和毫秒
        const hours = Math.floor(floatSeconds / 3600);
        const minutes = Math.floor((floatSeconds % 3600) / 60);
        const seconds = Math.floor(floatSeconds % 60);
        const milliseconds = Math.round((floatSeconds % 1) * 1000);

        // 格式化成 SRT 时间格式 (hh:mm:ss,SSS)
        const timeString = `${fnPadZero(hours)}:${fnPadZero(minutes)}:${fnPadZero(seconds)},${fnPadZero(milliseconds, 3)}`;
        return timeString;
    };
    const fnSRTTimeToFloat = (srtTime: string): number => {
        // Split the SRT time into hours, minutes, seconds, and milliseconds
        const timeParts = srtTime.split(/[:,]/); // Split by ":" and ","
        // Parse the parts
        const hours = parseInt(timeParts[0], 10); // HH
        const minutes = parseInt(timeParts[1], 10); // MM
        const seconds = parseInt(timeParts[2], 10); // SS
        const milliseconds = parseInt(timeParts[3], 10); // SSS

        // Convert to seconds
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    };
    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const fnIsSRTTime = (value: string): boolean => {
        return value.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/) ? true : false;
    };
    const fnGetScriptWithTimeOffset = (): Script => {
        const newParagraghs = script.paragraghs.map((value) => {
            const newChildren = value.children.map((v) => {
                let startTime = v.startTime;
                let endTime = v.endTime;
                if (timeOffset && fnSRTTimeToFloat(script.paragraghs[0].children[0].startTime) + timeOffset > 0) {
                    startTime = fnFloatToSRTTime(fnSRTTimeToFloat(v.startTime) + timeOffset);
                    endTime = fnFloatToSRTTime(fnSRTTimeToFloat(v.endTime) + timeOffset);
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
    const fnGetSRT = (): string => {
        let count = 1;
        const subArr: string[] = [];
        script.paragraghs.forEach((paragragh, key, origin) => {
            const childrenArr = paragragh.children.map((sentence, k) => {
                let startTime = sentence.startTime;
                let endTime = sentence.endTime;
                let text = "";
                if (timeOffset && fnSRTTimeToFloat(script.paragraghs[0].children[0].startTime) + timeOffset > 0) {
                    startTime = fnFloatToSRTTime(fnSRTTimeToFloat(sentence.startTime) + timeOffset);
                    endTime = fnFloatToSRTTime(fnSRTTimeToFloat(sentence.endTime) + timeOffset);
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
    const fnParseWords = (text: string) => {
        if (text) {
            const res = [];
            const types = [/(n)\.\s*([^\n]+)/, /\b(v|vi|vt)\.\s*([^\n]+)/, /(adj)\.\s*([^\n]+)/, /(adv)\.\s*([^\n]+)/, /(conj)\.\s*([^\n]+)/, /(pron)\.\s*([^\n]+)/, /(prep)\.\s*([^\n]+)/];
            for (let i = 0; i < types.length; i++) {
                const matchCN = text.match(types[i]);
                if (matchCN && matchCN[2]) {
                    let str = "";
                    str += i === 1 ? `v.${matchCN[2]}, ` : `${matchCN[1]}.${matchCN[2]}, `;
                    const matchName = text.match(/^([a-zA-Z ]+)/);
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
                            const nameExt = [/第三人称单数(.*?)(\w+)/, /过去式(.*?)(\w+)/, /过去分词(.*?)(\w+)/, /现在分词(.*?)(\w+)/];
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
            setParsedWords(res.join("\n"));
        }
    };
    // Template Functions
    useEffect(() => {
        // 添加键盘事件监听器
        window.addEventListener("keydown", handlersKeyboardOnDown);
        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", handlersKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        refScrollbar.current?.scrollTop(refScrollTop.current);
    }, [renderVersion]);
    console.log("----------Script Component Loaded----------");
    return (
        <Scrollbars key={renderVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
            <div ref={refPanel} style={{ width: "100%", marginBottom: "10px", height: "32px", display: "flex", justifyContent: "space-between" }}>
                <Upload beforeUpload={handlersSubImportScript} showUploadList={false}>
                    <Button style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>Import</Button>
                </Upload>
                <Button onClick={handlersSubExportJSON} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    Export
                </Button>
                <Button onClick={handlersSubExportSRT} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    SRT
                </Button>
                <InputNumber min={-100.0} max={100.0} step={0.01} value={timeOffset} onChange={(v) => handlersSubUpdateTimeOffset(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                <Button icon={<ScissorOutlined />} onClick={handlersSubCutParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    Cut S-P
                </Button>
                <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    P
                </Button>
                <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    P
                </Button>
                <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertSentence} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    S
                </Button>
                <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteSentence} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    S
                </Button>
            </div>
            <div style={{ width: "100%", display: "flex", marginBottom: "4px" }}>
                <Input defaultValue={script.name} onBlur={(e) => handlersSubUpdateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
                <Input defaultValue={script.roles.join("/")} onBlur={(e) => handlersSubUpdateRoles(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Role1-角色1/Role2-角色2" />
                <Input defaultValue={script.scenes.join("/")} onBlur={(e) => handlersSubUpdateScenes(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Scene1-场景1/Scene2-场景2" />
            </div>
            <Tree
                selectable={false}
                style={{ height: "100%", borderRadius: "0" }}
                showLine
                defaultExpandAll
                treeData={script.paragraghs}
                titleRender={(item: any) => {
                    // console.log(item);
                    return item.roles ? (
                        <div style={{ width: "100%", display: "flex" }}>
                            <Select size="small" onChange={(v) => handlersSubUpdateScene(v, item.key)} defaultValue={item.scene} options={script.scenes.map((v) => ({ label: v, value: v }))} style={{ width: "426px", borderRadius: 0 }} />
                            <Mentions autoSize onChange={(v) => handlersSubUpdateRole(v, item.key)} defaultValue={filterItemRoles(item.roles)} options={script.roles.map((v) => ({ label: v, value: v }))} style={{ fontSize: "12px", lineHeight: "22px", borderRadius: 0, marginLeft: "4px" }} placeholder="@Role1-角色1 @Role2-角色2" />
                        </div>
                    ) : (
                        <div style={{ width: "100%" }}>
                            <div style={{ width: "100%", display: "flex" }}>
                                <Space size="small" style={{ flex: "0 0 100px", rowGap: "4px", overflow: "hidden" }} direction="vertical">
                                    <Input size="small" defaultValue={filterPlusOffset(item.startTime)} onBlur={(e) => handlersSubUpdateStartTime(e, item.key)} style={{ borderRadius: 0 }} placeholder="00:00:00,000" />
                                    <Input size="small" defaultValue={filterPlusOffset(item.endTime)} onBlur={(e) => handlersSubUpdateEndTime(e, item.key)} style={{ borderRadius: 0 }} placeholder="00:00:00,001" />
                                </Space>
                                <Input.TextArea autoSize defaultValue={item.texts.join("\n---\n")} onFocus={(e) => handlersSubSetCurSentence(item.key)} onBlur={(e) => handlersSubUpdateText(e, item.key)} style={{ flex: 1, fontSize: "12px", minHeight: "52px", marginLeft: "4px", borderRadius: "0", color: "#000" }} />
                            </div>
                        </div>
                    );
                }}
            />
            <div style={{ width: "100%" }}>
                <Input.TextArea autoSize value={parsedWords} onChange={(e) => fnParseWords(e.target.value)} style={{ flex: 1, minHeight: "100px", borderRadius: "0", color: "#000" }} placeholder="Paste Words" />
                <Input.TextArea
                    autoSize
                    defaultValue={script.words.join("\n")}
                    onBlur={(e) => handlersSubUpdateWords(e.target.value)}
                    style={{ flex: 1, minHeight: "200px", borderRadius: "0", color: "#000" }}
                    placeholder="n.内容;目录, content/contents, /ˈkɑːntent/ &#10;v.满足, content/contents/contented/contented/contenting, /kənˈtent/ &#10;adj.满意的, content, /kənˈtent/"
                />
                <Input.TextArea
                    autoSize
                    defaultValue={script.grammers.join("\n---\n")}
                    onBlur={(e) => handlersSubUpdateGrammers(e.target.value)}
                    style={{ flex: 1, minHeight: "200px", borderRadius: "0", color: "#000" }}
                    placeholder="Unfamiliar Grammars. &#10;To separate piece by ---"
                />
            </div>
        </Scrollbars>
    );
});
export default Script;
