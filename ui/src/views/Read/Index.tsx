import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, DashboardOutlined, FastBackwardOutlined, PrinterOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateReadSentenceIndex, updateReadVideoCurrentTime } from "../../stores/reducers/status";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import ReactDOMServer from "react-dom/server";
import { useParams } from "react-router-dom";
import Script from "./Script";
import { Script as DataScript } from "../../types/Data";
import { Domain } from "../../settings.js";
import { strip } from "../../utils/number";
import "./Index.scss";

const Index = () => {
    const { id } = useParams();
    const videoId = Number(id);
    console.log(videoId);
    const dispatch = useDispatch();
    const video = useSelector((state: RootState) => state.video);
    const sentenceIndex = useSelector((state: RootState) => state.status.readSentenceIndex);
    const videoCurrentTime = useSelector((state: RootState) => state.status.readVideoCurrentTime);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const [script, setScript] = useState<DataScript>();
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refState = useRef({ playSpeed, sentenceIndex });
    const handlerPanelPlay = () => {
        if (refVideo.current) {
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
    const handlerPanelPlayAgain = () => {
        if (refVideo.current) {
            const playSpeed = refState.current.playSpeed;
            const sentenceIndex = refState.current.sentenceIndex;
            const curSentence = script?.sentences[sentenceIndex];
            if (curSentence && curSentence.startTime) {
                refVideo.current.currentTime = curSentence.startTime;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlerPanelPlayBackward = () => {
        if (refVideo.current) {
            const playSpeed = refState.current.playSpeed;
            const sentenceIndex = refState.current.sentenceIndex;
            const prevSentence = script?.sentences[sentenceIndex - 1];
            if (prevSentence && prevSentence.startTime) {
                refVideo.current.currentTime = prevSentence.startTime;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
                dispatch(updateReadSentenceIndex(sentenceIndex - 1));
            }
        }
    };
    const handlerPanelPlayForward = () => {
        if (refVideo.current) {
            const playSpeed = refState.current.playSpeed;
            const sentenceIndex = refState.current.sentenceIndex;
            const nextSentence = script?.sentences[sentenceIndex + 1];
            if (nextSentence && nextSentence.startTime) {
                refVideo.current.currentTime = nextSentence.startTime;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
                dispatch(updateReadSentenceIndex(sentenceIndex + 1));
            }
        }
    };
    const handlerPlaySpeedUp = () => {
        if (refVideo.current) {
            const playSpeed = strip(refState.current.playSpeed + 0.2);
            const playSpeedMax = playSpeed > 2 ? 2 : playSpeed;
            const sentenceIndex = refState.current.sentenceIndex;
            const curSentence = script?.sentences[sentenceIndex + 1];
            if (curSentence && curSentence.startTime) {
                refVideo.current.currentTime = curSentence.startTime;
                refVideo.current.playbackRate = playSpeedMax;
                refVideo.current.play();
                setPlaySpeed(playSpeedMax);
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlerPlaySpeedDown = () => {
        if (refVideo.current) {
            const playSpeed = strip(refState.current.playSpeed - 0.2);
            const playSpeedMin = playSpeed === 0 ? 0.2 : playSpeed;
            const sentenceIndex = refState.current.sentenceIndex;
            const curSentence = script?.sentences[sentenceIndex + 1];
            if (curSentence && curSentence.startTime) {
                refVideo.current.currentTime = curSentence.startTime;
                refVideo.current.playbackRate = playSpeedMin;
                refVideo.current.play();
                setPlaySpeed(playSpeedMin);
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlerPanelActiveClear = () => {
        if (refVideo.current) {
            refVideo.current.currentTime = 0;
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
            dispatch(updateReadSentenceIndex(0));
            dispatch(updateReadVideoCurrentTime(0));
        }
    };
    const handlerVideoEnded = () => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlerVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlerVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlerVideoTimeUpdate = (e: any) => {
        const curSentence = script?.sentences[sentenceIndex];
        if (curSentence) {
            if (e.target.currentTime >= curSentence.endTime) {
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
    const apiGetScript = async () => {
        // const res = await videoList({
        //     page: listParams.page,
        //     pageSize: listParams.pageSize,
        //     keyword: listParams.keyword,
        // });
        // if (res.code === 1) {
        //     setList(res.data.list);
        //     setListParams(res.data.listParams);
        // }
    };
    useEffect(() => {
        const videoElem = refVideo.current;
        const videoKeyboardOnDownHandler = (event: KeyboardEvent) => {
            if (event.code === "Numpad0") {
                event.preventDefault();
                handlerPanelPlayAgain();
            }
            if (event.code === "ArrowLeft") {
                event.preventDefault();
                handlerPanelPlayBackward();
            }
            if (event.code === "ArrowRight") {
                event.preventDefault();
                handlerPanelPlayForward();
            }
            if (event.code === "ControlRight") {
                event.preventDefault();
                handlerPanelPlay();
            }
            if (event.code === "ArrowUp") {
                event.preventDefault();
                handlerPlaySpeedUp();
            }
            if (event.code === "ArrowDown") {
                event.preventDefault();
                handlerPlaySpeedDown();
            }
        };
        // if (curSentence !== undefined && curSentence.startTime) {
        //     if (videoElem) {
        //         videoElem.load();
        //         videoElem.currentTime = fnSRTTimeToFloat(curSentence.startTime);
        //         refScrollbar.current?.scrollTop(matchingSentencePos);
        //     }
        // }
        apiGetScript(); // April 24 6:45
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
    // useEffect(() => {
    //     refState.current = { curSentence, playSpeed };
    // }, [curSentence, playSpeed]);
    return (
        <Layout id="read-index" className="main-inner">
            <div className="main-inner-item-aside">
                <video key={videoId} style={{ width: "100%" }} id="video" onPlay={handlerVideoPlay} onPause={handlerVideoPause} onEnded={handlerVideoEnded} onTimeUpdate={handlerVideoTimeUpdate} ref={refVideo}>
                    <source src={`${Domain}/database/${videoId}/video.mp4`} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<RedoOutlined />} onClick={handlerPanelPlayAgain} className="btn"></Button>
                    <Button icon={<DashboardOutlined />} className="btn">
                        {playSpeed}
                    </Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlerPanelPlayBackward} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlerPanelPlayForward} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlerPanelActiveClear} className="btn"></Button>
                </section>
                <Scrollbars ref={refScrollbar}>{/* <Script scriptParsed={scriptParsed} curSentenceID={curSentence?.id} onRendered={handlersRenderedCallback} /> */}</Scrollbars>
            </div>
        </Layout>
    );
};

export default Index;
