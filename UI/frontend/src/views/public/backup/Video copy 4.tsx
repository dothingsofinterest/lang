import React, { useState, useRef, useEffect } from "react";
import { Layout, List, Input, Space, Button, Upload, Checkbox, Divider } from "antd";
import "./Video.scss";
import WaveSurfer from "wavesurfer.js";
import { Scrollbars } from "react-custom-scrollbars-2";
import { MinusCircleOutlined, PlusCircleOutlined, DownloadOutlined, UploadOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
interface Subtitle {
    startTime: string;
    endTime: string;
    text: string;
}
const { TextArea } = Input;
const { Sider, Content, Footer } = Layout;
const Video = () => {
    const [subIndex, setSubIndex] = useState(0);
    const [subtitle, setSubtitle] = useState<Subtitle[]>([{ startTime: "", endTime: "", text: "" }]);
    const refLis = useRef<(HTMLDivElement | null)[]>([]);
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const [current, setCurrent] = useState("00:00:00,000");
    const [waveScale, setWaveScale] = useState(0);
    const [videoSRC, setVideoSRC] = useState("");
    const [audioSRC, setAudioSRC] = useState("");
    const [audioMuted, setAudioMuted] = useState(true);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const uploadSRT = (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            if (e.target?.result) {
                const content = e.target.result as string;
                const subtitleArray: Subtitle[] = [];
                const subtitleBlocks = content.split("\n\n");
                subtitleBlocks.forEach((block) => {
                    const lines = block.split("\n");
                    if (lines.length >= 3) {
                        const timeLine = lines[1];
                        const [startTime, endTime] = timeLine.split(" --> ");
                        const text = lines.slice(2).join(" "); // 多行字幕文本合并
                        subtitleArray.push({ startTime, endTime, text });
                    }
                });
                console.log("subtitleArray:", subtitleArray);
                setSubtitle(subtitleArray);
                setSubIndex(subtitleArray.length - 1);
            }
        };
        return false;
    };
    const exportSRT = () => {
        const subtitleStr = subtitle
            .map((subtitle: Subtitle, index: number, subtitles) => {
                if (subtitle.startTime && subtitle.endTime && subtitle.text) {
                    if (subtitles[index - 1] !== undefined) {
                        if (fnSRTTimeToFloat(subtitle.startTime) < fnSRTTimeToFloat(subtitles[index - 1].endTime)) {
                            throw new Error(`Subtitle - ${index} or ${index - 1} time error.`);
                        }
                    }
                    return `${index + 1}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}\n`;
                }
            })
            .join("\n");
        const blob = new Blob([subtitleStr], { type: "text/srt" });
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "a.srt";
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(a.href);
        window.document.body.removeChild(a);
    };
    const beforeUploadVideo = (file: any) => {
        if (/^(.+?)\.mp4$/g.test(file.name)) {
            const videoURL = URL.createObjectURL(file);
            setVideoSRC(videoURL);
            refVideo.current?.load();
        } else {
            alert("Please upload mp4 format video.");
        }
    };
    const beforeUploadAudio = (file: any) => {
        if (/^(.+?)\.mp3$/g.test(file.name)) {
            const audioURL = URL.createObjectURL(file);
            setAudioSRC(audioURL);
            const waver = WaveSurfer.create({
                container: "#waver",
                waveColor: "rgb(200, 0, 200)",
                progressColor: "rgb(100, 0, 100)",
                url: audioURL,
                interact: true, // 禁用与波形的交互，点击时不会跳转
                height: 129,
                cursorColor: "rgb(87, 87, 89)",
                autoScroll: true,
            });
            waver.on("click", async () => {
                const currentTime = waver.getCurrentTime();
                const SRTTime = fnFloatToSRTTime(currentTime);
                waver.seekTo(currentTime / waver.getDuration());
                await navigator.clipboard.writeText(SRTTime);
                if (refVideo.current) {
                    refVideo.current.currentTime = currentTime;
                    setCurrent(SRTTime);
                }
            });
            waver.setMuted(true);
            waver.on("loading", (percent) => {
                console.log("Loading", percent + "%");
            });
            waver.on("ready", (duration) => {
                console.log("Ready", duration + "s");
            });
            waver.once("decode", () => {
                const slider = document.querySelector('input[type="range"]');
                if (slider) {
                    slider.addEventListener("input", (e: any) => {
                        console.log("slider input e.target", e.target);
                        const minPxPerSec = e.target?.valueAsNumber;
                        waver.zoom(minPxPerSec);
                    });
                }
            });
            setWavesurfer(waver);
        } else {
            alert("Please upload mp3 format audio.");
        }
    };
    const handleBlurStartTime = (event: any, index: number) => {
        const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
        const match = event.target.value.match(regex);
        if (!match) {
            throw new Error(`Invalid time format: ${event.target.value}`);
        }
        if (subtitle[index - 1] !== undefined) {
            if (fnSRTTimeToFloat(event.target.value) < fnSRTTimeToFloat(subtitle[index - 1].endTime)) {
                throw new Error(`Subtitle time error.`);
            }
        }
        const newSubtitle = [...subtitle];
        newSubtitle[index] = { ...newSubtitle[index], startTime: event.target.value };
        setSubtitle(newSubtitle);
    };
    const handleBlurEndTime = (event: any, index: number) => {
        const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
        const match = event.target.value.match(regex);
        if (!match) {
            throw new Error(`Invalid time format: ${event.target.value}`);
        }
        if (subtitle[index] !== undefined) {
            if (fnSRTTimeToFloat(event.target.value) <= fnSRTTimeToFloat(subtitle[index].startTime)) {
                throw new Error(`Subtitle time error.`);
            }
        }
        const newSubtitle = [...subtitle];
        newSubtitle[index] = { ...newSubtitle[index], endTime: event.target.value };
        setSubtitle(newSubtitle);
    };
    const handleBlurText = (event: any, index: number) => {
        const newSubtitle = [...subtitle];
        newSubtitle[index] = { ...newSubtitle[index], text: event.target.value };
        setSubtitle(newSubtitle);
    };
    const handleTimeUpdate = (e: any) => {
        console.log("subIndex: ", subIndex);
        console.log("video current time:", e.target.currentTime);
        console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlePlay = () => {
        if (refVideo.current && videoSRC && audioSRC) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current.play();
                if (wavesurfer) {
                    wavesurfer.play();
                }
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
                if (wavesurfer) {
                    wavesurfer.pause();
                }
            }
        } else {
            alert("Please upload video and audio.");
        }
    };
    const handleBackward = async () => {
        if (refVideo.current && videoSRC && audioSRC) {
            const pos = Math.max(0, refVideo.current.currentTime - 0.2);
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(SRTTime);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handleForward = async () => {
        if (refVideo.current && videoSRC && audioSRC) {
            const pos = refVideo.current.currentTime + 0.2;
            const SRTTime = fnFloatToSRTTime(pos);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(SRTTime);
            await navigator.clipboard.writeText(SRTTime);
        }
    };
    const handleEnded = () => {
        setCurrent("00:00:00,000");
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlePause = async (e: any) => {
        const SRTTime = fnFloatToSRTTime(e.target.currentTime);
        await navigator.clipboard.writeText(SRTTime);
        setCurrent(SRTTime);

        console.log("refLis", refLis);
        const index = 2;
        setSubIndex(index);
        scrollTo(index);
    };
    const scrollTo = (index: number) => {
        const indexMinus = index - 1;
        if (refScrollbar.current && refLis.current && refLis.current[indexMinus]) {
            const targetOffset = refLis.current[indexMinus].offsetTop;
            refScrollbar.current.scrollTop(targetOffset);
        }
    };
    const fnFloatToSRTTime = (floatSeconds: number): string => {
        // 计算小时、分钟、秒数和毫秒
        const hours = Math.floor(floatSeconds / 3600);
        const minutes = Math.floor((floatSeconds % 3600) / 60);
        const seconds = Math.floor(floatSeconds % 60);
        const milliseconds = Math.round((floatSeconds % 1) * 1000);

        // 格式化成 SRT 时间格式 (hh:mm:ss,SSS)
        const timeString = `${fnPadZero(hours)}:${fnPadZero(minutes)}:${fnPadZero(seconds)},${fnPadZero(milliseconds, 3)}`;
        return timeString;
    };
    function fnSRTTimeToFloat(srtTime: string) {
        // Split the SRT time into hours, minutes, seconds, and milliseconds
        const timeParts = srtTime.split(/[:,]/); // Split by ":" and ","

        // Parse the parts
        const hours = parseInt(timeParts[0], 10); // HH
        const minutes = parseInt(timeParts[1], 10); // MM
        const seconds = parseInt(timeParts[2], 10); // SS
        const milliseconds = parseInt(timeParts[3], 10); // SSS

        // Convert to seconds
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const eventKeyDown = (event: KeyboardEvent) => {
        console.log("event.key", event.key);
        if (event.key === "7") {
            if (refVideo.current) {
                refVideo.current.currentTime = Math.max(0, refVideo.current.currentTime - 0.5);
            }
        } else if (event.key === "9") {
            if (refVideo.current) {
                refVideo.current.currentTime = refVideo.current.currentTime + 0.5;
            }
        } else if (event.key === "8") {
            // 如果当前是空格键，切换视频的播放和暂停
            if (refVideo.current) {
                if (refVideo.current.paused) {
                    refVideo.current.play();
                } else {
                    refVideo.current.pause();
                }
            }
        }
    };
    const onInputSlider = (e: any) => {
        setWaveScale(e.target.value);
    };
    const onMute = (e: any) => {
        console.log("sub", subtitle);
        setAudioMuted(e.target.checked);
        wavesurfer?.setMuted(e.target.checked);
    };
    const subtitleCreate = () => {
        const a = subtitle.slice(0, subIndex);
        const b = subtitle.slice(subIndex);
        const ba = b.slice(0, 1);
        const bb = b.slice(1);
        ba.push({ startTime: "", endTime: "", text: "" });
        const r = [...a, ...[...ba, ...bb]];
        setSubtitle(r);
    };
    const subtitleDelete = () => {
        const a = subtitle.slice(0, subIndex);
        const b = subtitle.slice(subIndex);
        b.shift();
        const r = [...a, ...b];
        setSubtitle(r);
    };
    const onFocusSub = (index: number) => {
        console.log("index", index);
        setSubIndex(index);
    };
    useEffect(() => {
        // 添加键盘事件监听器
        window.addEventListener("keydown", eventKeyDown);
        window.addEventListener("beforeunload", (event) => {
            // 自定义提示信息 (大多数现代浏览器会忽略自定义消息，显示默认提示)
            const message = "你有未保存的更改，确定要离开吗？";
            event.preventDefault(); // 阻止默认行为 (重要：在某些浏览器中仍然需要)
            event.returnValue = message; // 设置提示信息
            return message; // 某些浏览器可能使用此返回值
        });
        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", eventKeyDown);
        };
    }, []);
    useEffect(() => {
        // if (refScrollbar.current) {
        //     refScrollbar.current.scrollToBottom();
        // }
        scrollTo(subIndex);
    }, [subtitle.length]);
    return (
        <>
            <Layout style={{ minWidth: "1200px", height: "calc(100% - 188px)", backgroundColor: "#000" }}>
                <Content style={{ background: "green", marginLeft: "600px", display: "flex", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlePause} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} ref={refVideo}>
                        <source src={videoSRC} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </Content>
            </Layout>
            <aside id="asider" style={{ width: "600px", position: "fixed", left: "0", top: "0", height: "calc(100% - 188px)", backgroundColor: "#202024" }}>
                <Scrollbars ref={refScrollbar} style={{ width: "600px", height: "100%" }}>
                    <List
                        dataSource={subtitle}
                        renderItem={(item, index) => (
                            <List.Item key={`${item.startTime}_${item.endTime}_${item.text}`} ref={(el) => (refLis.current[index] = el)} style={{ alignItems: "normal" }} onClick={() => onFocusSub(index)} className={index === subIndex ? "current" : ""}>
                                <Space size="small" style={{ flex: "0 0 94px", justifyContent: "space-between" }} direction="vertical">
                                    <Input defaultValue={item.startTime} size="small" style={{ borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onBlur={(e) => handleBlurStartTime(e, index)} />
                                    <Input defaultValue={item.endTime} size="small" style={{ borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onBlur={(e) => handleBlurEndTime(e, index)} />
                                </Space>
                                <TextArea defaultValue={item.text} style={{ flex: 1, minHeight: "55px", marginLeft: "8px", borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onBlur={(e) => handleBlurText(e, index)} autoSize />
                            </List.Item>
                        )}
                    />
                </Scrollbars>
            </aside>
            <footer style={{ width: "100%", position: "fixed", bottom: "0", left: "0px", zIndex: "999", backgroundColor: "#2c2c31" }}>
                <Space size="small" style={{ width: "100%", padding: "8px", borderBottom: "1px solid #575759" }}>
                    <Upload beforeUpload={beforeUploadVideo} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="small">
                            Video
                        </Button>
                    </Upload>
                    <Upload beforeUpload={beforeUploadAudio} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="small">
                            Audio
                        </Button>
                    </Upload>
                    <Button icon={<FastBackwardOutlined />} onClick={handleBackward} size="small"></Button>
                    <Button icon={playButton} onClick={handlePlay} size="small"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handleForward} size="small"></Button>
                    <Input value={current} size="small" />
                    <Checkbox onChange={onMute} checked={audioMuted}>
                        Mute
                    </Checkbox>
                    <input type="range" value={waveScale} onInput={onInputSlider} />
                    <Divider type="vertical" style={{ borderInlineStart: "1px solid #fff" }} />
                    <Upload beforeUpload={uploadSRT} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="small">
                            Import
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={exportSRT} size="small">
                        Export
                    </Button>
                    <Button icon={<PlusCircleOutlined />} onClick={subtitleCreate} size="small" />
                    <Button icon={<MinusCircleOutlined />} onClick={subtitleDelete} size="small" />
                </Space>
                <div id="waver" style={{ height: "146px" }}></div>
            </footer>
        </>
    );
};

export default Video;
