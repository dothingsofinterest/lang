import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, List, Input, Space, Button, Upload, Checkbox } from "antd";
import "./Video.scss";
import { Scrollbars } from "react-custom-scrollbars-2";
import type { UploadProps } from "antd";
interface Subtitle {
    startTime: string;
    endTime: string;
    text: string;
}
const { TextArea } = Input;
const { Sider, Content } = Layout;
const Video = () => {
    const [subIndex, setSubIndex] = useState(0);
    const [title, setTitle] = useState("Elon Musk's little son.");
    const [subtitle, setSubtitle] = useState<Subtitle[]>([{ startTime: "00:00:00,000", endTime: "00:00:01,000", text: "" }]);
    const refLis = useRef<(HTMLDivElement | null)[]>([]);
    const refScrollbar = useRef<Scrollbars>(null);
    const [subtitleInput, setSubtitleInput] = useState("");
    const refVideo = useRef<HTMLVideoElement>(null);
    const [mergeSub, setMergeSub] = useState<Number[]>([]);
    const props: UploadProps = {
        beforeUpload: (file) => {
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
        },
    };
    const fnConvertSrtTimeToSeconds = (timeString: string) => {
        const regex = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
        const match = timeString.match(regex);
        if (!match) {
            throw new Error(`Invalid time format: ${timeString}`);
        }
        const [, hours, minutes, seconds, milliseconds] = match;
        return parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10) + parseInt(milliseconds, 10) / 1000;
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
    const importSRT = () => {};
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
    };
    const handleTimeUpdateForWriting = (e: any) => {
        console.log("subIndex: ", subIndex);
        console.log("video current time:", e.target.currentTime);
        console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
        if (subtitle[subIndex] !== undefined) {
            const endTime = fnConvertSrtTimeToSeconds(subtitle[subIndex].endTime);
            if (e.target.currentTime >= endTime) {
                refVideo.current?.pause();
                if (subtitle[subIndex + 1] !== undefined) {
                    const nextStartTime = fnConvertSrtTimeToSeconds(subtitle[subIndex + 1].startTime);
                    if (e.target.currentTime >= nextStartTime) {
                        e.target.currentTime = fnConvertSrtTimeToSeconds(subtitle[subIndex].startTime);
                    }
                }
            }
        }
    };
    const handleEnded = () => {};
    const handlePause = () => {};
    const handleInputSubtitle = (e: any) => {
        console.log("merge", mergeSub);
        console.log("subIndex", subIndex);
        console.log("refli", refLis.current);
        console.log(refLis.current[subIndex]);
        setSubtitleInput(e.target.value);
        if (subtitle[subIndex].text === e.target.value) {
            setSubtitleInput("");
            if (subIndex + 1 === subtitle.length) {
                setSubIndex(0);
                refVideo.current?.play();
                if (refScrollbar.current) {
                    refScrollbar.current.scrollTop(0);
                }
            } else {
                setSubIndex(subIndex + 1);
                refVideo.current?.play();
                if (subIndex >= 1) {
                    if (refScrollbar.current && refLis.current[subIndex]) {
                        const currentScrollTop = refScrollbar.current.getScrollTop();
                        const { width, height } = refLis.current[subIndex].getBoundingClientRect();
                        refScrollbar.current.scrollTop(currentScrollTop + height);
                    }
                }
            }
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

    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const onDoubleClickItem = (index: number) => {
        if (mergeSub.length === 1) {
            mergeSub[1] = index;
            setMergeSub(mergeSub);
        } else {
            mergeSub[0] = index;
            setMergeSub(mergeSub);
        }
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
    useEffect(() => {
        // 添加键盘事件监听器
        window.addEventListener("keydown", eventKeyDown);

        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", eventKeyDown);
        };
    }, []);
    return (
        <Layout style={{ minWidth: "1200px", height: "100%" }}>
            <Sider width={600} style={{ flex: "0 0 600px", position: "fixed", width: "600px", height: "100%", backgroundColor: "#202024" }}>
                <Scrollbars ref={refScrollbar} style={{ width: "600px", height: "100%" }}>
                    <List
                        header={
                            <div style={{ color: "#fff", height: "26px", overflow: "hidden", lineHeight: "26px", fontWeight: "bold", fontSize: "16px" }}>
                                {title}
                                <Button color="default" variant="solid" onClick={exportSRT}>
                                    Download
                                </Button>
                                <Upload {...props}>
                                    <Button>Import</Button>
                                </Upload>
                            </div>
                        }
                        footer={<TextArea style={{ borderRadius: "0", margin: "10px", resize: "none", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} value={subtitleInput} onChange={(e) => handleInputSubtitle(e)} rows={2} />}
                        dataSource={subtitle}
                        renderItem={(item, index) => (
                            <List.Item key={`${item.startTime}_${item.endTime}_${item.text}`} ref={(el) => (refLis.current[index] = el)} style={{ alignItems: "flex-start" }} className={index === subIndex ? "current" : ""} onDoubleClick={() => onDoubleClickItem(index)}>
                                <Space size="small" style={{ flex: "0 0 94px" }} direction="vertical">
                                    <Input defaultValue={item.startTime} size="small" style={{ borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onChange={(e) => handleChangeStartTime(e, index)} />
                                    <Input defaultValue={item.endTime} size="small" style={{ borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} onChange={(e) => handleChangeEndTime(e, index)} />
                                </Space>
                                <TextArea style={{ flex: 1, minHeight: "55px", marginLeft: "8px", borderRadius: "0", backgroundColor: "transparent", color: "hsla(0,0%,100%,.6)" }} value={item.text} onChange={(e) => handleChangeText(e, index)} autoSize />
                            </List.Item>
                        )}
                    />
                </Scrollbars>
            </Sider>
            <Content style={{ background: "#ccc", marginLeft: "600px" }}>
                <Space size="small" direction="vertical" style={{ width: "100%", height: "100%", alignItems: "stretch", justifyContent: "space-between" }}>
                    <video style={{ maxWidth: "600px", maxHeight: "400px", textAlign: "center" }} id="video" controls onPause={handlePause} onEnded={handleEnded} onTimeUpdate={handleTimeUpdate} ref={refVideo}>
                        <source src="/src/assets/Elon.mp4" type="video/mp4" /> Your browser does not support video tag.
                    </video>
                    <div>{subtitle[0]["text"]}</div>
                </Space>
            </Content>
        </Layout>
    );
};

export default Video;
