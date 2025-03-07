import React, { useState, useRef, useEffect, Children } from "react";
import { Layout, Input, Space, Button, Upload, Checkbox, Col, Row, Tree, TreeProps, Select } from "antd";
import "./Script.scss";
import WaveSurfer from "wavesurfer.js";
import { Scrollbars } from "react-custom-scrollbars-2";
import { MinusCircleOutlined, PlusCircleOutlined, DownloadOutlined, UploadOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
interface Script {
    name: string;
    roles: string[];
    words: string[];
    grammers: string[];
    subtitles: {
        key: string;
        title: string;
        children: Subtitle[];
    }[];
}
interface Subtitle {
    key: string;
    startTime: string;
    endTime: string;
    text: string;
    role: number | null;
}
const { TextArea } = Input;
const { Content } = Layout;
const Script = () => {
    const [script, setScript] = useState<Script>({
        name: "",
        roles: [],
        words: [],
        grammers: [],
        subtitles: [
            {
                key: "0",
                title: "P0",
                children: [
                    {
                        key: "0-0",
                        startTime: "",
                        endTime: "",
                        text: "",
                        role: null,
                    },
                ],
            },
        ],
    });
    const [curSentenceKey, setCurSentenceKey] = useState("0-0");
    const [panelVersion, setPanelVersion] = useState(0); // 用于强制刷新
    const [parsedWords, setParsedWords] = useState("");
    const [current, setCurrent] = useState("00:00:00,000");
    const [waveScale, setWaveScale] = useState(0);
    const [videoSRC, setVideoSRC] = useState("");
    const [audioSRC, setAudioSRC] = useState("");
    const [audioMuted, setAudioMuted] = useState(true);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const importScript = (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            if (e.target?.result) {
                const content = e.target.result as string;
                setScript(JSON.parse(content));
                setPanelVersion((prev) => prev + 1);
            }
        };
        return false;
    };
    const exportScript = () => {
        const blob = new Blob([JSON.stringify(script, null, 4)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = `${script.name}.json`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(a.href);
        window.document.body.removeChild(a);
    };
    const beforeUploadVideo = (file: any) => {
        if (/^(.+?)\.mp4$/g.test(file.name)) {
            const videoURL = URL.createObjectURL(file);
            setVideoSRC(videoURL);
            refVideo.current?.load();
        } else {
            alert("Please upload mp4 format video.");
        }
    };
    const beforeUploadAudio = (file: any) => {
        if (/^(.+?)\.mp3$/g.test(file.name)) {
            const audioURL = URL.createObjectURL(file);
            setAudioSRC(audioURL);
            const waver = WaveSurfer.create({
                container: "#waver",
                waveColor: "rgb(200, 0, 200)",
                progressColor: "rgb(100, 0, 100)",
                url: audioURL,
                interact: true, // 禁用与波形的交互，点击时不会跳转
                height: 129,
                cursorColor: "rgb(87, 87, 89)",
                autoScroll: true,
            });
            waver.on("click", async () => {
                const currentTime = waver.getCurrentTime();
                const SRTTime = fnFloatToSRTTime(currentTime);
                waver.seekTo(currentTime / waver.getDuration());
                await navigator.clipboard.writeText(SRTTime);
                if (refVideo.current) {
                    refVideo.current.currentTime = currentTime;
                    setCurrent(SRTTime);
                }
            });
            waver.setMuted(true);
            waver.on("loading", (percent) => {
                console.log("Loading", percent + "%");
            });
            waver.on("ready", (duration) => {
                console.log("Ready", duration + "s");
            });
            waver.once("decode", () => {
                const slider = document.querySelector('input[type="range"]');
                if (slider) {
                    slider.addEventListener("input", (e: any) => {
                        console.log("slider input e.target", e.target);
                        const minPxPerSec = e.target?.valueAsNumber;
                        waver.zoom(minPxPerSec);
                    });
                }
            });
            setWavesurfer(waver);
        } else {
            alert("Please upload mp3 format audio.");
        }
    };
    const updateName = (value: string) => {
        if (value) {
            setScript({ ...script, name: value });
            setPanelVersion((prev) => prev + 1);
        }
    };
    const updateRoleList = (value: string) => {
        if (value) {
            setScript({ ...script, roles: value.split("/") });
            setPanelVersion((prev) => prev + 1);
        }
    };
    const updateWords = (value: string) => {
        if (value) {
            setScript({ ...script, words: value.split("\n") });
        }
    };
    const updateGrammers = (value: string) => {
        if (value) {
            setScript({ ...script, grammers: value.split("\n---\n") });
        }
    };
    const updateStartTime = (event: any, key: string) => {
        if (event.target.value) {
            const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
            const match = event.target.value.match(regex);
            if (!match) {
                throw new Error(`Invalid time format: ${event.target.value}`);
            }
            const keyArr = key.split("-");
            const curParagraghKey = keyArr[0];
            const curParagragh = script.subtitles.find((v) => {
                return v.key == curParagraghKey;
            });
            const curSentenceKey = keyArr[1];
            if (curParagragh !== undefined) {
                const lastSentence = curParagragh.children.find((v) => {
                    return v.key == `${curParagraghKey}-${parseInt(curSentenceKey) - 1}`;
                });
                if (lastSentence !== undefined) {
                    if (fnSRTTimeToFloat(event.target.value) < fnSRTTimeToFloat(lastSentence.endTime)) {
                        throw new Error(`Subtitle time error.`);
                    }
                }
                const curSentence = curParagragh.children.find((v) => {
                    return v.key == key;
                });
                if (curSentence !== undefined) {
                    curParagragh.children = curParagragh.children.map((v) => {
                        return v.key == curSentence.key ? { ...curSentence, startTime: event.target.value } : v;
                    });
                    const newSubtitles = script.subtitles.map((v) => {
                        return v.key == curParagragh.key ? curParagragh : v;
                    });
                    setScript({ ...script, subtitles: newSubtitles });
                }
            }
        }
    };
    const updateEndTime = (event: any, key: string) => {
        if (event.target.value) {
            const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
            const match = event.target.value.match(regex);
            if (!match) {
                throw new Error(`Invalid time format: ${event.target.value}`);
            }
            const keyArr = key.split("-");
            const curParagraghKey = keyArr[0];
            const curParagragh = script.subtitles.find((v) => {
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
                    const newSubtitles = script.subtitles.map((v) => {
                        return v.key == curParagragh.key ? curParagragh : v;
                    });
                    setScript({ ...script, subtitles: newSubtitles });
                }
            }
        }
    };
    const updateText = (event: any, key: string) => {
        if (event.target.value) {
            const keyArr = key.split("-");
            const curParagraghKey = keyArr[0];
            const curParagragh = script.subtitles.find((v) => {
                return v.key == curParagraghKey;
            });
            if (curParagragh !== undefined) {
                const curSentence = curParagragh.children.find((v) => {
                    return v.key == key;
                });
                if (curSentence !== undefined) {
                    curParagragh.children = curParagragh.children.map((v) => {
                        return v.key == curSentence.key ? { ...curSentence, text: event.target.value } : v;
                    });
                    const newSubtitles = script.subtitles.map((v) => {
                        return v.key == curParagragh.key ? curParagragh : v;
                    });
                    setScript({ ...script, subtitles: newSubtitles });
                }
            }
        }
    };
    const updateRole = (value: number, key: string) => {
        console.log("value", value);
        console.log("key", key);

        const keyArr = key.split("-");
        const curParagraghKey = keyArr[0];
        const curParagragh = script.subtitles.find((v) => {
            return v.key == curParagraghKey;
        });
        if (curParagragh !== undefined) {
            const curSentence = curParagragh.children.find((v) => {
                return v.key == key;
            });
            if (curSentence !== undefined) {
                curParagragh.children = curParagragh.children.map((v) => {
                    return v.key == curSentence.key ? { ...curSentence, role: value } : v;
                });
                const newSubtitles = script.subtitles.map((v) => {
                    return v.key == curParagragh.key ? curParagragh : v;
                });
                setScript({ ...script, subtitles: newSubtitles });
            }
        }
    };
    const handleTimeUpdate = (e: any) => {
        console.log("video current time:", e.target.currentTime);
        console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlePlay = () => {
        if (refVideo.current && videoSRC && audioSRC) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current.play();
                if (wavesurfer) {
                    wavesurfer.play();
                }
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
                if (wavesurfer) {
                    wavesurfer.pause();
                }
            }
        } else {
            alert("Please upload video and audio.");
        }
    };
    const handleBackward = async () => {
        if (refVideo.current && videoSRC && audioSRC) {
            const pos = Math.max(0, refVideo.current.currentTime - 0.2);
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(SRTTime);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handleForward = async () => {
        if (refVideo.current && videoSRC && audioSRC) {
            const pos = refVideo.current.currentTime + 0.2;
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(SRTTime);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handleEnded = () => {
        setCurrent("00:00:00,000");
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlePause = async (e: any) => {
        const SRTTime = fnFloatToSRTTime(e.target.currentTime);
        await navigator.clipboard.writeText(SRTTime);
        setCurrent(SRTTime);
    };
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
    function fnSRTTimeToFloat(srtTime: string) {
        // Split the SRT time into hours, minutes, seconds, and milliseconds
        const timeParts = srtTime.split(/[:,]/); // Split by ":" and ","

        // Parse the parts
        const hours = parseInt(timeParts[0], 10); // HH
        const minutes = parseInt(timeParts[1], 10); // MM
        const seconds = parseInt(timeParts[2], 10); // SS
        const milliseconds = parseInt(timeParts[3], 10); // SSS

        // Convert to seconds
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const eventKeyDown = (event: KeyboardEvent) => {
        console.log("event.key", event.key);
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
    const onInputSlider = (e: any) => {
        setWaveScale(e.target.value);
    };
    const onMute = (e: any) => {
        console.log("script", script);
        console.log("curSentenceKey", curSentenceKey);
        console.log("parsedWords", parsedWords);
        setAudioMuted(e.target.checked);
        wavesurfer?.setMuted(e.target.checked);
    };
    useEffect(() => {
        // 添加键盘事件监听器
        window.addEventListener("keydown", eventKeyDown);
        window.addEventListener("beforeunload", (event) => {
            // 自定义提示信息 (大多数现代浏览器会忽略自定义消息，显示默认提示)
            const message = "你有未保存的更改，确定要离开吗？";
            event.preventDefault(); // 阻止默认行为 (重要：在某些浏览器中仍然需要)
            event.returnValue = message; // 设置提示信息
            return message; // 某些浏览器可能使用此返回值
        });
        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", eventKeyDown);
        };
    }, []);
    const sentenceCreate = () => {
        console.log("curSentenceKey---", curSentenceKey);
        const curParagraghKey = curSentenceKey.split("-")[0];
        const curParagragh = script.subtitles.find((v) => {
            return v.key == curParagraghKey;
        });
        if (curParagragh !== undefined) {
            curParagragh.children.push({
                key: `${curParagragh.key}-${curParagragh.children.length}`,
                startTime: "",
                endTime: "",
                text: "",
                role: "",
            });
            const newSubtitles = script.subtitles.map((v) => {
                return v.key == curParagragh.key ? curParagragh : v;
            });
            setScript({ ...script, subtitles: newSubtitles });
            setPanelVersion((prev) => prev + 1);
        }
    };
    const sentenceDelete = () => {
        console.log("curSentenceKey2", curSentenceKey);
        const curParagraghKey = curSentenceKey.split("-")[0];
        const curParagragh = script.subtitles.find((v) => {
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
                const newSubtitles = script.subtitles.map((v) => {
                    return v.key == curParagragh.key ? curParagragh : v;
                });
                setScript({ ...script, subtitles: newSubtitles });
                setPanelVersion((prev) => prev + 1);
            }
        }
    };
    const paragraphCreate = () => {
        const subtitles = JSON.parse(JSON.stringify(script.subtitles));
        subtitles.push({
            key: `${subtitles.length}`,
            title: `P${subtitles.length}`,
            children: [
                {
                    key: `${subtitles.length}-0`,
                    startTime: "",
                    endTime: "",
                    text: "",
                    role: "",
                },
            ],
        });
        setScript({ ...script, subtitles: subtitles });
        setPanelVersion((prev) => prev + 1);
    };
    const paragraphDelete = () => {
        if (curSentenceKey !== undefined) {
            const curParagraghKey = curSentenceKey.split("-")[0];
            const curParagragh = script.subtitles.find((v) => {
                return v.key == curParagraghKey;
            });
            if (curParagragh !== undefined) {
                if (script.subtitles.length > 1) {
                    const curSentenceIndex = script.subtitles.findIndex((v) => {
                        return v.key == curParagragh.key;
                    });
                    const a = script.subtitles.slice(0, curSentenceIndex);
                    const b = script.subtitles.slice(curSentenceIndex);
                    b.shift();
                    const newSubtitles = [...a, ...b].map((v, k) => {
                        v.key = `${k}`;
                        v.title = `P${k}`;
                        v.children = v.children.map((vv, kk) => {
                            vv.key = `${k}-${kk}`;
                            return vv;
                        });
                        return v;
                    });
                    setScript({ ...script, subtitles: newSubtitles });
                    setPanelVersion((prev) => prev + 1);
                }
            }
        }
    };
    const subtitlesComputed = (subtitles: any[]) => {
        return subtitles.map((paragragh, index, subArr) => {
            const newChildren = paragragh.children.map((v: any, k: number, a: any) => {
                return { ...v, isLast: k === a.length - 1 ? 1 : 0 };
            });
            return { ...paragragh, children: newChildren, isLast: index === subArr.length - 1 ? 1 : 0 };
        });
    };
    const setCurSentence = (key: string) => {
        console.log("key", key);
        setCurSentenceKey(key);
    };
    const parseWords = (text: string) => {
        console.log("text", text);
        if (text) {
            const res = [];
            const types = [/(n)\.\s*([^\n]+)/, /\b(v|vi|vt)\.\s*([^\n]+)/, /(adj)\.\s*([^\n]+)/, /(adv)\.\s*([^\n]+)/, /(conj)\.\s*([^\n]+)/, /(pron)\.\s*([^\n]+)/, /(prep)\.\s*([^\n]+)/];
            for (let i = 0; i < types.length; i++) {
                const matchCN = text.match(types[i]);
                if (matchCN && matchCN[2]) {
                    let str = "";
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
                    str += i === 1 ? ` v.${matchCN[2]}` : ` ${matchCN[1]}.${matchCN[2]}`;
                    const matchPronounce = text.match(/\/(.*?)\//g);
                    if (matchPronounce && matchPronounce[1]) {
                        str += ` ${matchPronounce[1]}`;
                    }
                    res.push(str);
                }
            }
            console.log("---");
            setParsedWords(res.join("\n"));
        }
    };
    return (
        <>
            <Layout style={{ width: "100%", height: "calc(100% - 188px)", backgroundColor: "#000" }}>
                <Content style={{ paddingLeft: "800px", display: "flex", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlePause} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} ref={refVideo}>
                        <source src={videoSRC} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </Content>
            </Layout>
            <aside id="asider" style={{ width: "800px", position: "fixed", left: "0", top: "0", height: "calc(100% - 188px)", backgroundColor: "#202024" }}>
                <Scrollbars key={panelVersion} style={{ width: "800px", height: "100%" }}>
                    <div style={{ width: "100%", display: "flex" }}>
                        <Input defaultValue={script.name} onBlur={(e) => updateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
                        <Input defaultValue={script.roles.join("/")} onBlur={(e) => updateRoleList(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Role1/Role2/Role3" />
                    </div>
                    <Tree
                        style={{ height: "100%", borderRadius: "0" }}
                        showLine
                        defaultExpandAll
                        treeData={subtitlesComputed(script.subtitles)}
                        titleRender={(item: any) => {
                            const title = item.title as React.ReactNode;
                            return title ? (
                                title
                            ) : item.isLast ? (
                                <div style={{ width: "100%" }}>
                                    <div style={{ width: "100%", display: "flex" }}>
                                        <Space size="small" style={{ flex: "0 0 94px", rowGap: "4px" }} direction="vertical">
                                            <Input size="small" defaultValue={item.startTime} onBlur={(e) => updateStartTime(e, item.key)} />
                                            <Input size="small" defaultValue={item.endTime} onBlur={(e) => updateEndTime(e, item.key)} />
                                            <Select size="small" style={{ width: "100%" }} defaultValue={item.role} onSelect={(v) => updateRole(v, item.key)} options={script.roles.map((item, key) => ({ label: item, value: key }))} />
                                        </Space>
                                        <TextArea autoSize defaultValue={item.text} onFocus={(e) => setCurSentence(item.key)} onBlur={(e) => updateText(e, item.key)} style={{ flex: 1, minHeight: "80px", margin: "0 4px", borderRadius: "4px", color: "#000" }} />
                                    </div>
                                    <div style={{ width: "100%", display: "flex", marginTop: "4px" }}>
                                        <Button icon={<PlusCircleOutlined />} onClick={sentenceCreate} size="small" style={{ flex: 1 }}>
                                            Sentence
                                        </Button>
                                        <Button icon={<MinusCircleOutlined />} onClick={sentenceDelete} size="small" style={{ flex: 1, margin: "0 4px" }}>
                                            Sentence
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ width: "100%", display: "flex" }}>
                                    <Space size="small" style={{ flex: "0 0 94px", rowGap: "4px" }} direction="vertical">
                                        <Input size="small" defaultValue={item.startTime} onBlur={(e) => updateStartTime(e, item.key)} />
                                        <Input size="small" defaultValue={item.endTime} onBlur={(e) => updateEndTime(e, item.key)} />
                                        <Select size="small" style={{ width: "100%" }} defaultValue={item.role} onSelect={(v) => updateRole(v, item.key)} options={script.roles.map((item, key) => ({ label: item, value: key }))} />
                                    </Space>
                                    <TextArea autoSize defaultValue={item.text} onFocus={(e) => setCurSentence(item.key)} onBlur={(e) => updateText(e, item.key)} style={{ flex: 1, minHeight: "80px", margin: "0 4px", borderRadius: "4px", color: "#000" }} />
                                </div>
                            );
                        }}
                    />
                    <div style={{ width: "100%", padding: "0 4px 4px 4px", boxSizing: "border-box", display: "flex", justifyContent: "space-between" }}>
                        <Space size="small" style={{ flex: "1", rowGap: "0" }} direction="vertical">
                            <Upload beforeUpload={importScript} showUploadList={false} style={{ borderRadius: "0", width: "100%" }}>
                                <Button size="small" style={{ borderRadius: "0", width: "100%" }}>
                                    Import
                                </Button>
                            </Upload>
                            <Button onClick={exportScript} size="small" style={{ borderRadius: "0", width: "100%" }}>
                                Export
                            </Button>
                        </Space>
                        <Space size="small" style={{ flex: "1", rowGap: "0" }} direction="vertical">
                            <Button icon={<PlusCircleOutlined />} onClick={paragraphCreate} size="small" style={{ borderRadius: "0", width: "100%" }}>
                                Paragraph
                            </Button>
                            <Button icon={<MinusCircleOutlined />} onClick={paragraphDelete} size="small" style={{ borderRadius: "0", width: "100%" }}>
                                Paragraph
                            </Button>
                        </Space>
                    </div>
                    <div style={{ width: "100%", padding: "0 4px 4px 4px" }}>
                        <TextArea autoSize value={parsedWords} onChange={(e) => parseWords(e.target.value)} style={{ flex: 1, minHeight: "100px", borderRadius: "0", color: "#000" }} placeholder="Paste Words" />
                        <TextArea
                            autoSize
                            defaultValue={script.words.join("\n")}
                            onBlur={(e) => updateWords(e.target.value)}
                            style={{ flex: 1, minHeight: "200px", borderRadius: "0", color: "#000" }}
                            placeholder="Unfamiliar Words. &#10;Each word takes one line. &#10;名词：content/contents n.内容;目录 /ˈkɑːntent/ &#10;动词：content/contents/contented/contented/contenting v.满足 /kənˈtent/ &#10;形容词：content adj.满意的 /kənˈtent/"
                        />
                        <TextArea
                            autoSize
                            defaultValue={script.grammers.join("\n---\n")}
                            onBlur={(e) => updateGrammers(e.target.value)}
                            style={{ flex: 1, minHeight: "200px", marginTop: "4px", borderRadius: "0", color: "#000" }}
                            placeholder="Unfamiliar Grammars. &#10;To separate piece by ---"
                        />
                    </div>
                </Scrollbars>
            </aside>
            <footer style={{ width: "100%", position: "fixed", bottom: "0", left: "0px", zIndex: "999", backgroundColor: "#2c2c31" }}>
                <Space size="small" style={{ width: "100%", padding: "8px", borderBottom: "1px solid #575759" }}>
                    <Upload beforeUpload={beforeUploadVideo} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="small">
                            Video
                        </Button>
                    </Upload>
                    <Upload beforeUpload={beforeUploadAudio} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="small">
                            Audio
                        </Button>
                    </Upload>
                    <Button icon={<FastBackwardOutlined />} onClick={handleBackward} size="small"></Button>
                    <Button icon={playButton} onClick={handlePlay} size="small"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handleForward} size="small"></Button>
                    <Input value={current} size="small" />
                    <Checkbox onChange={onMute} checked={audioMuted}>
                        Mute
                    </Checkbox>
                    <input type="range" value={waveScale} onInput={onInputSlider} />
                </Space>
                <div id="waver" style={{ height: "146px" }}></div>
            </footer>
        </>
    );
};

export default Script;
