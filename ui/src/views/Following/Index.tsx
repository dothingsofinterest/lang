import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, DashboardOutlined, FastBackwardOutlined, PrinterOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateVideoMatchingSentence, updateVideoMatchingSentencePos } from "../../stores/reducers/status";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import ReactDOMServer from "react-dom/server";
import Script from "./Script";
import printJS from "print-js";
import { strip } from "../../utils/number";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const data = useSelector((state: RootState) => state.data);
    const scriptParsed = useSelector((state: RootState) => state.data.scriptParsed);
    const videoURL = useSelector((state: RootState) => state.data.videoURL);
    const firstSentenceID = scriptParsed.sentences.length > 0 ? scriptParsed.sentences[0].id : 0;
    const matchingSentence = useSelector((state: RootState) => (state.status.videoMatchingSentence ? state.status.videoMatchingSentence : firstSentenceID));
    const matchingSentencePos = useSelector((state: RootState) => state.status.videoMatchingSentencePos);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refState = useRef({ matchingSentence, playSpeed });
    const handlersPanelPlay = () => {
        if (refVideo.current && videoURL) {
            const isPaused = refVideo.current.paused;
            if (isPaused) {
                const playSpeed = refState.current.playSpeed;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
            } else {
                refVideo.current.pause();
            }
            setPlayButton(isPaused ? <PauseCircleOutlined /> : <PlayCircleOutlined />);
        }
    };
    const handlersPanelPlayAgain = () => {
        if (refVideo.current && videoURL) {
            const playSpeed = refState.current.playSpeed;
            const curSentenceID = refState.current.matchingSentence;
            const curSentence = scriptParsed.sentences.find(({ id }) => id === curSentenceID);
            if (curSentence !== undefined && fnIsSRTTime(curSentence.startTime)) {
                refVideo.current.currentTime = fnSRTTimeToFloat(curSentence.startTime);
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersPanelPlayBackward = () => {
        if (refVideo.current && videoURL) {
            const playSpeed = refState.current.playSpeed;
            const curSentenceID = refState.current.matchingSentence;
            const curSentenceIndex = scriptParsed.sentences.findIndex(({ id }) => id === curSentenceID);
            const prevSentence = scriptParsed.sentences[curSentenceIndex - 1];
            if (prevSentence !== undefined && fnIsSRTTime(prevSentence.startTime)) {
                dispatch(updateVideoMatchingSentence(prevSentence.id));
                refVideo.current.currentTime = fnSRTTimeToFloat(prevSentence.startTime);
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersPanelPlayForward = () => {
        if (refVideo.current && videoURL) {
            const playSpeed = refState.current.playSpeed;
            const curSentenceID = refState.current.matchingSentence;
            const curSentenceIndex = scriptParsed.sentences.findIndex(({ id }) => id === curSentenceID);
            const nextSentence = scriptParsed.sentences[curSentenceIndex + 1];
            if (nextSentence !== undefined && fnIsSRTTime(nextSentence.startTime)) {
                dispatch(updateVideoMatchingSentence(nextSentence.id));
                refVideo.current.currentTime = fnSRTTimeToFloat(nextSentence.startTime);
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersPlaySpeedUp = () => {
        if (refVideo.current && videoURL) {
            const playSpeed = strip(refState.current.playSpeed + 0.2);
            const playSpeedMax = playSpeed > 2 ? 2 : playSpeed;
            const curSentenceID = refState.current.matchingSentence;
            const curSentence = scriptParsed.sentences.find(({ id }) => id === curSentenceID);
            if (curSentence !== undefined && fnIsSRTTime(curSentence.startTime)) {
                refVideo.current.currentTime = fnSRTTimeToFloat(curSentence.startTime);
                refVideo.current.playbackRate = playSpeedMax;
                refVideo.current.play();
                setPlaySpeed(playSpeedMax);
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersPlaySpeedDown = () => {
        if (refVideo.current && videoURL) {
            const playSpeed = strip(refState.current.playSpeed - 0.2);
            const playSpeedMax = playSpeed === 0 ? 0.2 : playSpeed;
            const curSentenceID = refState.current.matchingSentence;
            const curSentence = scriptParsed.sentences.find(({ id }) => id === curSentenceID);
            if (curSentence !== undefined && fnIsSRTTime(curSentence.startTime)) {
                refVideo.current.currentTime = fnSRTTimeToFloat(curSentence.startTime);
                refVideo.current.playbackRate = playSpeedMax;
                refVideo.current.play();
                setPlaySpeed(playSpeedMax);
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlersPanelActiveClear = () => {
        if (refVideo.current && videoURL) {
            refVideo.current.currentTime = 0;
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        dispatch(updateVideoMatchingSentence(firstSentenceID));
    };
    const handlersVideoEnded = () => {
        dispatch(updateVideoMatchingSentence(firstSentenceID));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlersVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTimeUpdate = (e: any) => {
        const cur = scriptParsed.sentences.find(({ id }) => id === matchingSentence);
        if (cur !== undefined) {
            if (e.target.currentTime >= fnSRTTimeToFloat(cur.endTime)) {
                refVideo.current?.pause();
                setPlayButton(<PlayCircleOutlined />);
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
        if (data.videoHash && data.videoURL) {
            if (scriptParsed.title) {
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
						article footer #script-vocab,
						article footer #script-grammar { color: #000; padding: 6pt 0 0; margin: 16pt; background: #fff; }
						article footer #script-vocab .title,
						article footer #script-grammar .title { color: #000; margin: 0; line-height: 36pt; text-align: center; font-weight: 900; font-size: 12pt; }
						article footer #script-vocab .item,
						article footer #script-grammar .item { margin: 0; padding: 2pt 0; border-top: 1px dotted #ccc; font-size: 12pt; line-height: 24pt; }
						article footer #script-vocab .item { display: flex; justify-content: space-between; }                              
                        article footer #script-vocab .item:nth-child(2),
						article footer #script-grammar .item:nth-child(2) { border-top: 0; }
                        article footer #script-vocab .item .en { flex: 1; } 
                        article footer #script-vocab .item .pr,  
                        article footer #script-vocab .item .cn { flex: 0.5; } 
                        article footer #script-vocab .item .cn { font-size: 10pt; } 
						article footer #script-vocab .item .index,
						article footer #script-grammars .item .index { font-weight: 300; margin-right: 1pt; font-style: normal; };
					}
				`;
                const content = ReactDOMServer.renderToStaticMarkup(<Script scriptParsed={scriptParsed} showFooter={true} />);
                printJS({ printable: `${content}`, type: "raw-html", style: style1 });
            } else {
                alert(`Data not be set`);
            }
        } else {
            alert("Please upload a video.");
        }
    };
    useEffect(() => {
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
            if (event.code === "ControlRight") {
                event.preventDefault();
                handlersPanelPlay();
            }
            if (event.code === "ArrowUp") {
                event.preventDefault();
                handlersPlaySpeedUp();
            }
            if (event.code === "ArrowDown") {
                event.preventDefault();
                handlersPlaySpeedDown();
            }
        };
        const curSentence = scriptParsed.sentences.find(({ id }) => id === matchingSentence);
        if (curSentence !== undefined && curSentence.startTime) {
            if (videoElem) {
                videoElem.load();
                videoElem.currentTime = fnSRTTimeToFloat(curSentence.startTime);
                refScrollbar.current?.scrollTop(matchingSentencePos);
            }
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
        refState.current = { matchingSentence, playSpeed };
    }, [matchingSentence, playSpeed]);
    return (
        <Layout id="following-index" className="main-inner">
            <div className="main-inner-item-aside">
                <video style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                    <source src={videoURL} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} className="btn"></Button>
                    <Button icon={<DashboardOutlined />} className="btn">
                        {playSpeed}
                    </Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} className="btn"></Button>
                    <Button icon={playButton} onClick={handlersPanelPlay} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script scriptParsed={scriptParsed} curSentenceID={matchingSentence} onRendered={handlersRenderedCallback} />
                </Scrollbars>
            </div>
        </Layout>
    );
};

export default Index;
