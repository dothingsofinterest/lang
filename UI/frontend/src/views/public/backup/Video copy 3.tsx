import React, { useState, useRef, useEffect } from "react";
import { Layout, List, Input, Space, Button, Upload } from "antd";
import "./Video.scss";
import WaveSurfer from "wavesurfer.js";
import { Scrollbars } from "react-custom-scrollbars-2";
import { DownloadOutlined, UploadOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
interface Subtitle {
    startTime: string;
    endTime: string;
    text: string;
}

const { TextArea } = Input;
const { Sider, Content, Footer } = Layout;
const Video = () => {
    const [subIndex, setSubIndex] = useState(0);
    const [subtitle, setSubtitle] = useState<Subtitle[]>([{ startTime: "00:00:00,000", endTime: "00:00:01,000", text: "" }]);
    const refLis = useRef<(HTMLDivElement | null)[]>([]);
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const [mergeSub, setMergeSub] = useState<Number[]>([]);
    const [current, setCurrent] = useState("00:00:00,000");
    const [videoSRC, setVideoSRC] = useState("");
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const beforeUpload = (file: any) => {
        console.log("file:", file);
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            console.log("reader.onload's e:", e);
            if (e.target?.result) {
                const content = e.target.result as string;
                console.log("content:", content);
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
            }
        };
        return false;
    };
    const beforeUploadVideo = (file: any) => {
        if (/^(.+?)\.mp4$/g.test(file.name)) {
            const videoURL = URL.createObjectURL(file);
            setVideoSRC(videoURL);
            refVideo.current?.load();
            return true;
        } else {
            alert("Please upload mp4 format video.");
        }
    };
    const exportSRT = () => {
        const subtitleStr = subtitle
            .map((subtitle: Subtitle, index: number) => {
                return `${index + 1}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}\n`;
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
    const handleChangeStartTime = (event: any, index: number) => {
        const newSubtitle = subtitle.map((v, k, a) => {
            if (k === index) {
                const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
                const match = event.target.value.match(regex);
                if (!match) {
                    throw new Error(`Invalid time format: ${event.target.value}`);
                }
                return {
                    startTime: event.target.value,
                    endTime: v.endTime,
                    text: v.text,
                };
            } else {
                return v;
            }
        });
        setSubtitle(newSubtitle);
    };
    const handleChangeEndTime = (event: any, index: number) => {
        const newSubtitle = subtitle.map((v, k, a) => {
            if (k === index) {
                const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
                const match = event.target.value.match(regex);
                if (!match) {
                    throw new Error(`Invalid time format: ${event.target.value}`);
                }
                return {
                    startTime: v.startTime,
                    endTime: event.target.value,
                    text: v.text,
                };
            } else {
                return v;
            }
        });
        setSubtitle(newSubtitle);
    };
    const handleChangeText = (event: any, index: number) => {
        const newSubtitle = subtitle.map((v, k, a) => {
            if (k === index) {
                return {
                    startTime: v.startTime,
                    endTime: v.endTime,
                    text: event.target.value,
                };
            } else {
                return v;
            }
        });
        setSubtitle(newSubtitle);
    };
    const handleTimeUpdate = (e: any) => {
        console.log("subIndex: ", subIndex);
        console.log("video current time:", e.target.currentTime);
        console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));

        //wavesurfer?.seekTo(e.target.currentTime / wavesurfer.getDuration());
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

    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const onClickItem = (index: number) => {
        mergeSub.unshift(index);
        if (mergeSub.length > 2) {
            setMergeSub(mergeSub.slice(0, 2));
        }
    };
    const handleMerge = () => {
        const arrNew = subtitle.filter((v, k, a) => {
            if (k !== mergeSub[1]) {
                if (k === mergeSub[0]) {
                    const next: Number = mergeSub[1];
                    return {
                        startTime: v["startTime"],
                        endTime: a[next]["endTime"],
                        text: `${v["text"]} ${v["text"]}`,
                    };
                } else {
                    return v;
                }
            }
        });
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
    const handlePlay = () => {
        if (refVideo.current) {
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
        }
    };
    const handleBackward = () => {
        if (refVideo.current) {
            const pos = Math.max(0, refVideo.current.currentTime - 0.2);
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(fnFloatToSRTTime(pos));
        }
    };
    const handleForward = () => {
        if (refVideo.current) {
            const pos = refVideo.current.currentTime + 0.2;
            refVideo.current.currentTime = pos;
            if (wavesurfer) {
                wavesurfer.seekTo(pos / wavesurfer.getDuration());
            }
            setCurrent(fnFloatToSRTTime(pos));
        }
    };
    const handleEnded = () => {
        setCurrent("00:00:00,000");
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlePause = (e: any) => {
        setCurrent(fnFloatToSRTTime(e.target.currentTime));
    };
    useEffect(() => {
        // 添加键盘事件监听器
        window.addEventListener("keydown", eventKeyDown);

        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", eventKeyDown);
        };
    }, []);
    useEffect(() => {
        const waver = WaveSurfer.create({
            container: "#wave",
            waveColor: "rgb(200, 0, 200)",
            progressColor: "rgb(100, 0, 100)",
            url: "/src/assets/renpi.mp3",
            interact: true, // 禁用与波形的交互，点击时不会跳转
            height: 129,
            cursorColor: "rgb(87, 87, 89)",
        });
        waver.on("click", () => {
            const currentTime = waver.getCurrentTime();
            waver.seekTo(currentTime / waver.getDuration());
            if (refVideo.current) {
                refVideo.current.currentTime = currentTime;
                setCurrent(fnFloatToSRTTime(currentTime));
            }
        });
        setWavesurfer(waver);
    }, []);
    return (
        <>
            <Layout style={{ minWidth: "1200px", height: "calc(100% - 178px)", backgroundColor: "#000" }}>
                <Content style={{ background: "green", marginLeft: "600px", display: "flex", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlePause} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} ref={refVideo}>
                        <source src={videoSRC} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </Content>
            </Layout>
            <aside id="asider" style={{ width: "600px", position: "fixed", left: "0", top: "0", height: "calc(100% - 178px)", backgroundColor: "#202024" }}>
                <Scrollbars ref={refScrollbar} style={{ width: "600px", height: "100%" }}>
                    <List
                        dataSource={subtitle}
                        renderItem={(item, index) => (
                            <List.Item key={`${item.startTime}_${item.endTime}_${item.text}`} ref={(el) => (refLis.current[index] = el)} style={{ alignItems: "flex-start" }} onClick={() => onClickItem(index)}>
                                <Space size="small" style={{ flex: "0 0 94px" }} direction="vertical">
                                    <Input defaultValue={item.startTime} size="small" style={{ borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onChange={(e) => handleChangeStartTime(e, index)} />
                                    <Input defaultValue={item.endTime} size="small" style={{ borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onChange={(e) => handleChangeEndTime(e, index)} />
                                </Space>
                                <TextArea style={{ flex: 1, minHeight: "55px", marginLeft: "8px", borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} value={item.text} onChange={(e) => handleChangeText(e, index)} autoSize />
                            </List.Item>
                        )}
                    />
                </Scrollbars>
            </aside>
            <footer style={{ width: "100%", position: "fixed", bottom: "0", left: "0px", zIndex: "999", backgroundColor: "#2c2c31" }}>
                <Space size="small" style={{ width: "100%", padding: "8px" }}>
                    <Upload beforeUpload={beforeUpload} showUploadList={false}>
                        <Button icon={<UploadOutlined />}>Import</Button>
                    </Upload>
                    <Button icon={<FastBackwardOutlined />} onClick={handleBackward}></Button>
                    <Button icon={playButton} onClick={handlePlay}></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handleForward}></Button>
                    <Input value={current} />
                    <Button icon={<DownloadOutlined />} onClick={exportSRT}>
                        Export
                    </Button>
                    <Upload beforeUpload={beforeUploadVideo} showUploadList={false}>
                        <Button icon={<UploadOutlined />}>Import</Button>
                    </Upload>
                </Space>
                <div id="wave" style={{ borderTop: "1px solid #575759" }}></div>
            </footer>
        </>
    );
};

export default Video;
