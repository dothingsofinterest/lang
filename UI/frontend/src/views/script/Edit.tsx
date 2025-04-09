import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, Checkbox } from "antd";
import WaveSurfer from "wavesurfer.js";
import { FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { fnFloatToSRTTime } from "../../utils/script";
import Script from "./Script";
import "./Edit.scss";
const Edit = () => {
    console.log("----------Render | Script/Edit----------");
    const localOriginCompress = useSelector((state: RootState) => state.video.localOriginCompress);
    const [current, setCurrent] = useState("00:00:00,000 / 0");
    const [waveScale, setWaveScale] = useState(0);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refSlider = useRef<HTMLInputElement>(null);
    const refWavesurfer = useRef<WaveSurfer | null>(null);
    // Event Handlers
    const handlersVideoPlayBackward = async () => {
        if (refVideo.current && localOriginCompress) {
            const pos = Math.max(0, refVideo.current.currentTime - 0.1);
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (refWavesurfer.current) {
                refWavesurfer.current.seekTo(pos / refWavesurfer.current.getDuration());
            }
            setCurrent(`${SRTTime} / ${pos}`);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handlersVideoPlayForward = async () => {
        if (refVideo.current && localOriginCompress) {
            const pos = refVideo.current.currentTime + 0.1;
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (refWavesurfer.current) {
                refWavesurfer.current.seekTo(pos / refWavesurfer.current.getDuration());
            }
            setCurrent(`${SRTTime} / ${pos}`);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handlersVideoPlay = () => {
        if (refVideo.current && localOriginCompress) {
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
        setWaveScale(e.target.value);
    };
    const handlersVideoCanPlayThrough = () => {
        if (refWavesurfer.current) {
            refWavesurfer.current.load(localOriginCompress);
        }
    };
    const handlersVideoTagOnTimeUpdate = (e: any) => {
        // console.log("video current time:", e.target.currentTime);
        // console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlersVideoTagOnEnded = () => {
        setCurrent("00:00:00,000 / 0");
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTagOnPaused = async (e: any) => {
        const SRTTime = fnFloatToSRTTime(e.target.currentTime);
        await navigator.clipboard.writeText(SRTTime);
        setCurrent(`${SRTTime} / ${e.target.currentTime}`);
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {
        if (event.key === "7") {
        } else if (event.key === "9") {
        } else if (event.key === "8") {
        }
    };
    const handlersEventBeforeunload = (event: BeforeUnloadEvent) => {
        // 自定义提示信息 (大多数现代浏览器会忽略自定义消息，显示默认提示)
        const message = "你有未保存的更改，确定要离开吗？";
        event.preventDefault(); // 阻止默认行为 (重要：在某些浏览器中仍然需要)
        event.returnValue = message; // 设置提示信息
        return message; // 某些浏览器可能使用此返回值
    };
    // Lives Hook
    const livesHookCreateWavesurfer = () => {
        if (refVideo.current && localOriginCompress) {
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
            });
            refWavesurfer.current.on("click", async () => {
                const currentTime = refWavesurfer.current?.getCurrentTime() || 0;
                const SRTTime = fnFloatToSRTTime(currentTime);
                setCurrent(`${SRTTime} / ${currentTime}`);
                await navigator.clipboard.writeText(SRTTime);
            });
            refWavesurfer.current.on("loading", (percent) => {
                // console.log("Loading", percent + "%");
            });
            refWavesurfer.current.on("ready", (duration) => {
                console.log("Ready", duration + "s");
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
            refVideo.current?.load();
        }
    };
    // Lives Hook
    // Template Functions
    useEffect(() => {
        console.log("----------Mounted | Script/Edit----------");
        livesHookCreateWavesurfer();
        window.addEventListener("keydown", handlersEventKeyboardOnDown);
        window.addEventListener("beforeunload", handlersEventBeforeunload);
        // Unmounted
        return () => {
            console.log("----------Unmounted | Script/Edit----------");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
            window.removeEventListener("beforeunload", handlersEventBeforeunload);
        };
    }, []);
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", padding: "0 0 178px", boxSizing: "border-box", margin: "0", backgroundColor: "#000" }}>
                <aside id="asider" style={{ flex: "0 0 800px", height: "100%", backgroundColor: "#202024" }}>
                    <Script />
                </aside>
                <main style={{ flex: 1, height: "100%", display: "flex", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlersVideoTagOnPaused} onEnded={handlersVideoTagOnEnded} onTimeUpdate={handlersVideoTagOnTimeUpdate} onCanPlayThrough={handlersVideoCanPlayThrough} ref={refVideo}>
                        <source src={localOriginCompress} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </main>
                <footer style={{ width: "100%", height: "178px", position: "absolute", bottom: "0", left: "0", backgroundColor: "#2c2c31" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Button icon={<FastBackwardOutlined />} onClick={handlersVideoPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Button icon={playButton} onClick={handlersVideoPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Button icon={<FastForwardOutlined />} onClick={handlersVideoPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Input value={current} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                        <input ref={refSlider} type="range" value={waveScale} onInput={handlersVideoSlide} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                    </div>
                    <div id="waver" style={{ height: "146px" }}></div>
                </footer>
            </Layout>
        </>
    );
};
export default Edit;
