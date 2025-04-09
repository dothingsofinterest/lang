import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, InputNumber } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import html2canvas from "html2canvas";
import ScriptDOM from "../script/ScriptDOM";
import "./ClipScript.scss";

// Deprecated
const ClipScript = () => {
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const [cutFrom, setCutFrom] = useState<number>(1);
    const [cutTo, setCutTo] = useState<number>(100);
    // Event Handlers
    const handlersPanelClip = () => {
        const h = document.querySelector("#article-clip") as HTMLElement;
        if (h) {
            html2canvas(h, {
                width: 1080,
                height: 1920,
                scale: 1,
            }).then((canvas) => {
                h.innerHTML = "";
                h.appendChild(canvas);
            });
        }
    };
    const handlersCutFrom = (index: number | null) => {
        if (index !== null && !isNaN(index)) {
            setCutFrom(index);
        }
    };
    const handlersCutTo = (index: number | null) => {
        if (index !== null && !isNaN(index)) {
            if (index > cutFrom) {
                setCutTo(index);
            }
        }
    };
    // Event Handlers
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ width: "100%", height: "100%", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <InputNumber min={1} max={99} step={1} value={cutFrom} onChange={(v) => handlersCutFrom(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                            <InputNumber min={2} max={100} step={1} value={cutTo} onChange={(v) => handlersCutTo(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                            <Button icon={<PictureOutlined />} onClick={handlersPanelClip} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <ScriptDOM dataArticle={dataArticle} activeSentence={0} boxID="article-clip" />
                </aside>
            </Layout>
        </>
    );
};

export default ClipScript;
