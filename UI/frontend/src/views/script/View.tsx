import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Switch } from "antd";
import { Script as DataScript, Paragragh as DataParagragh, Sentence as DataSentence, Scene as DataScene } from "../../types";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveSentence, updatePlayStop } from "../../stores/reducers/project";
import { fnFloatToSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import { ttsGen } from "../../api/request";
import "./View.scss";
import ScriptDOM from "./ScriptDOM";
const View = () => {
    console.log("----------Render|Script/View----------");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const localOrigin = useSelector((state: RootState) => state.video.localOrigin);
    const activeSentence = useSelector((state: RootState) => state.project.activeSentence);
    const playStop = useSelector((state: RootState) => state.project.playStop);
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [wordsCurIndex, setWordsCurIndex] = useState(0);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState<boolean>(true); // true-sentence false-word
    const [dictationWordsMode, setDictationWordsMode] = useState<boolean>(true); // true-EN false-CN
    const articleRef = useRef<HTMLDivElement>(null);
    const [words, setWords] = useState<string[]>([]);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    // Event Handlers
    const handlersLivesWatchSentences = () => {
        if (localOrigin && refVideo.current) {
            if (activeSentence !== 0) {
                const cur = sentences[activeSentence];
                console.log("cur", cur);
                if (cur !== undefined) {
                    refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                }
            }
        }
    };
    const handlersPanelPlay = () => {
        if (refVideo.current && localOrigin) {
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
        if (refVideo.current && localOrigin) {
            const cur = sentences[activeSentence];
            if (cur !== undefined) {
                refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayBackward = () => {
        if (refVideo.current && localOrigin) {
            const prevIndex = activeSentence <= 0 ? 0 : activeSentence - 1;
            const prev = sentences[prevIndex];
            if (prev !== undefined) {
                dispatch(updateActiveSentence(prevIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(prev.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayForward = () => {
        if (refVideo.current && localOrigin) {
            const nextIndex = activeSentence === sentences.length - 1 ? activeSentence : activeSentence + 1;
            const next = sentences[nextIndex];
            if (next !== undefined) {
                dispatch(updateActiveSentence(nextIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelSwithStopMode = (v: boolean) => {
        dispatch(updatePlayStop(v));
    };
    const handlersVideoEnded = () => {
        console.log("video ended");
        dispatch(updateActiveSentence(0));
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
            console.log("active sentence:", activeSentence);
            const cur = sentences[activeSentence];
            if (cur !== undefined) {
                fnSentenceHighlight(activeSentence);
                const endTime = fnSRTTimeToFloat(cur.endTime);
                if (e.target.currentTime >= endTime) {
                    if (playStop) {
                        if (activeSentence <= sentences.length - 1) {
                            refVideo.current?.pause();
                            setPlayButton(<PlayCircleOutlined />);
                        }
                    } else {
                        dispatch(updateActiveSentence(activeSentence === sentences.length - 1 ? activeSentence : activeSentence + 1));
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
                dispatch(updateActiveSentence(0));
                setPlayButton(<PlayCircleOutlined />);
                fnSentenceHighlight(0);
            }
        }
    };
    const handlersPanel2SwitchDictationWordsMode = (v: boolean) => {
        setDictationWordsMode(v);
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {
        console.log("event.key", event.key);
        console.log("event.code", event.code);
        if (event.code === "NumpadSubtract") {
            handlersPanelPlayBackward();
        }
        if (event.code === "NumpadAdd") {
            handlersPanelPlayForward();
        }
        if (event.code === "F8") {
            handlersPanelPlayAgain();
        }
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (sentences.length > 0) {
            if (inputMode) {
                const answer = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
                if (answer === value) {
                    setInputValue("");
                    dispatch(updateActiveSentence(activeSentence + 1));
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
        }
    };
    // Event Handlers
    // Functions
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
    // Lives Hook
    const livesHookParseScriptData = () => {
        if (script.name) {
            const sentences: DataSentence[] = [];
            script.paragraghs.forEach((v: DataParagragh) => {
                sentences.push(...v.children);
            });
            setSentences(sentences);
            setWords(script.words);
        } else {
            console.log("Script not set.");
        }
    };
    const livesHookPreLoadVideo = () => {
        if (localOrigin && refVideo.current) {
            refVideo.current.load();
        } else {
            console.log("Video not set.");
        }
    };
    // Lives Hook
    useEffect(() => {
        console.log("----------Mounted | Script/View----------");
        livesHookParseScriptData();
        livesHookPreLoadVideo();
        window.addEventListener("keydown", handlersEventKeyboardOnDown);
        return () => {
            console.log("----------Unmounted | Script/View----------");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("----------Watch sentences | Script/View----------");
        handlersLivesWatchSentences();
    }, [sentences]);
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ flex: "0 0 800px", position: "relative", height: "100%", padding: "32px 0 132px", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", right: "0", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={playButton} onClick={handlersPanelPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                                <Switch checked={playStop} onChange={handlersPanelSwithStopMode} size="small" checkedChildren="停顿" unCheckedChildren="不停" />
                            </div>
                        </div>
                    </section>
                    <Scrollbars>
                        <ScriptDOM dataArticle={dataArticle} activeSentence={activeSentence} />
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
                            placeholder="Input sentences or words.&#10;EX: wear,wears,wore,worn,wearing"
                        />
                    </section>
                </aside>
                <main style={{ flex: 1, display: "flex", height: "100%", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                        <source src={localOrigin} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </main>
            </Layout>
            <div style={{ display: "none" }}>
                <audio ref={refAudio} loop></audio>
            </div>
        </>
    );
};

export default View;
