import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, InputNumber } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, RedoOutlined, UploadOutlined, PictureOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import "./ClipTitle.scss";
import html2canvas from "html2canvas";
const ClipTitle = () => {
    const script = useSelector((state: RootState) => state.script.data);
    const clipRef = useRef<HTMLDivElement>(null);
    // Event Handlers
    const handlersRender = () => {
        if (clipRef.current) {
            html2canvas(clipRef.current, {
                width: 1080,
                height: 1920,
                scale: 1,
            }).then((canvas) => {
                console.log("canvas", canvas);
                if (clipRef.current) {
                    clipRef.current.innerHTML = "";
                    clipRef.current.appendChild(canvas);
                }
            });
        }
    };
    // Event Handlers
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ width: "100%", height: "100%", padding: "32px 0 0", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Button icon={<PictureOutlined />} onClick={handlersRender} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <article id="clip" ref={clipRef}>
                        <div id="title">
                            <p className="en">{script.name.split("/")[0]}</p>
                            <p className="cn">{script.name.split("/")[1]}</p>
                        </div>
                        <div className="line"></div>
                    </article>
                </aside>
            </Layout>
        </>
    );
};

export default ClipTitle;
