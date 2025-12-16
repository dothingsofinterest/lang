import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, RedoOutlined } from "@ant-design/icons";
import { updateProcessings, updateScriptCurrentTime, updateScriptWaveformZoom } from "../../stores/reducers/plan";
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
    const currentTime = useSelector((state: RootState) => state.plan.scriptCurrentTime);
    const waveformZoom = useSelector((state: RootState) => state.plan.scriptWaveformZoom);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [videoCanPlay, setVideoCanPlay] = useState(false);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refSlider = useRef<HTMLInputElement>(null);
    const refWavesurfer = useRef<WaveSurfer | null>(null);
    const refPlan = useRef({ plan });
    const handlersVideoPlayBackward = async () => {
        if (refVideo.current && plan.videoURL) {
            const floatTime = Math.max(0, refVideo.current.currentTime - 0.1);
            const SRTTime = fnFloatToSRTTime(floatTime);
            refVideo.current.currentTime = floatTime;
            refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
            dispatch(updateScriptCurrentTime(floatTime));
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handlersVideoPlayForward = async () => {
        if (refVideo.current && plan.videoURL) {
            const floatTime = refVideo.current.currentTime + 0.1;
            const SRTTime = fnFloatToSRTTime(floatTime);
            refVideo.current.currentTime = floatTime;
            refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
            dispatch(updateScriptCurrentTime(floatTime));
            await navigator.clipboard.writeText(SRTTime);
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
    const handlersVideoSlide = (e: any) => {
        dispatch(updateScriptWaveformZoom(e.target?.valueAsNumber));
    };
    const handlersVideoCanPlayThrough = () => {
        setVideoCanPlay(true);
    };
    const handlersVideoTagOnTimeUpdate = (e: any) => {
        // console.log("video current time:", e.target.currentTime);
        // console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlersVideoTagOnEnded = () => {
        dispatch(updateScriptCurrentTime(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTagOnPaused = async (e: any) => {
        const SRTTime = fnFloatToSRTTime(e.target.currentTime);
        dispatch(updateScriptCurrentTime(e.target.currentTime));
        await navigator.clipboard.writeText(SRTTime);
    };
    const handlersCreateWaver = async () => {
        if (videoCanPlay === true) {
            if (!refWavesurfer.current) {
                dispatch(updateProcessings({ buttonID: 4, buttonStatus: true }));
                const res = await fetch(`${Domain}/data/${plan.videoHash}/${plan.videoAudioWaveformURL}?${Date.now()}`);
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
                        const SRTTime = fnFloatToSRTTime(currentTime);
                        dispatch(updateScriptCurrentTime(currentTime));
                        await navigator.clipboard.writeText(SRTTime);
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
        if (!plan.videoHash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/video/settings");
        }
        return () => {
            if (refWavesurfer.current) {
                refWavesurfer.current.destroy();
                refWavesurfer.current = null;
            }
        };
    }, []);
    useEffect(() => {
        refPlan.current = { plan };
    }, [plan]);
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
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                    <Button icon={<RedoOutlined />} onClick={handlersCreateWaver} loading={processings[4]} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    <Button icon={<FastBackwardOutlined />} onClick={handlersVideoPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    <Button icon={playButton} onClick={handlersVideoPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    <Button icon={<FastForwardOutlined />} onClick={handlersVideoPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    <Input value={fnFloatToSRTTime(currentTime)} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    <input ref={refSlider} type="range" value={waveformZoom} onInput={handlersVideoSlide} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                </div>
                <div id="waver" style={{ height: "146px" }}></div>
            </div>
        </Layout>
    );
};
export default Index;
