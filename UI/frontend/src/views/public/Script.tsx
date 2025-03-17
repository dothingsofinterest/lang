import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Space, Button, Upload, Checkbox, Tree, Select, InputNumber, Mentions } from "antd";
import "./Script.scss";
import WaveSurfer from "wavesurfer.js";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, MinusCircleOutlined, PlusCircleOutlined, UploadOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
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
    title: string;
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
const Script = () => {
    const [script, setScript] = useState<Script>({
        name: "",
        roles: [],
        scenes: [],
        words: [],
        grammers: [],
        paragraghs: [
            {
                key: "0",
                title: "P0",
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
    const [curSentenceKey, setCurSentenceKey] = useState("0-0");
    const [panelVersion, setPanelVersion] = useState(0); // 用于强制刷新
    const [parsedWords, setParsedWords] = useState("");
    const [current, setCurrent] = useState("00:00:00,000 / 0");
    const [waveScale, setWaveScale] = useState(0);
    const [videoSRC, setVideoSRC] = useState("");
    const [timeOffset, setTimeOffset] = useState<number>(0.0);
    const [lastScrollTop, setLastScrollTop] = useState<number>(0);
    const [videoMuted, setVideoMuted] = useState(false);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refScrollbar = useRef<Scrollbars>(null);
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
                        setPanelVersion((prev) => prev + 1);
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
            // const a = document.createElement("a");
            // a.href = window.URL.createObjectURL(blob);
            // a.download = `${script.name}.json`;
            // window.document.body.appendChild(a);
            // a.click();
            // window.URL.revokeObjectURL(a.href);
            // window.document.body.removeChild(a);
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
        try {
            const blob = new Blob([fnGetSRT()], { type: "text/srt" });
            // const ab = document.createElement("a");
            // ab.href = window.URL.createObjectURL(blob2);
            // ab.download = `${script.name}.srt`;
            // window.document.body.appendChild(ab);
            // ab.click();
            // window.URL.revokeObjectURL(ab.href);
            // window.document.body.removeChild(ab);
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
    const handlersSubUpdateTimeOffset = (v: number | null) => {
        if (v !== null && !isNaN(v)) {
            setTimeOffset(v);
            setPanelVersion((prev) => prev + 1);
        }
    };
    const handlersSubInsertParagraph = () => {
        const scrollToTop = refScrollbar.current?.getScrollTop() || 0;
        const curParagraghKey = curSentenceKey.split("-")[0];
        const a = script.paragraghs.slice(0, parseInt(curParagraghKey) + 1);
        a.push({
            key: ``,
            title: ``,
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
        const b = script.paragraghs.slice(parseInt(curParagraghKey) + 1);
        const newParagraghs = [...a, ...b].map((v, k) => {
            v.key = `${k}`;
            v.title = `P${k}`;
            v.children = v.children.map((vv, kk) => {
                vv.key = `${k}-${kk}`;
                return vv;
            });
            return v;
        });
        setScript({ ...script, paragraghs: newParagraghs });
        setPanelVersion((prev) => prev + 1);
        setLastScrollTop(scrollToTop);
    };
    const handlersSubCutParagraph = () => {
        const scrollToTop = refScrollbar.current?.getScrollTop() || 0;
        const curKey = curSentenceKey.split("-");
        const curParagragh = script.paragraghs[parseInt(curKey[0])];
        const childrenA = curParagragh.children.slice(0, parseInt(curKey[1]));
        const childrenB = curParagragh.children.slice(parseInt(curKey[1]));
        curParagragh.children = childrenA;
        const a = script.paragraghs.slice(0, parseInt(curKey[0]));
        a.push(curParagragh, {
            key: ``,
            title: ``,
            scene: ``,
            roles: [],
            children: childrenB,
        });
        const b = script.paragraghs.slice(parseInt(curKey[0]) + 1);
        const newParagraghs = [...a, ...b].map((v, k) => {
            v.key = `${k}`;
            v.title = `P${k}`;
            v.children = v.children.map((vv, kk) => {
                vv.key = `${k}-${kk}`;
                return vv;
            });
            return v;
        });
        setScript({ ...script, paragraghs: newParagraghs });
        setPanelVersion((prev) => prev + 1);
        setLastScrollTop(scrollToTop);
    };
    const handlersSubDeleteParagraph = () => {
        if (curSentenceKey !== undefined) {
            const curParagraghKey = curSentenceKey.split("-")[0];
            const curParagragh = script.paragraghs.find((v) => {
                return v.key == curParagraghKey;
            });
            if (curParagragh !== undefined) {
                if (script.paragraghs.length > 1) {
                    const scrollToTop = refScrollbar.current?.getScrollTop() || 0;
                    const curSentenceIndex = script.paragraghs.findIndex((v) => {
                        return v.key == curParagragh.key;
                    });
                    const a = script.paragraghs.slice(0, curSentenceIndex);
                    const b = script.paragraghs.slice(curSentenceIndex);
                    b.shift();
                    const newParagraghs = [...a, ...b].map((v, k) => {
                        v.key = `${k}`;
                        v.title = `P${k}`;
                        v.children = v.children.map((vv, kk) => {
                            vv.key = `${k}-${kk}`;
                            return vv;
                        });
                        return v;
                    });
                    setScript({ ...script, paragraghs: newParagraghs });
                    setPanelVersion((prev) => prev + 1);
                    setLastScrollTop(scrollToTop);
                }
            }
        }
    };
    const handlersSubUpdateName = (value: string) => {
        if (value) {
            setScript({ ...script, name: value });
            setPanelVersion((prev) => prev + 1);
        }
    };
    const handlersSubUpdateRoles = (value: string) => {
        setScript({ ...script, roles: value ? value.split("/") : [] });
        setPanelVersion((prev) => prev + 1);
    };

    const handlersSubUpdateScenes = (value: string) => {
        setScript({ ...script, scenes: value ? value.split("/") : [] });
        setPanelVersion((prev) => prev + 1);
    };
    const handlersSubUpdateWords = (value: string) => {
        if (value) {
            setScript({ ...script, words: value.split("\n") });
        }
    };
    const handlersSubUpdateGrammers = (value: string) => {
        if (value) {
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
                        curParagragh.children = curParagragh.children.map((v) => {
                            return v.key == curSentence.key ? { ...curSentence, startTime: event.target.value } : v;
                        });
                        const newParagraghs = script.paragraghs.map((v) => {
                            return v.key == curParagragh.key ? curParagragh : v;
                        });
                        setScript({ ...script, paragraghs: newParagraghs });
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
            } catch (e: any) {
                alert(e.message);
            }
        }
    };
    const handlersSubUpdateText = (event: any, key: string) => {
        if (event.target.value) {
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
    const handlersVideoUploadVideo = (file: any) => {
        if (/^(.+?)\.(mp4|MP4)$/g.test(file.name)) {
            const videoURL = URL.createObjectURL(file);
            setVideoSRC(videoURL);
            if (refVideo.current) {
                if (wavesurfer === null) {
                    const waver = WaveSurfer.create({
                        container: "#waver",
                        media: refVideo.current || undefined,
                        waveColor: "rgb(200, 0, 200)",
                        progressColor: "rgb(100, 0, 100)",
                        interact: true,
                        height: 129,
                        cursorColor: "rgb(87, 87, 89)",
                        autoScroll: true,
                        dragToSeek: true,
                    });
                    waver.on("click", async () => {
                        const currentTime = waver.getCurrentTime();
                        const SRTTime = fnFloatToSRTTime(currentTime);
                        waver.seekTo(currentTime / waver.getDuration());
                        await navigator.clipboard.writeText(SRTTime);
                        if (refVideo.current) {
                            refVideo.current.currentTime = currentTime;
                            setCurrent(`${SRTTime} / ${currentTime}`);
                        }
                    });
                    waver.setMuted(false);
                    waver.on("loading", (percent) => {
                        // console.log("Loading", percent + "%");
                    });
                    waver.on("ready", (duration) => {
                        console.log("Ready", duration + "s");
                    });
                    waver.once("decode", () => {
                        const slider = document.querySelector('input[type="range"]');
                        if (slider) {
                            slider.addEventListener("input", (e: any) => {
                                const minPxPerSec = e.target?.valueAsNumber;
                                waver.zoom(minPxPerSec);
                            });
                        }
                    });
                    setWavesurfer(waver);
                }
                refVideo.current.load();
            }
            return false;
        } else {
            alert("Please upload mp4 format video.");
        }
    };
    const handlersVideoPlayBackward = async () => {
        if (refVideo.current && videoSRC) {
            const pos = Math.max(0, refVideo.current.currentTime - 0.1);
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(`${SRTTime} / ${pos}`);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handlersVideoPlayForward = async () => {
        if (refVideo.current && videoSRC) {
            const pos = refVideo.current.currentTime + 0.1;
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(`${SRTTime} / ${pos}`);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handlersVideoPlay = () => {
        if (refVideo.current && videoSRC) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current
                    .play()
                    .then()
                    .catch((err) => {
                        console.error("播放失败:", err);
                    });
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
                if (wavesurfer) {
                    wavesurfer.pause();
                }
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersVideoSlide = (e: any) => {
        setWaveScale(e.target.value);
    };
    const handlersVideoMute = (e: any) => {
        console.log("script", script);
        console.log("curSentenceKey", curSentenceKey);
        setVideoMuted(e.target.checked);
        wavesurfer?.setMuted(e.target.checked);
    };
    const handlersVideoCanPlayThrough = () => {
        if (wavesurfer) {
            wavesurfer.load(videoSRC);
        }
    };
    const handlersVideoTagOnTimeUpdate = (e: any) => {
        // console.log("video current time:", e.target.currentTime);
        // console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlersVideoTagOnEnded = () => {
        setCurrent("00:00:00,000 / 0");
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTagOnPaused = async (e: any) => {
        const SRTTime = fnFloatToSRTTime(e.target.currentTime);
        await navigator.clipboard.writeText(SRTTime);
        setCurrent(`${SRTTime} / ${e.target.currentTime}`);
    };
    const handlersKeyboardOnDown = (event: KeyboardEvent) => {
        if (event.key === "7") {
            if (refVideo.current) {
                refVideo.current.currentTime = Math.max(0, refVideo.current.currentTime - 0.5);
            }
        } else if (event.key === "9") {
            if (refVideo.current) {
                refVideo.current.currentTime = refVideo.current.currentTime + 0.5;
            }
        } else if (event.key === "8") {
            // 如果当前是空格键，切换视频的播放和暂停
            if (refVideo.current) {
                if (refVideo.current.paused) {
                    refVideo.current.play();
                } else {
                    refVideo.current.pause();
                }
            }
        }
    };
    const handlersSubInsertSentence = () => {
        const curKey = curSentenceKey.split("-");
        const curParagragh = script.paragraghs[parseInt(curKey[0])];
        if (curParagragh !== undefined) {
            const a = curParagragh.children.slice(0, parseInt(curKey[1]) + 1);
            a.push({
                key: "n",
                startTime: "",
                endTime: "",
                texts: [],
            });
            const b = curParagragh.children.slice(parseInt(curKey[1]) + 1);
            curParagragh.children = [...a, ...b].map((v, k) => {
                v.key = `${curKey[0]}-${k}`;
                return v;
            });
            const newParagraghs = script.paragraghs.map((v) => {
                return v.key == curParagragh.key ? curParagragh : v;
            });
            const scrollToTop = refScrollbar.current?.getScrollTop() || 0;
            setScript({ ...script, paragraghs: newParagraghs });
            setPanelVersion((prev) => prev + 1);
            setLastScrollTop(scrollToTop);
        }
    };
    const handlersSubDeleteSentence = () => {
        const scrollToTop = refScrollbar.current?.getScrollTop() || 0;
        const curParagraghKey = curSentenceKey.split("-")[0];
        const curParagragh = script.paragraghs.find((v) => {
            return v.key == curParagraghKey;
        });
        if (curParagragh !== undefined) {
            if (curParagragh.children.length > 1) {
                const curSentenceIndex = curParagragh.children.findIndex((v) => {
                    return v.key == curSentenceKey;
                });
                const a = curParagragh.children.slice(0, curSentenceIndex);
                const b = curParagragh.children.slice(curSentenceIndex);
                b.shift();
                const newCurParagragh = [...a, ...b];
                curParagragh.children = newCurParagragh.map((v, k) => {
                    v.key = `${curParagragh.key}-${k}`;
                    return v;
                });
                const newParagraghs = script.paragraghs.map((v) => {
                    return v.key == curParagragh.key ? curParagragh : v;
                });
                setScript({ ...script, paragraghs: newParagraghs });
                setPanelVersion((prev) => prev + 1);
                setLastScrollTop(scrollToTop);
            }
        }
    };
    const handlersSubSetCurSentence = (key: string) => {
        setCurSentenceKey(key);
    };
    // Event Handlers
    // Template Functions
    const filterParagraghs = (paragraghs: any[]) => {
        return paragraghs.map((paragragh, index, subArr) => {
            const newChildren = paragragh.children.map((v: any, k: number, a: any) => {
                return { ...v, isLast: k === a.length - 1 ? 1 : 0 };
            });
            return { ...paragragh, children: newChildren, isLast: index === subArr.length - 1 ? 1 : 0 };
        });
    };
    const filterPlusOffset = (SRTTime: string): string => {
        return fnIsSRTTime(SRTTime) ? fnFloatToSRTTime(fnSRTTimeToFloat(SRTTime) + timeOffset) : "";
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
                return {
                    ...v,
                    texts: v.texts.map((vv: any) => {
                        return vv.replaceAll(/[^\S\n]+/g, " ").trim();
                    }),
                    startTime: fnIsSRTTime(v.startTime) ? fnFloatToSRTTime(fnSRTTimeToFloat(v.startTime) + timeOffset) : v.startTime,
                    endTime: fnIsSRTTime(v.endTime) ? fnFloatToSRTTime(fnSRTTimeToFloat(v.endTime) + timeOffset) : v.endTime,
                };
            });
            return { ...value, children: newChildren };
        });
        return { ...script, paragraghs: newParagraghs };
    };
    const fnGetSRT = (): string => {
        const subArr: string[] = [];
        script.paragraghs.forEach((paragragh, key, origin) => {
            const childrenArr = paragragh.children.map((sentence, k) => {
                let text = "";
                const textTrans = sentence.texts[0].split("\n");
                if (paragragh.roles.length === 0) {
                    text = `${textTrans[1]}\n${textTrans[0]}`;
                } else if (paragragh.roles.length === 1) {
                    const roleTrans = paragragh.roles[0].split("-");
                    text = `${roleTrans[1]}: ${textTrans[1]}\n${roleTrans[0]}: ${textTrans[0]}`;
                } else {
                    text = sentence.texts
                        .map((partOfSentence, n, whole) => {
                            let text = "";
                            if (whole.length === paragragh.roles.length) {
                                const roleTrans = paragragh.roles[n].split("-");
                                const textTrans = partOfSentence.split("\n");
                                text = `${roleTrans[1]}: ${textTrans[1]}\n${roleTrans[0]}: ${textTrans[0]}`;
                            } else {
                                text = `${text[1]}\n${text[0]}`;
                            }
                            return text;
                        })
                        .join("\n");
                }
                return key === 0 ? `${k + 1}\n${sentence.startTime} --> ${sentence.endTime}\n${text}\n` : `${k + 1 + origin[key - 1].children.length}\n${sentence.startTime} --> ${sentence.endTime}\n${text}\n`;
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
        window.addEventListener("beforeunload", (event) => {
            // 自定义提示信息 (大多数现代浏览器会忽略自定义消息，显示默认提示)
            const message = "你有未保存的更改，确定要离开吗？";
            event.preventDefault(); // 阻止默认行为 (重要：在某些浏览器中仍然需要)
            event.returnValue = message; // 设置提示信息
            return message; // 某些浏览器可能使用此返回值
        });
        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", handlersKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        refScrollbar.current?.scrollTop(lastScrollTop);
    }, [panelVersion]);
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", padding: "0 0 178px", boxSizing: "border-box", margin: "0", backgroundColor: "#000" }}>
                <aside id="asider" style={{ flex: "0 0 800px", height: "100%", backgroundColor: "#202024" }}>
                    <Scrollbars key={panelVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar}>
                        <div style={{ width: "100%", display: "flex", marginBottom: "14px" }}>
                            <Input defaultValue={script.name} onBlur={(e) => handlersSubUpdateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
                            <Input defaultValue={script.roles.join("/")} onBlur={(e) => handlersSubUpdateRoles(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Role1-角色1/Role2-角色2" />
                            <Input defaultValue={script.scenes.join("/")} onBlur={(e) => handlersSubUpdateScenes(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Scene1-场景1/Scene2-场景2" />
                        </div>
                        <Tree
                            style={{ height: "100%", borderRadius: "0" }}
                            showLine
                            defaultExpandAll
                            treeData={filterParagraghs(script.paragraghs)}
                            titleRender={(item: any) => {
                                const title = item.title as React.ReactNode;
                                return title ? (
                                    <div style={{ width: "100%", display: "flex" }}>
                                        {title}
                                        <Mentions autoSize onChange={(v) => handlersSubUpdateRole(v, item.key)} defaultValue={filterItemRoles(item.roles)} options={script.roles.map((v) => ({ label: v, value: v }))} style={{ fontSize: "12px", lineHeight: "22px", marginLeft: "9px", borderRadius: 0 }} placeholder="@Role1-角色1 @Role2-角色2" />
                                        <Select size="small" onChange={(v) => handlersSubUpdateScene(v, item.key)} defaultValue={item.scene} options={script.scenes.map((v) => ({ label: v, value: v }))} style={{ width: "426px", marginLeft: "4px", borderRadius: 0 }} />
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
                                        {item.isLast ? (
                                            <div style={{ width: "100%", display: "flex", marginTop: "4px" }}>
                                                <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertSentence} size="small" style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                                    Sentence
                                                </Button>
                                                <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteSentence} size="small" style={{ flex: 1, marginLeft: "4px", borderRadius: "0", backgroundColor: "#ccc" }}>
                                                    Sentence
                                                </Button>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                );
                            }}
                        />
                        <div style={{ width: "100%", margin: "10px 0 14px", height: "32px", display: "flex", justifyContent: "space-between" }}>
                            <Upload beforeUpload={handlersSubImportScript} showUploadList={false}>
                                <Button style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>Import</Button>
                            </Upload>
                            <Button onClick={handlersSubExportJSON} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Export
                            </Button>
                            <Button onClick={handlersSubExportSRT} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Export SRT
                            </Button>
                            <InputNumber min={0.0} max={50.0} step={0.1} value={timeOffset} onChange={(v) => handlersSubUpdateTimeOffset(v)} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                            <Button icon={<ScissorOutlined />} onClick={handlersSubCutParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Cut
                            </Button>
                            <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Insert
                            </Button>
                            <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Delete
                            </Button>
                        </div>
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
                </aside>
                <main style={{ flex: 1, height: "100%", display: "flex", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlersVideoTagOnPaused} onEnded={handlersVideoTagOnEnded} onTimeUpdate={handlersVideoTagOnTimeUpdate} onCanPlayThrough={handlersVideoCanPlayThrough} ref={refVideo}>
                        <source src={videoSRC} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </main>
                <footer style={{ width: "100%", height: "178px", position: "absolute", bottom: "0", left: "0", backgroundColor: "#2c2c31" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Upload beforeUpload={handlersVideoUploadVideo} showUploadList={false}>
                            <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                Video
                            </Button>
                        </Upload>
                        <Button icon={<FastBackwardOutlined />} onClick={handlersVideoPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Button icon={playButton} onClick={handlersVideoPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Button icon={<FastForwardOutlined />} onClick={handlersVideoPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Input value={current} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Checkbox onChange={handlersVideoMute} checked={videoMuted} style={{ flex: 1, borderRadius: "0", justifyContent: "center", lineHeight: "30px", backgroundColor: "#ccc" }}>
                            Mute
                        </Checkbox>
                        <input type="range" value={waveScale} onInput={handlersVideoSlide} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    </div>
                    <div id="waver" style={{ height: "146px" }}></div>
                </footer>
            </Layout>
        </>
    );
};
export default Script;
