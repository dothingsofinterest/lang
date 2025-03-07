import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, Switch } from "antd";
import "./Follow.scss";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, RedoOutlined, UploadOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { ttsGen } from "../../api/request";
import printJS from "print-js";
interface Script {
    name: string;
    roles: string[];
    words: string[];
    grammers: string[];
    subtitles: {
        key: string;
        title: string;
        roles: string[];
        children: Subtitle[];
    }[];
}
interface Subtitle {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}
const Follow = () => {
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [subtitlesCurIndex, setSubtitlesCurIndex] = useState(0);
    const [wordsCurIndex, setWordsCurIndex] = useState(0);
    const [script, setScript] = useState<Script>();
    const [videoSRC, setVideoSRC] = useState("");
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState<boolean>(true); // true-sentence false-word
    const [dictationWordsMode, setDictationWordsMode] = useState<boolean>(true); // true-EN false-CN
    const [stopMode, setStopMode] = useState(true);
    const articleRef = useRef<HTMLDivElement>(null);
    const [words, setWords] = useState<string[]>([]);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    // Event Handlers
    const handlersPanelImportScript = (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            try {
                if (e.target?.result) {
                    const scriptParsed: Script = JSON.parse(e.target.result as string);
                    const subs: Subtitle[] = [];
                    scriptParsed.subtitles.forEach((v: any) => {
                        subs.push(...v.children);
                    });
                    setScript(scriptParsed);
                    setSubtitles(subs);
                    setWords(scriptParsed.words);
                }
            } catch (e: any) {
                alert(e.message);
            }
        };
        return false;
    };
    const handlersPanelUploadVideo = (file: any) => {
        if (/^(.+?)\.mp4$/g.test(file.name)) {
            const videoURL = URL.createObjectURL(file);
            setVideoSRC(videoURL);
            refVideo.current?.load();
            return false; // Stop upload action.
        } else {
            alert("Please upload mp4 format video.");
        }
    };
    const handlersPanelPlay = () => {
        if (refVideo.current && videoSRC) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current.play();
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayAgain = () => {
        if (refVideo.current && videoSRC) {
            const cur = subtitles[subtitlesCurIndex];
            if (cur !== undefined) {
                refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayBackward = async () => {
        if (refVideo.current && videoSRC) {
            const prevIndex = subtitlesCurIndex <= 0 ? 0 : subtitlesCurIndex - 1;
            const prev = subtitles[prevIndex];
            if (prev !== undefined) {
                setSubtitlesCurIndex(prevIndex);
                refVideo.current.currentTime = fnSRTTimeToFloat(prev.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayForward = async () => {
        if (refVideo.current && videoSRC) {
            const nextIndex = subtitlesCurIndex === subtitles.length - 1 ? subtitlesCurIndex : subtitlesCurIndex + 1;
            const next = subtitles[nextIndex];
            if (next !== undefined) {
                setSubtitlesCurIndex(nextIndex);
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelSwithStopMode = (v: boolean) => {
        setStopMode(v);
    };
    const handlersPanelPrint = () => {
        if (articleRef && script) {
            const css = `
            * { outline: none; }
            html,body,p,h5,ul,ol,li { margin: 0; padding: 0; }
            body { margin: 0; padding: 0; font-size: 14px; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
            ol, ul, li { list-style: none; }
            article { width: 1000px; }
            article h5 { text-align: center; font-size: 16px; font-weight: 900; line-height: 50px; color: #000; margin: 10px 0; }
            article .p { border: 1px dotted #000; margin: 12px 10px; padding: 2px 6px; color: #000; font-size: 14px; line-height: 28px; }
            article .p .point { padding: 0 4px; }
            article .p .role { font-weight: 900; padding-right: 2px; }
            article .p ul { font-style: italic; font-size: 12px; }
            article footer { padding: 0 10px; color: #000;}
            article footer .words,
            article footer .grammers { line-height: 28px; }
            article footer .words .item-index,
            article footer .grammers .item-index { font-weight: 900; }
            article footer .divider { line-height: 36px; display: flex; align-items: center; text-align: center; justify-content: center; font-weight: 900; font-size: 14px; color: #000;}
            article footer .divider:before, 
            article footer .divider:after { position: relative; width: 50%; border-block-start: 1px dotted #000; border-block-end: 0; transform: translateY(50%); content: ""; }
        `;
            printJS({ printable: `<article>${articleRef.current?.innerHTML}</article>` || "", type: "raw-html", style: css });
        } else {
            alert("Please import a script.");
        }
    };
    const handlersVideoEnded = () => {
        console.log("video ended");
        setSubtitlesCurIndex(0);
        fnSentenceHighlight(0);
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlersVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTimeUpdate = (e: any) => {
        if (inputMode) {
            console.log("video current time:", `${fnFloatToSRTTime(e.target.currentTime)} / ${e.target.currentTime}`);
            console.log("subtitles current index:", subtitlesCurIndex);
            const cur = subtitles[subtitlesCurIndex];
            if (cur !== undefined) {
                fnSentenceHighlight(subtitlesCurIndex);
                const endTime = fnSRTTimeToFloat(cur.endTime);
                if (e.target.currentTime >= endTime) {
                    if (stopMode) {
                        if (subtitlesCurIndex <= subtitles.length - 1) {
                            refVideo.current?.pause();
                            setPlayButton(<PlayCircleOutlined />);
                        }
                    } else {
                        setSubtitlesCurIndex(subtitlesCurIndex === subtitles.length - 1 ? subtitlesCurIndex : subtitlesCurIndex + 1);
                    }
                }
            }
        }
    };
    const handlersPanel2SwitchInputMode = async (v: boolean) => {
        setInputMode(v);
        if (v) {
            if (refAudio.current) {
                refAudio.current.pause();
                setWordsCurIndex(0);
            }
        } else {
            fnPlayAudio(0);
            if (refVideo.current) {
                refVideo.current.pause();
                refVideo.current.currentTime = 0;
                setSubtitlesCurIndex(0);
                setPlayButton(<PlayCircleOutlined />);
                fnSentenceHighlight(0);
            }
        }
    };
    const handlersPanel2SwitchDictationWordsMode = (v: boolean) => {
        setDictationWordsMode(v);
    };
    const handlersKeyboardOnDown = (event: KeyboardEvent) => {
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
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (inputMode) {
            console.log("subtitles[subtitlesCurIndex].text", subtitles[subtitlesCurIndex]);
            const answer = subtitles[subtitlesCurIndex].texts.map((v) => v.split("\n")[0]).join("\n");
            console.log("answer", `|${answer}|`);
            console.log(value);
            console.log(answer === value);
            if (answer === value) {
                setInputValue("");
                setSubtitlesCurIndex(subtitlesCurIndex + 1);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            const valueTrans = value.includes(",") ? value.replaceAll(",", "/") : value;
            if (words[wordsCurIndex].split(", ")[1] === valueTrans) {
                setInputValue("");
                setWordsCurIndex(wordsCurIndex + 1 === words.length ? 0 : wordsCurIndex + 1);
                fnPlayAudio(wordsCurIndex + 1 === words.length ? 0 : wordsCurIndex + 1);
            }
        }
    };
    // Event Handlers
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
    const fnSRTTimeToFloat = (SRTTime: string): number => {
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
    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const fnSentenceHighlight = (index: number) => {
        if (articleRef.current) {
            const spans = articleRef.current.querySelectorAll(".point");
            spans.forEach((span: any, k) => {
                span.className = index === k ? "point active" : "point";
            });
        }
    };
    const fnPlayAudio = async (index: number) => {
        if (words && words.length) {
            const wordsArr = words[index].split(", ");
            const content = dictationWordsMode ? wordsArr[1].replaceAll("/", ", ") : wordsArr[0].split(".")[1];
            const type = dictationWordsMode ? 1 : 2;
            try {
                const res = await ttsGen({ content: content, type: type });
                if (res.code) {
                    if (refAudio.current) {
                        const audio = refAudio.current;
                        audio.src = "data:audio/wav;base64," + res.data;
                        audio.load();
                        audio.play();
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.log(error);
                }
            }
        }
    };
    // Functions
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
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ flex: "0 0 600px", position: "relative", height: "100%", padding: "32px 0 132px", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", right: "0", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Upload beforeUpload={handlersPanelUploadVideo} showUploadList={false}>
                                <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                    Video
                                </Button>
                            </Upload>
                            <Upload beforeUpload={handlersPanelImportScript} showUploadList={false}>
                                <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                    Script
                                </Button>
                            </Upload>
                            <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={playButton} onClick={handlersPanelPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                                <Switch checked={stopMode} onChange={handlersPanelSwithStopMode} size="small" checkedChildren="停顿" unCheckedChildren="不停" />
                            </div>
                            <Button icon={<PrinterOutlined />} onClick={handlersPanelPrint} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <Scrollbars>
                        {script ? (
                            <article id="article" ref={articleRef}>
                                <h5>{script?.name}</h5>
                                {script?.subtitles.map((paragragh) => {
                                    return paragragh.roles.length <= 1 ? (
                                        <div className="p" key={paragragh.key}>
                                            <p>
                                                {paragragh.roles.length === 1 ? <i className="role">{paragragh.roles[0].split("-")[0]}: </i> : <></>}
                                                {paragragh.children.map((v) => {
                                                    return (
                                                        <React.Fragment key={v.key}>
                                                            <span className="point">{v.texts[0].split("\n")[0]}</span>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p" key={paragragh.key}>
                                            {paragragh.children.map((sentence) => {
                                                return (
                                                    <ul className="point" key={sentence.key}>
                                                        {sentence.texts.map((partOfSentence, n) => {
                                                            return (
                                                                <li key={n}>
                                                                    <i className="role">{paragragh.roles[n].split("-")[0]}: </i>
                                                                    <span>{partOfSentence.split("\n")[0]}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                                <footer style={{ height: "100%" }}>
                                    <div className="divider">Words</div>
                                    <div className="words">
                                        {script?.words.map((value, key) => {
                                            return (
                                                <p key={key}>
                                                    <span className="item-index">[{key + 1}] </span>
                                                    {value}
                                                </p>
                                            );
                                        })}
                                    </div>
                                    <div className="divider">Grammers</div>
                                    <div className="grammers">
                                        {script?.grammers.map((value, key) => {
                                            return (
                                                <p key={key}>
                                                    <span className="item-index">[{key + 1}] </span>
                                                    {value}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </footer>
                            </article>
                        ) : (
                            ""
                        )}
                    </Scrollbars>
                    <section id="asider" style={{ width: "100%", height: "132px", position: "absolute", left: "0", bottom: "0" }}>
                        <section id="asider" style={{ width: "100%", height: "32px", backgroundColor: "#202024" }}>
                            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc", borderLeft: "1px solid #d9d9d9" }}>
                                    <Switch checked={inputMode} onChange={handlersPanel2SwitchInputMode} size="small" checkedChildren="文章" unCheckedChildren="单词" />
                                </div>
                                <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                                    <Switch checked={dictationWordsMode} onChange={handlersPanel2SwitchDictationWordsMode} size="small" checkedChildren="英" unCheckedChildren="中" />
                                </div>
                            </div>
                        </section>
                        <Input.TextArea
                            value={inputValue}
                            onChange={(e) => handlersTextInput(e.target.value)}
                            autoSize
                            style={{ minHeight: "100px", borderRadius: "0", color: "#000" }}
                            placeholder="Input sentences or words.&#10;EX: wear wears wore worn wearing"
                        />
                    </section>
                </aside>
                <main style={{ flex: 1, display: "flex", height: "100%", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                        <source src={videoSRC} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </main>
            </Layout>
            <div style={{ display: "none" }}>
                <audio ref={refAudio} loop></audio>
            </div>
        </>
    );
};

export default Follow;
