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
    const ws = WaveSurfer.create({
        container: document.body,
        waveColor: "rgb(200, 0, 200)",
        progressColor: "rgb(100, 0, 100)",
        // Pass the video element in the `media` param
        media: document.querySelector("video") as HTMLMediaElement,
    });
    return (
        <>
            <video src="/src/assets/rp.mp4" controls />
        </>
    );
};

export default Video;
