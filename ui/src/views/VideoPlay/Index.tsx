import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, BulbFilled, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateVideoMatchingSentence, updateVideoMatchingSentencePos } from "../../stores/reducers/plan";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import Script from "../VideoLearn/Script";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.script.dataFormatted);
    const videoURL = useSelector((state: RootState) => state.plan.videoURL);
    const matchingSentence = useSelector((state: RootState) => state.plan.videoMatchingSentence);
    const matchingSentencePos = useSelector((state: RootState) => state.plan.videoMatchingSentencePos);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
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
    const handlersInputTips = () => {
        if (dataFormatted.sentences.length > 0) {
            let tips1 = ``;
            let tips2 = ``;
            const answer = dataFormatted.sentences[matchingSentence].texts.map((v) => v.split("\n")[0]).join("\n");
            const input = inputValue;
            const answerText = answer
                .replace(/[\,\.\?\!\-\'\s]/g, "")
                .toLowerCase()
                .trim();
            const inputText = input
                .toLowerCase()
                .replace(/[\,\.\?\!\-\'\s]/g, "")
                .toLowerCase()
                .trim();
            for (let i = 0; i < answer.length; i++) {
                if (answer[i] === input[i]) {
                    tips1 += answer[i];
                } else {
                    tips1 += "X";
                    break;
                }
            }
            for (let i = 0; i < answerText.length; i++) {
                if (answerText[i] === inputText[i]) {
                    tips2 += answerText[i];
                } else {
                    tips2 += "X";
                    break;
                }
            }
            alert(`${answer}\r\n${tips1}\r\n---\r\n${answerText}\r\n${tips2}`);
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
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (dataFormatted.sentences.length > 0) {
            const answer = dataFormatted.sentences[matchingSentence].texts.map((v) => v.split("\n")[0]).join("\n");
            const answerText = answer
                .replace(/[\,\.\?\!\-\'\s]/g, "")
                .toLowerCase()
                .trim();
            const inputText = value
                .toLowerCase()
                .replace(/[\,\.\?\!\-\'\s]/g, "")
                .toLowerCase()
                .trim();
            if (value === answer || inputText === answerText) {
                setInputValue("");
                dispatch(updateVideoMatchingSentence(matchingSentence + 1));
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersRenderedCallback = (scrollTopPoint: number, scrollTopVocab: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        dispatch(updateVideoMatchingSentencePos(scrollTopPointValue));
        refScrollbar.current?.scrollTop(scrollTopPointValue);
    };
    useEffect(() => {
        if (!plan.videoHash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/video/settings");
        }
        const videoElem = refVideo.current;
        const videoKeyboardOnDownHandler = (event: KeyboardEvent) => {
            if (event.code === "F8") {
                handlersPanelPlayAgain();
            }
        };
        if (videoElem) {
            videoElem.load();
            videoElem.currentTime = dataFormatted.sentences[matchingSentence] !== undefined && fnIsSRTTime(dataFormatted.sentences[matchingSentence].startTime) ? fnSRTTimeToFloat(dataFormatted.sentences[matchingSentence].startTime) : 0;
            refScrollbar.current?.scrollTop(matchingSentencePos);
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
                    <Script dataFormatted={dataFormatted} matchingSentence={matchingSentence} showFooter={false} onRendered={handlersRenderedCallback} />
                </Scrollbars>
                <section id="input-area">
                    <Input.TextArea className="input-textarea" value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} placeholder="Please Type Sentence" />
                </section>
                <section style={{ display: "none" }}>
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
