import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { AudioFilled, PrinterOutlined } from "@ant-design/icons";
import { Script as DataScript, Vocab as DataVocab, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import ReactDOMServer from "react-dom/server";
import printJS from "print-js";
import Script from "./Script";
import "./Index.scss";

const Index = () => {
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const script = useSelector((state: RootState) => state.plan.script.data);
    const dataFormatted = useSelector((state: RootState) => state.plan.script.dataFormatted);
    const [matchingSentence, setMatchingSentence] = useState(0);
    const [matchingVocab, setMatchingVocab] = useState(0);
    const [listening, setListening] = useState(false);
    const [speech, setSpeech] = useState("");
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [vocabs, setVocabs] = useState<DataVocab[]>([]);
    const refListening = useRef({ listening });
    const recognitionRef = useRef<any>(null);
    const refScrollbar = useRef<Scrollbars>(null);
    const handlersPanelRecordStart = async () => {
        const listening = refListening.current.listening;
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
    const handlersMatch = () => {
        let answerText = ``;
        let inputText = ``;
        if (sentences.length > 0) {
            for (let i = 0; i < sentences.length; i++) {
                const answer = sentences[i].texts.map((v) => v.split("\n")[0]).join("\n");
                const answerText = answer
                    .replace(/[\,\.\?\!\-\'\s]/g, "")
                    .toLowerCase()
                    .trim();
                const inputText = speech
                    .toLowerCase()
                    .replace(/[\,\.\?\!\-\'\s]/g, "")
                    .toLowerCase()
                    .trim();
                if (speech === answer || inputText === answerText) {
                    setMatchingSentence(i);
                    break;
                }
            }
        }
        if (vocabs.length > 0) {
            for (let i = 0; i < vocabs.length; i++) {
                answerText = vocabs[i].text
                    .split(" | ")[0]
                    .replace(/[\/\,\.\?\!\-\'\s]/g, "")
                    .toLowerCase()
                    .trim();
                inputText = speech
                    .toLowerCase()
                    .replace(/[\,\.\?\!\-\'\s]/g, "")
                    .toLowerCase()
                    .trim();
                if (inputText === answerText) {
                    setMatchingVocab(i);
                    break;
                }
            }
        }
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {};
    const handlersPrint = () => {
        if (plan.videoHash && plan.videoURL) {
            if (dataFormatted.title) {
                const style1 = `
					@media print {
						@page { margin: 1cm 0.4cm; }
						* { outline: none; }
						html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
						body { margin: 0; padding: 0; font-size: 12pt; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
						ol, ul, li { list-style: none; }
						article { width: 100%; }
						article h1 { text-align: center; font-size: 14pt; font-weight: 900; line-height: 22pt; color: #000; margin: 2pt; }
						article .scene { background: #fff; color: #000;  padding: 10px 0 0; margin: 10px 20px; }
						article .scene h2 { text-align: center; font-size: 14pt; font-weight: 300; font-style: italic; line-height: 22pt; color: #000; margin: 0 6pt; }
						article .scene p { margin: 4pt 0; padding: 0; color: #000; font-size: 12pt; line-height: 26pt; }
						article .scene p.pure { text-indent: 26pt; }
                        article .scene p.indent { text-indent: 26pt; }
						article .scene p:first-of-type  { border-top: 0; }
						article .scene p .point { padding: 0 2pt; }
						article .scene p .point:first-child { padding: 0; }
						article .scene p .role { font-style: normal; font-weight: 900; color: #000; }
						article .scene ul { margin: 0; padding: 2pt 0; color: #000; font-size: 12pt; line-height: 22pt; }
						article .scene ul .role { font-style: normal; font-weight: 900; color: #000; }
						article footer { height: 100%; }
						article footer #vocabs,
						article footer #grammars { color: #000; padding: 6pt 0 0; margin: 16pt; background: #fff; }
						article footer #vocabs .title,
						article footer #grammars .title { color: #000; margin: 0; line-height: 36pt; text-align: center; font-weight: 900; font-size: 12pt; }
						article footer #vocabs .item,
						article footer #grammars .item { margin: 0; padding: 6pt 0; border-top: 1px dotted #ccc; line-height: 22pt; }
						article footer #vocabs .item { display: flex; justify-content: space-between; }                              
                        article footer #vocabs .item:nth-child(2),
						article footer #grammars .item:nth-child(2) { border-top: 0; }
                        article footer #vocabs .item .en { flex: 1; } 
                        article footer #vocabs .item .pr,  
                        article footer #vocabs .item .cn { flex: 0.5; } 
						article footer #vocabs .item .index,
						article footer #grammars .item .index { font-weight: 900; margin-right: 1pt; font-style: normal; };
					}
				`;
                const content = ReactDOMServer.renderToStaticMarkup(<Script dataFormatted={dataFormatted} />);
                printJS({ printable: `${content}`, type: "raw-html", style: style1 });
            } else {
                alert(`Data not be set`);
            }
        } else {
            alert("Please create a plan.");
        }
    };
    useEffect(() => {
        if (!plan.videoHash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/video/settings");
        }
        // Sentences & Vocabs
        const sentences: DataSentence[] = [];
        script.paragraphs.forEach((v: DataParagraph) => {
            sentences.push(...v.sentences);
        });
        setSentences(sentences);
        setVocabs(script.vocabs);
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
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        handlersMatch();
    }, [speech]);
    useEffect(() => {
        refListening.current = { listening };
    }, [listening]);
    return (
        <Layout className="main-inner" id="learn-index">
            <div className="main-inner-item-aside">
                <section className="speak">
                    <Button icon={<AudioFilled />} onClick={handlersPanelRecordStart} className={recognitionRef.current && listening === false ? `record-btn` : `record-btn started`}></Button>
                    <div style={{ fontSize: "30px" }}>{speech}</div>
                </section>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section className="article-panel">
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataFormatted={dataFormatted} matchingSentence={matchingSentence} matchingVocab={matchingVocab} showFooter={true} />
                </Scrollbars>
            </div>
        </Layout>
    );
};
export default Index;
