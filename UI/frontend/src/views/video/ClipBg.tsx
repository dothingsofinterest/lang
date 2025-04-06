import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { LinkOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateProcessings } from "../../stores/reducers/project";
import { updateLocalOriginBgAss } from "../../stores/reducers/video";
import { videoGenerateSubtitleClip } from "../../api/requestFile";

const ClipBg = () => {
    console.log("----------Render | Video/ClipBg----------");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const projectName = useSelector((state: RootState) => state.project.name);
    const processings = useSelector((state: RootState) => state.project.processings);
    const localOriginBgAss = useSelector((state: RootState) => state.video.localOriginBgAss);
    // Event Handlers
    const handlersGenerateSubtitleVideo = async () => {
        if (projectName && script.name) {
            dispatch(updateProcessings({ buttonID: 1, buttonStatus: true }));
            const resBlob = await videoGenerateSubtitleClip({ project: projectName });
            const blob = new Blob([resBlob], { type: "video/mp4" });
            dispatch(updateLocalOriginBgAss(URL.createObjectURL(blob)));
            dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
        }
    };
    // Event Handlers
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ width: "100%", height: "100%", padding: "32px 0 0", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", left: "100px", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Button icon={<CloudUploadOutlined />} onClick={handlersGenerateSubtitleVideo} loading={processings[1]} disabled={processings[1]} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>{localOriginBgAss ? <Button icon={<LinkOutlined />} style={{ width: "100%", height: "50px", backgroundColor: "#5cb85c", color: "#fff", borderRadius: 0 }} href={localOriginBgAss} target="_blank" iconPosition="end" /> : ""}</div>
                    </section>
                </aside>
            </Layout>
        </>
    );
};

export default ClipBg;
