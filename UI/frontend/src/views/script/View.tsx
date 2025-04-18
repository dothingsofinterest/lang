import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Switch } from "antd";
import { Script as DataScript, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveSentence, updatePlayStop } from "../../stores/reducers/project";
import { fnFloatToSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import { ttsGen } from "../../api/requestAuth";
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
    const [vocabsCurIndex, setVocabsCurIndex] = useState(0);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState<boolean>(true); // true-sentence false-word
    const [dictationVocabsMode, setDictationVocabsMode] = useState<boolean>(true); // true-EN false-CN
    const articleRef = useRef<HTMLDivElement>(null);
    const [vocabs, setVocabs] = useState<string[]>([]);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refClosure = useRef({
        refVideo: refVideo,
        sentences: sentences,
        activeSentence: activeSentence,
    });
    // Event Handlers
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
    const handlersEventPlayAgain = () => {
        const closure = refClosure.current;
        if (closure.refVideo.current && localOrigin) {
            const cur = closure.sentences[closure.activeSentence];
            if (cur !== undefined) {
                closure.refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                closure.refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
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
            // console.log("video current time:", `${fnFloatToSRTTime(e.target.currentTime)} / ${e.target.currentTime}`);
            // console.log("active sentence:", activeSentence);
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
                setVocabsCurIndex(0);
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
    const handlersPanel2SwitchDictationVocabsMode = (v: boolean) => {
        setDictationVocabsMode(v);
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {
        if (event.code === "NumpadSubtract") {
            handlersPanelPlayBackward();
        }
        if (event.code === "NumpadAdd") {
            handlersPanelPlayForward();
        }
        if (event.code === "F8") {
            handlersEventPlayAgain();
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
                if (vocabs[vocabsCurIndex].split(", ")[1] === valueTrans) {
                    setInputValue("");
                    setVocabsCurIndex(vocabsCurIndex + 1 === vocabs.length ? 0 : vocabsCurIndex + 1);
                    fnPlayAudio(vocabsCurIndex + 1 === vocabs.length ? 0 : vocabsCurIndex + 1);
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
        if (vocabs && vocabs.length) {
            const vocabsArr = vocabs[index].split(", ");
            const content = dictationVocabsMode ? vocabsArr[1].replaceAll("/", ", ") : vocabsArr[0].split(".")[1];
            const type = dictationVocabsMode ? 1 : 2;
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
    const livesHooksInit = () => {
        if (!script.name || !localOrigin || !refVideo.current) {
            console.log("Script or Video is required.");
        } else {
            const sentences: DataSentence[] = [];
            script.paragraphs.forEach((v: DataParagraph) => {
                sentences.push(...v.sentences);
            });
            refVideo.current.load();
            refVideo.current.currentTime = sentences[activeSentence] !== undefined ? fnSRTTimeToFloat(sentences[activeSentence].startTime) : 0;
            setSentences(sentences);
            setVocabs(script.vocabs);
        }
    };
    // Lives Hook
    useEffect(() => {
        console.log("----------Mounted | Script/View----------");
        livesHooksInit();
        window.addEventListener("keydown", handlersEventKeyboardOnDown);
        return () => {
            console.log("----------Unmounted | Script/View----------");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("----------Watch [refVideo,localOrigin,sentences,activeSentence] | Script/View----------");
        refClosure.current = {
            refVideo: refVideo,
            sentences: sentences,
            activeSentence: activeSentence,
        };
    }, [refVideo, sentences, activeSentence]);
    return (
        <>
            <Layout id="script-view" className="main-inner">
                <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 132px" }}>
                    <section style={{ width: "100%", height: "32px", position: "absolute", right: "0", top: "0", backgroundColor: "#202024" }}>
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
                    <section style={{ width: "100%", height: "132px", position: "absolute", left: "0", bottom: "0" }}>
                        <section id="asider" style={{ width: "100%", height: "32px", backgroundColor: "#202024" }}>
                            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc", borderLeft: "1px solid #d9d9d9" }}>
                                    <Switch checked={inputMode} onChange={handlersPanel2SwitchInputMode} size="small" checkedChildren="文章" unCheckedChildren="单词" />
                                </div>
                                <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                                    <Switch checked={dictationVocabsMode} onChange={handlersPanel2SwitchDictationVocabsMode} size="small" checkedChildren="英" unCheckedChildren="中" />
                                </div>
                            </div>
                        </section>
                        <Input.TextArea
                            value={inputValue}
                            onChange={(e) => handlersTextInput(e.target.value)}
                            autoSize
                            style={{ minHeight: "100px", borderRadius: "0", color: "#000" }}
                            placeholder="Input sentences or vocabs.&#10;EX: wear,wears,wore,worn,wearing"
                        />
                    </section>
                    <section style={{ display: "none" }}>
                        <audio ref={refAudio} loop></audio>
                    </section>
                </div>
                <div className="main-inner-item-main" style={{ display: "flex" }}>
                    <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                        <source src={localOrigin} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </div>
            </Layout>
        </>
    );
};

export default View;
