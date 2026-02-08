import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, GoogleOutlined, FastBackwardOutlined, FileWordFilled, AudioFilled, PrinterOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateVideoMatchingSentence, updateVideoMatchingSentencePos } from "../../stores/reducers/plan";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import ReactDOMServer from "react-dom/server";
import Script from "./Script";
import printJS from "print-js";
import EditorVocabs from "../CommonEditorVocabs/Index";
import EditorGrammars from "../CommonEditorGrammars/Index";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const videoURL = useSelector((state: RootState) => state.plan.videoURL);
    const matchingSentence = useSelector((state: RootState) => state.plan.videoMatchingSentence);
    const matchingSentencePos = useSelector((state: RootState) => state.plan.videoMatchingSentencePos);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [listening, setListening] = useState(false);
    const [vocabsEditor, setVocabsEditor] = useState(false);
    const [grammarsEditor, setGrammarsEditor] = useState(false);
    const refScrollbar = useRef<Scrollbars>(null);
    const recognitionRef = useRef<any>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refMatchingSentence = useRef({ matchingSentence });
    const handlersPanelPlay = () => {
        if (refVideo.current && videoURL) {
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
        if (refVideo.current && videoURL) {
            const matchingSentence = refMatchingSentence.current.matchingSentence;
            const cur = dataFormatted.sentences[matchingSentence];
            if (cur !== undefined && fnIsSRTTime(cur.startTime)) {
                refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayBackward = () => {
        if (refVideo.current && videoURL) {
            const matchingSentence = refMatchingSentence.current.matchingSentence;
            const prevIndex = matchingSentence <= 0 ? 0 : matchingSentence - 1;
            const prev = dataFormatted.sentences[prevIndex];
            if (prev !== undefined && fnIsSRTTime(prev.startTime)) {
                dispatch(updateVideoMatchingSentence(prevIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(prev.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            } else {
                const prevPrevIndex = prevIndex <= 0 ? 0 : prevIndex - 1;
                dispatch(updateVideoMatchingSentence(prevPrevIndex));
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayForward = () => {
        if (refVideo.current && videoURL) {
            const matchingSentence = refMatchingSentence.current.matchingSentence;
            const nextIndex = matchingSentence === dataFormatted.sentences.length - 1 ? matchingSentence : matchingSentence + 1;
            const next = dataFormatted.sentences[nextIndex];
            if (next !== undefined && fnIsSRTTime(next.startTime)) {
                dispatch(updateVideoMatchingSentence(nextIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            } else {
                const nextNextIndex = nextIndex === dataFormatted.sentences.length - 1 ? nextIndex : nextIndex + 1;
                dispatch(updateVideoMatchingSentence(nextNextIndex));
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelActiveClear = () => {
        if (refVideo.current && videoURL) {
            refVideo.current.currentTime = 0;
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        dispatch(updateVideoMatchingSentence(0));
    };
    const handlersVideoEnded = () => {
        dispatch(updateVideoMatchingSentence(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlersVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTimeUpdate = (e: any) => {
        const cur = dataFormatted.sentences[matchingSentence];
        if (cur !== undefined) {
            if (fnIsSRTTime(cur.endTime)) {
                if (e.target.currentTime >= fnSRTTimeToFloat(cur.endTime)) {
                    if (matchingSentence <= dataFormatted.sentences.length - 1) {
                        refVideo.current?.pause();
                        setPlayButton(<PlayCircleOutlined />);
                    }
                }
            } else {
                dispatch(updateVideoMatchingSentence(matchingSentence + 1));
            }
        }
    };
    const handlersRenderedCallback = (scrollTopPoint: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        dispatch(updateVideoMatchingSentencePos(scrollTopPointValue));
        refScrollbar.current?.scrollTop(scrollTopPointValue);
    };
    const handlersPrint = () => {
        if (plan.hash && plan.videoURL) {
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
						article .scene p { margin: 2pt 0; padding: 0; color: #000; font-size: 12pt; line-height: 24pt; }
						article .scene p.pure { text-indent: 26pt; }
                        article .scene p.indent { text-indent: 26pt; }
						article .scene p:first-of-type  { border-top: 0; }
						article .scene p .point { padding: 0 2pt; }
						article .scene p .point:first-child { padding: 0; }
						article .scene p .role { font-style: normal; font-weight: 900; color: #000; }
						article .scene ul { margin: 0; padding: 2pt 0; color: #000; font-size: 10pt; line-height: 22pt; }
						article .scene ul .role { font-style: normal; font-weight: 900; color: #000; }
						article footer { height: 100%; }
						article footer #script-vocabs,
						article footer #script-grammars { color: #000; padding: 6pt 0 0; margin: 16pt; background: #fff; }
						article footer #script-vocabs .title,
						article footer #script-grammars .title { color: #000; margin: 0; line-height: 36pt; text-align: center; font-weight: 900; font-size: 12pt; }
						article footer #script-vocabs .item,
						article footer #script-grammars .item { margin: 0; padding: 2pt 0; border-top: 1px dotted #ccc; font-size: 12pt; line-height: 24pt; }
						article footer #script-vocabs .item { display: flex; justify-content: space-between; }                              
                        article footer #script-vocabs .item:nth-child(2),
						article footer #script-grammars .item:nth-child(2) { border-top: 0; }
                        article footer #script-vocabs .item .en { flex: 1; } 
                        article footer #script-vocabs .item .pr,  
                        article footer #script-vocabs .item .cn { flex: 0.5; } 
                        article footer #script-vocabs .item .cn { font-size: 10pt; } 
						article footer #script-vocabs .item .index,
						article footer #script-grammars .item .index { font-weight: 300; margin-right: 1pt; font-style: normal; };
					}
				`;
                const content = ReactDOMServer.renderToStaticMarkup(<Script dataFormatted={dataFormatted} showFooter={true} />);
                printJS({ printable: `${content}`, type: "raw-html", style: style1 });
            } else {
                alert(`Data not be set`);
            }
        } else {
            alert("Please upload a video.");
        }
    };
    const handlersPanelRecordStart = async () => {
        if (recognitionRef.current) {
            await recognitionRef.current.stop();
            if (listening === false) {
                recognitionRef.current.start();
                setListening(true);
            } else {
                setListening(false);
            }
        }
    };
    const handlersVocabsEditorOpen = () => {
        setVocabsEditor(true);
    };
    const handlersVocabsEditorClose = () => {
        setVocabsEditor(false);
    };
    const handlersGrammarsEditorOpen = () => {
        setGrammarsEditor(true);
    };
    const handlersGrammarsEditorClose = () => {
        setGrammarsEditor(false);
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please upload a video.");
            navigate("/common/settings");
        }
        if (plan.type !== 0 && plan.type !== 1) {
            alert("This is not a video plan.");
            navigate("/common/settings");
        }
        const videoElem = refVideo.current;
        const videoKeyboardOnDownHandler = (event: KeyboardEvent) => {
            if (event.code === "Numpad0") {
                handlersPanelPlayAgain();
            }
            if (event.code === "ArrowLeft") {
                handlersPanelPlayBackward();
            }
            if (event.code === "ArrowRight") {
                handlersPanelPlayForward();
            }
        };
        if (videoElem) {
            videoElem.load();
            videoElem.currentTime = dataFormatted.sentences[matchingSentence] !== undefined && fnIsSRTTime(dataFormatted.sentences[matchingSentence].startTime) ? fnSRTTimeToFloat(dataFormatted.sentences[matchingSentence].startTime) : 0;
            refScrollbar.current?.scrollTop(matchingSentencePos);
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
                    alert(transcript);
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
        window.addEventListener("keydown", videoKeyboardOnDownHandler);
        return () => {
            window.removeEventListener("keydown", videoKeyboardOnDownHandler);
            if (videoElem) {
                videoElem.pause();
                videoElem.removeAttribute("src");
                videoElem.load();
            }
        };
    }, []);
    useEffect(() => {
        refMatchingSentence.current = { matchingSentence };
    }, [matchingSentence]);
    return (
        <Layout id="video-read" className="main-inner">
            <div className="main-inner-item-aside" style={{ display: "flex" }}>
                <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                    <source src={videoURL} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} className="btn"></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} className="btn"></Button>
                    <Button icon={playButton} onClick={handlersPanelPlay} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                    <Button icon={<AudioFilled />} onClick={handlersPanelRecordStart} className={recognitionRef.current && listening === true ? `btn recording` : `btn`}></Button>
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                    <Button icon={<FileWordFilled />} onClick={handlersVocabsEditorOpen} className="btn" />
                    <Button icon={<GoogleOutlined />} onClick={handlersGrammarsEditorOpen} className="btn" />
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataFormatted={dataFormatted} matchingSentence={matchingSentence} onRendered={handlersRenderedCallback} />
                </Scrollbars>
                <EditorVocabs vocabs={dataFormatted.vocabs} open={vocabsEditor} onClose={handlersVocabsEditorClose} />
                <EditorGrammars grammars={dataFormatted.grammars} open={grammarsEditor} onClose={handlersGrammarsEditorClose} />
            </div>
        </Layout>
    );
};

export default Index;
