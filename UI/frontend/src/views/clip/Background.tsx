import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, InputNumber } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, RedoOutlined, UploadOutlined, PictureOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import "./Background.scss";
import html2canvas from "html2canvas";
const Background = () => {
    const [title, setTitle] = useState("");
    const clipRef = useRef<HTMLDivElement>(null);
    // Event Handlers
    const handlersRender = () => {
        if (clipRef.current) {
            html2canvas(clipRef.current, {
                width: 2160,
                height: 3840,
                scale: 1,
            }).then((canvas) => {
                if (clipRef.current) {
                    clipRef.current.innerHTML = "";
                    clipRef.current.appendChild(canvas);
                }
            });
        }
    };
    const handlersUpdateTitle = (value: string) => {
        if (value !== null) {
            setTitle(value);
        }
    };
    // Event Handlers
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ width: "100%", height: "100%", padding: "32px 0 0", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", right: "0", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Input.TextArea defaultValue={title} onChange={(e) => handlersUpdateTitle(e.target.value)} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} />
                            <Button icon={<PictureOutlined />} onClick={handlersRender} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <article id="clip" ref={clipRef}>
                        <div id="title">
                            <p className="en">{title.split("/")[0]}</p>
                            <p className="cn">{title.split("/")[1]}</p>
                        </div>
                        <div className="line"></div>
                    </article>
                </aside>
            </Layout>
        </>
    );
};

export default Background;
