import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, Radio } from "antd";
import { PlusCircleOutlined, UploadOutlined, PrinterOutlined, DownloadOutlined, LogoutOutlined, AudioFilled, ClearOutlined } from "@ant-design/icons";
import { Script as DataScript, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { updateScriptGrammars } from "../../stores/reducers/project";
import store, { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";
import Script from "../learn/Script";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] scriptGrammars/index");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const project = useSelector((state: RootState) => state.project);
    const script = useSelector((state: RootState) => state.project.script.data);
    const refScrollbar = useRef<Scrollbars>(null);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const handlersUpdateGrammars = (value: string) => {
        if (value.trim() !== script.grammars.join("\n---\n")) {
            dispatch(updateScriptGrammars({ text: value.trim() }));
        }
    };
    useEffect(() => {
        if (!project.name || !project.videoURL || !project.videoCompressedURL) {
            alert("Please create a project.");
            navigate("/settings");
        }
        console.log("[mounted] scriptGrammars/index");
        return () => {
            console.log("[unmounted] scriptGrammars/index");
        };
    }, []);
    return (
        <Layout className="main-inner" id="script-grammars-index">
            <div className="main-inner-item-aside">
                <Scrollbars>
                    <Input.TextArea autoSize defaultValue={script.grammars.join("\n---\n")} onBlur={(e) => handlersUpdateGrammars(e.target.value)} style={{ minHeight: "100%", borderRadius: "0", color: "#000" }} placeholder="Each piece of grammar be separated by ---" />
                </Scrollbars>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars>
                    {dataFormatted.vocabs.length > 0 && (
                        <div id="grammars-preview">
                            {dataFormatted.grammars.map((value, key) => {
                                return (
                                    <div key={key} className="item">
                                        <span className="index">[{key + 1}] </span>
                                        {value.split("\n").map((v, k) => (k === 0 ? <span key={k}>{v}</span> : <p key={k}>{v}</p>))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Scrollbars>
            </div>
        </Layout>
    );
};
export default Index;
