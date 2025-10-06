import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { PlusCircleOutlined, UploadOutlined, PrinterOutlined, DownloadOutlined, LogoutOutlined, AudioFilled, ClearOutlined } from "@ant-design/icons";
import { Script as DataScript, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import store, { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, BulbFilled } from "@ant-design/icons";
import { updateActiveSentence, updateActiveSentencePos, updateActiveVocab, updateActiveVocabPos, updatePlayMode } from "../../stores/reducers/project";
import { Scrollbars } from "react-custom-scrollbars-2";
import Script from "../dictation/Script";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] speaking/index");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const recognitionRef = useRef<any>(null);
    const [listening, setListening] = useState(false);
    const [speech, setSpeech] = useState("");
    const [matchInfo, setMatchInfo] = useState<React.ReactNode>(<b>Hello</b>);
    const refScrollbar = useRef<Scrollbars>(null);
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const activeSentence = useSelector((state: RootState) => state.project.activeSentence);
    const activeSentencePos = useSelector((state: RootState) => state.project.activeSentencePos);
    const activeVocab = useSelector((state: RootState) => state.project.activeVocab);
    const activeVocabPos = useSelector((state: RootState) => state.project.activeVocabPos);
    const playMode = useSelector((state: RootState) => state.project.playMode);
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [vocabs, setVocabs] = useState<string[]>([]);
    const refActiveSentence = useRef({ activeSentence, activeVocab, listening, playMode });
    const handlersPanelSentenceBackward = () => {
        const activeSentence = refActiveSentence.current.activeSentence;
        const prevIndex = activeSentence <= 0 ? 0 : activeSentence - 1;
        dispatch(updateActiveSentence(prevIndex));
        dispatch(updatePlayMode(0));
    };
    const handlersPanelSentenceForward = () => {
        const activeSentence = refActiveSentence.current.activeSentence;
        const nextIndex = activeSentence === sentences.length - 1 ? activeSentence : activeSentence + 1;
        dispatch(updateActiveSentence(nextIndex));
        dispatch(updatePlayMode(0));
    };
    const handlersPanelActiveClear = () => {
        dispatch(updateActiveSentence(0));
        dispatch(updateActiveVocab(0));
        dispatch(updatePlayMode(0));
    };
    const handlersPanelVocabsBackward = () => {
        const activeVocab = refActiveSentence.current.activeVocab;
        const index = activeVocab - 1 <= 0 ? 0 : activeVocab - 1;
        dispatch(updateActiveVocab(index));
        dispatch(updatePlayMode(1));
    };
    const handlersPanelVocabsForward = () => {
        const activeVocab = refActiveSentence.current.activeVocab;
        const index = activeVocab + 1 === vocabs.length ? activeVocab : activeVocab + 1;
        dispatch(updateActiveVocab(index));
        dispatch(updatePlayMode(1));
    };
    const handlersPanelRecordStart = async () => {
        const listening = refActiveSentence.current.listening;
        if (recognitionRef.current) {
            await recognitionRef.current.stop();
            if (listening === false) {
                recognitionRef.current.start();
                setListening(true);
            } else {
                setListening(false);
                handlersMatch();
            }
        }
    };
    const handlersRenderedCallback = (scrollTopPoint: number, scrollTopVocab: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        const scrollTopVocabValue = scrollTop + scrollTopVocab;
        dispatch(updateActiveSentencePos(scrollTop + scrollTopPoint));
        dispatch(updateActiveVocabPos(scrollTopVocab + scrollTopPoint));
        if (playMode === 0) {
            refScrollbar.current?.scrollTop(scrollTopPointValue);
        } else {
            refScrollbar.current?.scrollTop(scrollTopVocabValue);
        }
    };
    const handlersMatch = () => {
        let answerText = ``;
        let inputText = ``;
        let tipsHTML = <React.Fragment></React.Fragment>;
        if (playMode === 0) {
            if (sentences.length > 0) {
                const answer = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
                answerText = answer
                    .replace(/[^a-zA-Z0-9\s]/g, "")
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .trim();
                inputText = speech
                    .replace(/[^a-zA-Z0-9\s]/g, "")
                    .replace(/\s+/g, " ")
                    .toLowerCase()
                    .trim();
                if (answer === speech || answerText === inputText) {
                    dispatch(updateActiveSentence(activeSentence + 1 === sentences.length ? activeSentence : activeSentence + 1));
                }
            }
        }
        if (playMode === 1) {
            if (vocabs.length > 0) {
                answerText = vocabs[activeVocab].split(", ")[1];
                inputText = speech.toLowerCase().replaceAll(" ", "/").replace(/\s+/g, " ").trim();
                if (answerText === inputText) {
                    dispatch(updateActiveVocab(activeVocab + 1 === vocabs.length ? activeVocab : activeVocab + 1));
                }
            }
        }
        const index = answerText.indexOf(inputText);
        if (index !== -1) {
            tipsHTML = (
                <React.Fragment>
                    {answerText.slice(0, index)}
                    <span className="matched">{inputText}</span>
                    {answerText.slice(index + inputText.length)}
                </React.Fragment>
            );
        } else {
            tipsHTML = <React.Fragment>{answerText}</React.Fragment>;
        }
        setMatchInfo(tipsHTML);
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {
        const playMode = refActiveSentence.current.playMode;
        if (event.code === "ArrowLeft") {
            if (playMode === 0) {
                handlersPanelSentenceBackward();
            } else {
                handlersPanelVocabsBackward();
            }
        }
        if (event.code === "ArrowRight") {
            if (playMode === 0) {
                handlersPanelSentenceForward();
            } else {
                handlersPanelVocabsForward();
            }
        }
        if (event.code === "Space") {
            handlersPanelRecordStart();
        }
    };
    useEffect(() => {
        console.log("[mounted] speaking/index");
        if (script.name) {
            // Sentences & Vocabs
            const sentences: DataSentence[] = [];
            script.paragraphs.forEach((v: DataParagraph) => {
                sentences.push(...v.sentences);
            });
            setSentences(sentences);
            setVocabs(script.vocabs);
            // Scroll Bar
            if (playMode === 0) {
                refScrollbar.current?.scrollTop(activeSentencePos);
            } else {
                refScrollbar.current?.scrollTop(activeVocabPos);
            }
            // Speech Recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Browser do not support Web Speech API.");
            } else {
                const recognition = new SpeechRecognition();
                recognition.lang = "en-US";
                recognition.continuous = true; // 持续监听话筒
                recognition.interimResults = false; // 防抖设置。false 表示只显示最终结果。
                recognition.onresult = (event: any) => {
                    const lastResult = event.results[event.results.length - 1];
                    if (lastResult.isFinal) {
                        const transcript = lastResult[0].transcript.trim();
                        setSpeech(transcript);
                    }
                };
                recognition.onerror = (event: any) => {
                    console.error("SpeechRecognition Error:", event.error);
                    setListening(false);
                };
                recognition.onend = () => {
                    setListening(false);
                };
                recognitionRef.current = recognition;
            }
            window.addEventListener("keydown", handlersEventKeyboardOnDown);
        } else {
            console.log("Script is required.");
        }
        return () => {
            console.log("[unmounted] speaking/index");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("[effected by speech] speaking/index");
        handlersMatch();
    }, [speech]);
    useEffect(() => {
        console.log("[effected by activeSentence] speaking/index");
        refActiveSentence.current = { activeSentence, activeVocab, listening, playMode };
    }, [activeSentence, activeVocab, listening, playMode]);
    return (
        <Layout className="main-inner" id="speaking-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section className="article-panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelSentenceBackward} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelSentenceForward} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelVocabsBackward} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelVocabsForward} className="btn"></Button>
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataArticle={dataArticle} activeSentence={activeSentence} activeVocab={activeVocab} onRendered={handlersRenderedCallback} />
                </Scrollbars>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section className="speaking-panel">
                    <Button icon={<AudioFilled />} onClick={handlersPanelRecordStart} className={recognitionRef.current && listening === false ? `record-btn` : `record-btn started`}></Button>
                </section>
                <section className="speaking-textarea">
                    <div>{speech}</div>
                    <div>{matchInfo}</div>
                </section>
            </div>
        </Layout>
    );
};
export default Index;
