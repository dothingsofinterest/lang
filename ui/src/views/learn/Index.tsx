import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, Radio } from "antd";
import { AudioFilled, ClearOutlined, PrinterOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { Script as DataScript, Vocab as DataVocab, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import store, { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch, Provider } from "react-redux";
import { updateActiveSentence, updateActiveSentencePos, updateActiveVocab, updateActiveVocabPos, updatePlayMode } from "../../stores/reducers/project";
import { Scrollbars } from "react-custom-scrollbars-2";
import ReactDOMServer from "react-dom/server";
import printJS from "print-js";
import Script from "./Script";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] learn/index");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const project = useSelector((state: RootState) => state.project);
    const script = useSelector((state: RootState) => state.project.script.data);
    const recognitionRef = useRef<any>(null);
    const [listening, setListening] = useState(false);
    const [speech, setSpeech] = useState("");
    const [matchInfo, setMatchInfo] = useState<React.ReactNode>(<b>Hello</b>);
    const refScrollbar = useRef<Scrollbars>(null);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const activeSentence = useSelector((state: RootState) => state.project.activeSentence);
    const activeSentencePos = useSelector((state: RootState) => state.project.activeSentencePos);
    const activeVocab = useSelector((state: RootState) => state.project.activeVocab);
    const activeVocabPos = useSelector((state: RootState) => state.project.activeVocabPos);
    const playMode = useSelector((state: RootState) => state.project.playMode);
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [vocabs, setVocabs] = useState<DataVocab[]>([]);
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
        const index = activeVocab + 1 >= vocabs.length ? activeVocab : activeVocab + 1;
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
                answerText = vocabs[activeVocab].text.split(", ")[1];
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
    const handlersPrint = () => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            if (dataFormatted.title) {
                const css = `
                * { outline: none; }
                html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
                body { margin: 0; padding: 0; font-size: 14px; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
                ol, ul, li { list-style: none; }
                article { width: 1000px; }
                article h1 { text-align: center; font-size: 16px; font-weight: 900; line-height: 40px; color: #000; margin: 10px 15px; }
                article .scene { background: #666; padding: 10px 0 0; margin: 10px 20px; border-radius: 4px; }
                article .scene h2 { text-align: center; font-size: 14px; font-weight: 300; font-style: italic; line-height: 20px; color: #ccc; margin: 0px 10px; }
                article .scene p { border-top: 1px dotted #ccc; margin: 0; padding: 6px 10px; color: #fff; font-size: 14px; line-height: 26px; }
                article .scene p.pure { text-indent: 30px; }
                article .scene p:first-of-type  { border-top: 0; }
                article .scene p .point { padding: 0 4px; }
                article .scene p .point:first-child { padding: 0; }
                article .scene p .role { font-style: normal; font-weight: 900; color: #ccc; }
                article .scene ul { border-top: 1px dotted #ccc; margin: 0; padding: 6px 10px; color: #fff; font-size: 14px; line-height: 26px; }
                article .scene ul .role { font-style: normal; font-weight: 900; color: #ccc; }
                article footer { height: 100%; }
                article footer #vocabs,
                article footer #grammars { color: #fff; padding: 10px 0 0; margin: 20px; background: #666; border-radius: 4px; }
                article footer #vocabs .title,
                article footer #grammars .title { color: #fff; margin: 0 10px; line-height: 22px; text-align: center; font-weight: 900; font-size: 16px; }
                article footer #vocabs .item,
                article footer #grammars .item { margin: 0; padding: 6px 10px; border-top: 1px dotted #ccc; line-height: 26px; }
                article footer #vocabs .item:nth-child(2),
                article footer #grammars .item:nth-child(2) { border-top: 0; }
                article footer #vocabs .index,
                article footer #grammars .index { font-weight: 900; margin-right: 4px; }`;
                const content = ReactDOMServer.renderToStaticMarkup(
                    <Provider store={store}>
                        <Script dataFormatted={dataFormatted} activeSentence={0} activeVocab={0} />
                    </Provider>,
                );
                printJS({ printable: `${content}`, type: "raw-html", style: css });
            } else {
                alert(`Data not be set`);
            }
        } else {
            alert("Please create a project.");
        }
    };
    useEffect(() => {
        if (!project.name || !project.videoURL || !project.videoCompressedURL) {
            alert("Please create a project.");
            navigate("/settings");
        }
        console.log("[mounted] learn/index");
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
        return () => {
            console.log("[unmounted] learn/index");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("[effected by speech] learn/index");
        handlersMatch();
    }, [speech]);
    useEffect(() => {
        console.log("[effected by activeSentence] learn/index");
        refActiveSentence.current = { activeSentence, activeVocab, listening, playMode };
    }, [activeSentence, activeVocab, listening, playMode]);
    return (
        <Layout className="main-inner" id="learn-index">
            <div className="main-inner-item-aside">
                <section className="type">
                    <Input.TextArea autoSize style={{ minHeight: "200px", borderRadius: "0", color: "#000" }} />
                </section>
                <section className="speak">
                    <Button icon={<AudioFilled />} onClick={handlersPanelRecordStart} className={recognitionRef.current && listening === false ? `record-btn` : `record-btn started`}></Button>
                    <div>{speech}</div>
                    <div>{matchInfo}</div>
                </section>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section className="article-panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelSentenceBackward} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelSentenceForward} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn" />
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelVocabsBackward} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelVocabsForward} className="btn" />
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataFormatted={dataFormatted} activeSentence={activeSentence} activeVocab={activeVocab} showFooter={true} onRendered={handlersRenderedCallback} />
                </Scrollbars>
            </div>
        </Layout>
    );
};
export default Index;
