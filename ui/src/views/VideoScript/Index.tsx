import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, RedoOutlined, CopyOutlined, CopyFilled } from "@ant-design/icons";
import { updateProcessings, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom } from "../../stores/reducers/plan";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { fnFloatToSRTTime } from "../../utils/script";
import { Domain } from "../../settings.js";
import Data from "./Data";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const processings = useSelector((state: RootState) => state.plan.processings);
    const currentTime = useSelector((state: RootState) => state.plan.videoScriptCurrentTime);
    const waveformZoom = useSelector((state: RootState) => state.plan.videoScriptWaveformZoom);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [videoCanPlay, setVideoCanPlay] = useState(false);
    const [timeCopyFormat, setTimeCopyFormat] = useState(true); // true: SRT, false: float
    const refVideo = useRef<HTMLVideoElement>(null);
    const refSlider = useRef<HTMLInputElement>(null);
    const refWavesurfer = useRef<WaveSurfer | null>(null);
    const refState = useRef({ timeCopyFormat });
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersVideoPlayBackward = async () => {
        if (refVideo.current && plan.videoURL) {
            const floatTime = Math.max(0, refVideo.current.currentTime - 0.1);
            const time = timeCopyFormat ? fnFloatToSRTTime(currentTime) : currentTime;
            refVideo.current.currentTime = floatTime;
            refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
            dispatch(updateVideoScriptCurrentTime(floatTime));
            await navigator.clipboard.writeText(`${time}`);
        }
    };
    const handlersVideoPlayForward = async () => {
        if (refVideo.current && plan.videoURL) {
            const floatTime = refVideo.current.currentTime + 0.1;
            const time = timeCopyFormat ? fnFloatToSRTTime(currentTime) : currentTime;
            refVideo.current.currentTime = floatTime;
            refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
            dispatch(updateVideoScriptCurrentTime(floatTime));
            await navigator.clipboard.writeText(`${time}`);
        }
    };
    const handlersVideoPlay = () => {
        if (refVideo.current && plan.videoURL) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current
                    .play()
                    .then()
                    .catch((err) => {
                        console.error("播放失败:", err);
                    });
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
                if (refWavesurfer.current) {
                    refWavesurfer.current.pause();
                }
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersTimeFormatSwitch = (checked: boolean) => {
        setTimeCopyFormat(checked);
    };
    const handlersVideoSlide = (e: any) => {
        dispatch(updateVideoScriptWaveformZoom(e.target?.valueAsNumber));
    };
    const handlersVideoCanPlayThrough = () => {
        setVideoCanPlay(true);
    };
    const handlersVideoTagOnTimeUpdate = (e: any) => {
        // console.log("video current time:", e.target.currentTime);
        // console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlersVideoTagOnEnded = () => {
        dispatch(updateVideoScriptCurrentTime(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTagOnPaused = async (e: any) => {
        const time = refState.current.timeCopyFormat ? fnFloatToSRTTime(e.target.currentTime) : e.target.currentTime;
        dispatch(updateVideoScriptCurrentTime(e.target.currentTime));
        await navigator.clipboard.writeText(time);
    };
    const handlersCreateWaver = async () => {
        if (videoCanPlay === true) {
            if (!refWavesurfer.current) {
                dispatch(updateProcessings({ buttonID: 4, buttonStatus: true }));
                const res = await fetch(`${Domain}/data/${plan.hash}/${plan.videoAudioWaveformURL}?${Date.now()}`);
                const jsonData = await res.json();
                if (jsonData.data.length > 0) {
                    refWavesurfer.current = WaveSurfer.create({
                        container: "#waver",
                        media: refVideo.current || undefined,
                        waveColor: "rgb(200, 0, 200)",
                        progressColor: "rgb(100, 0, 100)",
                        interact: true,
                        height: 129,
                        cursorColor: "rgb(87, 87, 89)",
                        autoScroll: true,
                        dragToSeek: true,
                        normalize: true, // 把整段音频的最大振幅“压”到满值，细微部分相对更明显
                        peaks: jsonData.data,
                        minPxPerSec: 10,
                    });
                    refWavesurfer.current.on("click", async () => {
                        const currentTime = refWavesurfer.current?.getCurrentTime() || 0;
                        const time = refState.current.timeCopyFormat ? fnFloatToSRTTime(currentTime) : currentTime;
                        dispatch(updateVideoScriptCurrentTime(currentTime));
                        await navigator.clipboard.writeText(`${time}`);
                    });
                    refWavesurfer.current.on("loading", (percent) => {
                        // console.log("Loading", percent + "%");
                    });
                    refWavesurfer.current.once("ready", (duration) => {
                        console.log("Ready", duration + "s");
                        refWavesurfer.current?.seekTo(currentTime / refWavesurfer.current.getDuration());
                        refWavesurfer.current?.zoom(waveformZoom);
                        dispatch(updateProcessings({ buttonID: 4, buttonStatus: false }));
                    });
                    refWavesurfer.current.once("decode", () => {
                        refSlider.current?.addEventListener("input", (e: any) => {
                            if (refWavesurfer.current?.getDecodedData()) {
                                refWavesurfer.current?.zoom(e.target?.valueAsNumber);
                            } else {
                                console.log("Audio is loading...");
                            }
                        });
                    });
                }
            }
        }
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/common/settings");
        }
        if (plan.type !== 0 && plan.type !== 1) {
            alert("This is not a video plan.");
            navigate("/common/settings");
        }
        return () => {
            if (refWavesurfer.current) {
                refWavesurfer.current.destroy();
                refWavesurfer.current = null;
            }
        };
    }, []);
    useEffect(() => {
        refState.current = { ...refState.current, timeCopyFormat };
    }, [timeCopyFormat]);
    return (
        <Layout id="script-index" className="main-inner" style={{ position: "relative", padding: "0 0 178px", margin: "0" }}>
            <div className="main-inner-item-aside" style={{ display: "flex", justifyContent: "flex-start" }}>
                <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlersVideoTagOnPaused} onEnded={handlersVideoTagOnEnded} onTimeUpdate={handlersVideoTagOnTimeUpdate} onCanPlayThrough={handlersVideoCanPlayThrough} ref={refVideo}>
                    <source src={plan.videoURL} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main">
                <Data />
            </div>
            <div className="main-inner-item-footer" style={{ height: "178px", position: "absolute", bottom: "0", left: "0" }}>
                <div className="panel">
                    <Button className="item" icon={<RedoOutlined />} onClick={handlersCreateWaver} loading={processings[4]} />
                    <Button className="item" icon={<FastBackwardOutlined />} onClick={handlersVideoPlayBackward} />
                    <Button className="item" icon={playButton} onClick={handlersVideoPlay} />
                    <Button className="item" icon={<FastForwardOutlined />} onClick={handlersVideoPlayForward} />
                    <div className="item">
                        <Input className="item" value={timeCopyFormat ? fnFloatToSRTTime(currentTime) : currentTime} />
                        <Switch defaultChecked onChange={handlersTimeFormatSwitch} size="small" />
                    </div>
                    <input className="item" ref={refSlider} type="range" value={waveformZoom} onInput={handlersVideoSlide} />
                    <section style={{ display: "none" }}>
                        <audio ref={refAudio}></audio>
                    </section>
                </div>
                <div id="waver" style={{ height: "146px" }}></div>
            </div>
        </Layout>
    );
};
export default Index;
