import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Switch } from "antd";
import { Script as DataScript, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, BulbFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveSentence, updateActiveSentencePos, updateActiveVocab, updateActiveVocabPos, updatePlayStop } from "../../stores/reducers/project";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import { ttsGen } from "../../api/requestAuth";
import "./Index.scss";
import Script from "./Script";

const textareaPlaceholder = `Input sentences or vocabs.&#10;EX: wear,wears,wore,worn,wearing`;
const Index = () => {
    console.log("[rendered] play/index");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const localOrigin = useSelector((state: RootState) => state.video.localOrigin);
    const activeSentence = useSelector((state: RootState) => state.project.activeSentence);
    const activeSentencePos = useSelector((state: RootState) => state.project.activeSentencePos);
    const activeVocab = useSelector((state: RootState) => state.project.activeVocab);
    const activeVocabPos = useSelector((state: RootState) => state.project.activeVocabPos);
    const playStop = useSelector((state: RootState) => state.project.playStop);
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState<boolean>(true); // true-sentence false-word
    const [dictationVocabsMode, setDictationVocabsMode] = useState<boolean>(true); // true-EN false-CN
    const articleRef = useRef<HTMLDivElement>(null);
    const [vocabs, setVocabs] = useState<string[]>([]);
    const activeSentencePosRef = useRef<number>(activeSentencePos);
    const activeVocabPosRef = useRef<number>(activeVocabPos);
    const refScrollbar = useRef<Scrollbars>(null);
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
            if (cur !== undefined && fnIsSRTTime(cur.startTime)) {
                refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                refVideo.current?.play();
                refScrollbar.current?.scrollTop(activeSentencePosRef.current);
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
            if (cur !== undefined && fnIsSRTTime(cur.startTime)) {
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
            if (prev !== undefined && fnIsSRTTime(prev.startTime)) {
                dispatch(updateActiveSentence(prevIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(prev.startTime);
                refVideo.current?.play();
                refScrollbar.current?.scrollTop(activeSentencePosRef.current);
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
            if (next !== undefined && fnIsSRTTime(next.startTime)) {
                dispatch(updateActiveSentence(nextIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                refScrollbar.current?.scrollTop(activeSentencePosRef.current);
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
            }
        } else {
            fnPlayAudio(activeVocab);
            if (refVideo.current) {
                refVideo.current.pause();
                setPlayButton(<PlayCircleOutlined />);
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
        refScrollbar.current?.scrollTop(activeSentencePosRef.current);
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (sentences.length > 0) {
            if (inputMode) {
                const answer = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
                const answerPure = answer.replace(/[\,\.\?\!]/g, "");
                if (value === answer || value === answerPure) {
                    setInputValue("");
                    dispatch(updateActiveSentence(activeSentence + 1));
                    refVideo.current?.play();
                    setPlayButton(<PauseCircleOutlined />);
                }
            } else {
                const valueTrans = value.includes(",") ? value.replaceAll(",", "/") : value;
                if (vocabs[activeVocab].split(", ")[1] === valueTrans) {
                    setInputValue("");
                    dispatch(updateActiveVocab(activeVocab + 1 === vocabs.length ? 0 : activeVocab + 1));
                    fnPlayAudio(activeVocab + 1 === vocabs.length ? 0 : activeVocab + 1);
                }
            }
        }
    };
    const handlersInputTips = () => {
        if (sentences.length > 0) {
            let answerLine = ``;
            let inputLine = ``;
            if (inputMode) {
                answerLine = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
            } else {
                answerLine = vocabs[activeVocab].split(", ")[1].replace(/\//g, ",");
            }
            for (let i = 0; i < answerLine.length; i++) {
                if (inputValue[i] === answerLine[i]) {
                    inputLine += inputValue[i];
                } else {
                    inputLine += "X";
                    break;
                }
            }
            alert(`${answerLine}\r\n${inputLine}`);
        }
    };
    const handlersRenderedCallback = (scrollTopPoint: number, scrollTopVocab: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        const scrollTopVocabValue = scrollTop + scrollTopVocab;
        dispatch(updateActiveSentencePos(scrollTop + scrollTopPoint));
        dispatch(updateActiveVocabPos(scrollTopVocab + scrollTopPoint));
        activeSentencePosRef.current = scrollTopPointValue;
        activeVocabPosRef.current = scrollTopVocabValue;
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
            const type = dictationVocabsMode && / [A-Z]/.test(vocabsArr[2]) ? 3 : dictationVocabsMode ? 1 : 2;
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
            refVideo.current.currentTime = sentences[activeSentence] !== undefined && fnIsSRTTime(sentences[activeSentence].startTime) ? fnSRTTimeToFloat(sentences[activeSentence].startTime) : 0;
            refScrollbar.current?.scrollTop(activeSentencePosRef.current);
            setSentences(sentences);
            setVocabs(script.vocabs);
        }
    };
    // Lives Hook
    useEffect(() => {
        console.log("[mounted] play/index");
        livesHooksInit();
        window.addEventListener("keydown", handlersEventKeyboardOnDown);
        return () => {
            console.log("[unmounted] play/index");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("[effected by refVideo, sentences, activeSentence] play/index");
        refClosure.current = {
            refVideo: refVideo,
            sentences: sentences,
            activeSentence: activeSentence,
        };
    }, [refVideo, sentences, activeSentence]);
    return (
        <Layout id="play-index" className="main-inner">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 132px" }}>
                <section id="play-panel">
                    <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                    <Button icon={playButton} onClick={handlersPanelPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                    <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                        <Switch checked={playStop} onChange={handlersPanelSwithStopMode} size="small" checkedChildren="停顿" unCheckedChildren="不停" />
                    </div>
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataArticle={dataArticle} activeSentence={activeSentence} activeVocab={activeVocab} onRendered={handlersRenderedCallback} />
                </Scrollbars>
                <section id="input-panel">
                    <div className="input-panel-bar">
                        <div className="btn">
                            <Switch checked={inputMode} onChange={handlersPanel2SwitchInputMode} size="small" checkedChildren="文章" unCheckedChildren="单词" />
                        </div>
                        <div className="btn">
                            <Switch checked={dictationVocabsMode} onChange={handlersPanel2SwitchDictationVocabsMode} size="small" checkedChildren="英" unCheckedChildren="中" />
                        </div>
                        <div className="btn">
                            <Button icon={<BulbFilled />} onClick={handlersInputTips} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </div>
                    <Input.TextArea className="input-panel-area" value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} autoSize placeholder={textareaPlaceholder} />
                </section>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
            <div className="main-inner-item-main" style={{ display: "flex" }}>
                <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                    <source src={localOrigin} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
        </Layout>
    );
};

export default Index;
