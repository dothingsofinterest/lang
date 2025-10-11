import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, BulbFilled, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveSentence, updateActiveSentencePos } from "../../stores/reducers/project";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import Script from "../learn/Script";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] video/index");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const project = useSelector((state: RootState) => state.project);
    const script = useSelector((state: RootState) => state.project.script.data);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const videoURL = useSelector((state: RootState) => state.project.videoURL);
    const activeSentence = useSelector((state: RootState) => state.project.activeSentence);
    const activeSentencePos = useSelector((state: RootState) => state.project.activeSentencePos);
    const activeVocab = useSelector((state: RootState) => state.project.activeVocab);
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refActiveSentence = useRef({ activeSentence: activeSentence });
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
            const activeSentence = refActiveSentence.current.activeSentence;
            const cur = sentences[activeSentence];
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
            const activeSentence = refActiveSentence.current.activeSentence;
            const prevIndex = activeSentence <= 0 ? 0 : activeSentence - 1;
            const prev = sentences[prevIndex];
            if (prev !== undefined && fnIsSRTTime(prev.startTime)) {
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
        if (refVideo.current && videoURL) {
            const activeSentence = refActiveSentence.current.activeSentence;
            const nextIndex = activeSentence === sentences.length - 1 ? activeSentence : activeSentence + 1;
            const next = sentences[nextIndex];
            if (next !== undefined && fnIsSRTTime(next.startTime)) {
                dispatch(updateActiveSentence(nextIndex));
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersInputTips = () => {
        let answerLine = ``;
        let inputLine = ``;
        if (sentences.length > 0) {
            answerLine = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
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
    };
    const handlersPanelActiveClear = () => {
        if (refVideo.current && videoURL) {
            refVideo.current.currentTime = 0;
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        dispatch(updateActiveSentence(0));
    };
    const handlersVideoEnded = () => {
        console.log("video ended");
        dispatch(updateActiveSentence(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlersVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTimeUpdate = (e: any) => {
        const cur = sentences[activeSentence];
        if (cur !== undefined) {
            const endTime = fnSRTTimeToFloat(cur.endTime);
            if (e.target.currentTime >= endTime) {
                if (activeSentence <= sentences.length - 1) {
                    refVideo.current?.pause();
                    setPlayButton(<PlayCircleOutlined />);
                }
            }
        }
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {
        if (event.code === "ArrowLeft") {
            handlersPanelPlayBackward();
        }
        if (event.code === "ArrowRight") {
            handlersPanelPlayForward();
        }
        if (event.code === "F8") {
            handlersPanelPlayAgain();
        }
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (sentences.length > 0) {
            const answer = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
            const answerText = answer
                .replace(/[\,\.\?\!\-]/g, "")
                .toLowerCase()
                .trim();
            const inputText = value.toLowerCase();
            if (value === answer || inputText === answerText) {
                setInputValue("");
                dispatch(updateActiveSentence(activeSentence + 1));
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersRenderedCallback = (scrollTopPoint: number, scrollTopVocab: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        const scrollTopVocabValue = scrollTop + scrollTopVocab;
        dispatch(updateActiveSentencePos(scrollTopPointValue));
        refScrollbar.current?.scrollTop(scrollTopPointValue);
    };
    const fnOnMounted = () => {
        if (!script.title || !videoURL || !refVideo.current) {
            console.log("Script or Video is required.");
        } else {
            const sentences: DataSentence[] = [];
            script.paragraphs.forEach((v: DataParagraph) => {
                sentences.push(...v.sentences);
            });
            refVideo.current.load();
            refVideo.current.currentTime = sentences[activeSentence] !== undefined && fnIsSRTTime(sentences[activeSentence].startTime) ? fnSRTTimeToFloat(sentences[activeSentence].startTime) : 0;
            refScrollbar.current?.scrollTop(activeSentencePos);
            setSentences(sentences);
        }
    };
    useEffect(() => {
        if (!project.name || !project.videoURL || !project.videoCompressedURL) {
            alert("Please create a project.");
            navigate("/settings");
        }
        console.log("[mounted] video/index");
        fnOnMounted();
        window.addEventListener("keydown", handlersEventKeyboardOnDown);
        return () => {
            console.log("[unmounted] video/index");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("[effected by activeSentence] video/index");
        refActiveSentence.current = {
            activeSentence: activeSentence,
        };
    }, [activeSentence]);
    return (
        <Layout id="video-index" className="main-inner">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 132px" }}>
                <section id="panel">
                    <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} className="btn"></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} className="btn"></Button>
                    <Button icon={playButton} onClick={handlersPanelPlay} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} className="btn"></Button>
                    <Button icon={<BulbFilled />} onClick={handlersInputTips} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataFormatted={dataFormatted} activeSentence={activeSentence} activeVocab={activeVocab} showFooter={false} onRendered={handlersRenderedCallback} />
                </Scrollbars>
                <section id="input-area">
                    <Input.TextArea className="input-textarea" value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} autoSize placeholder="Please Type Sentence" />
                </section>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
            <div className="main-inner-item-main" style={{ display: "flex" }}>
                <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                    <source src={videoURL} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
        </Layout>
    );
};

export default Index;
