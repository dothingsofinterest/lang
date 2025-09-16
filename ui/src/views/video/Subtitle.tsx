import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, InputNumber, Select } from "antd";
import { LinkOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateProcessings } from "../../stores/reducers/project";
import { updateAssFormat } from "../../stores/reducers/script";
import { AssFormat } from "../../types/Data";
import { videoGenerateSubtitleVideo, videoGetSubtitleVideoPreview, scriptUpdateAss } from "../../api/requestAuth";
import "./Subtitle.scss";

const Subtitle = () => {
    console.log("----------Render | Video/Subtitle----------");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const projectName = useSelector((state: RootState) => state.project.name);
    const processings = useSelector((state: RootState) => state.project.processings);
    const [subtitleVideoURL, setSubtitleVideoURL] = useState("");
    const [previewFrame, setPreviewFrame] = useState("");
    const [previewClass, setPreviewClass] = useState("preview-computer");
    const refPreview = useRef<HTMLImageElement>(null);
    // Event Handlers
    const handlersPreview = async () => {
        if (projectName) {
            const res = await videoGetSubtitleVideoPreview({ project: projectName });
            if (res.code === 1) {
                setPreviewFrame(`${res.data.preview}?v=${Math.random()}`);
            } else {
                alert(res.message);
            }
        } else {
            alert(`project or script not be set.`);
        }
    };
    const handlersClipSubtitleVideo = async () => {
        if (projectName) {
            dispatch(updateProcessings({ buttonID: 1, buttonStatus: true }));
            const resBlob = await videoGenerateSubtitleVideo({ project: projectName });
            const text = await resBlob.text();
            try {
                const responJson = JSON.parse(text);
                dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
                alert(`${responJson.message}`);
            } catch {
                const blob = new Blob([resBlob], { type: "video/mp4" });
                setSubtitleVideoURL(URL.createObjectURL(blob));
                dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
            }
        } else {
            alert(`project or script not be set.`);
        }
    };
    const updateHook = async (ass: AssFormat) => {
        if (projectName) {
            try {
                const res = await scriptUpdateAss({ project: projectName }, ass);
                if (res.code !== 1) {
                    alert(`Failed to sync: ${res.message}`);
                }
            } catch (error: any) {
                alert(error.message);
            }
        } else {
            alert(`syncing ass to server need a project name.`);
        }
    };
    const handlersUpdateScriptAss = (key: string, value: number | string | null) => {
        if (key && value) {
            const properties = ["enFontSize", "enFontColor", "enFontColorInline", "enFontOutlineWidth", "enFontOutlineColor", "enAlignment", "enMarginLR", "enMarginV", "cnFontSize", "cnFontColor", "cnFontColorInline", "cnFontOutlineWidth", "cnFontOutlineColor", "cnAlignment", "cnMarginLR", "cnMarginV", "cnLineBreak"];
            if (properties.indexOf(key) >= 0) {
                const assFormat = { ...script.assFormat };
                (assFormat as any)[key] = value;
                dispatch(updateAssFormat(assFormat));
                updateHook(assFormat);
            }
        }
    };
    useEffect(() => {
        console.log("----------Watch subtitleVideoURL | Video/Subtitle----------");
        setTimeout(() => {
            if (refPreview.current) {
                if (refPreview.current.naturalHeight > refPreview.current.naturalWidth) {
                    setPreviewClass("preview-mobile");
                }
            }
        }, 1000);
    }, [previewFrame]);
    // Event Handlers
    return (
        <>
            <Layout id="video-subtitle" className="main-inner">
                <div className="main-inner-item-main">
                    <section style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Button icon={<CloudUploadOutlined />} onClick={handlersPreview} loading={processings[2]} disabled={processings[2]} style={{ flex: 1, color: "#fff", borderRadius: "0", backgroundColor: "rgba(0, 42, 81)" }}>
                            Preview
                        </Button>
                        <Button icon={<CloudUploadOutlined />} onClick={handlersClipSubtitleVideo} loading={processings[1]} disabled={processings[1]} style={{ flex: 1, color: "#fff", borderRadius: "0", backgroundColor: "rgba(0, 42, 81)" }}>
                            Generating a subtitle video
                        </Button>
                    </section>
                    <section className="btn-cn" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ccc" }}>CN</div>
                        <InputNumber addonBefore="LineBreak: " min={1} max={50} step={1} value={script.assFormat.cnLineBreak} onChange={(v) => handlersUpdateScriptAss("cnLineBreak", v)} style={{ flex: "0 0 140px" }} />
                        <InputNumber addonBefore="FontSize: " min={0} max={100} step={1} value={script.assFormat.cnFontSize} onChange={(v) => handlersUpdateScriptAss("cnFontSize", v)} style={{ flex: "0 0 140px" }} />
                        <Select
                            style={{ flex: "0 0 150px" }}
                            prefix="FontColor -"
                            value={script.assFormat.cnFontColor}
                            onChange={(v) => handlersUpdateScriptAss("cnFontColor", v)}
                            options={[
                                { value: "H00FFFFFF", label: "White" },
                                { value: "H00000000", label: "Black" },
                                { value: "H002CB2FE", label: "Olympics Yellow" },
                            ]}
                        />
                        <Select
                            style={{ flex: "0 0 220px" }}
                            prefix="FontColorInline -"
                            value={script.assFormat.cnFontColorInline}
                            onChange={(v) => handlersUpdateScriptAss("cnFontColorInline", v)}
                            options={[
                                { value: "H3517DC", label: "USA Red" },
                                { value: "H2CB2FE", label: "Olympics Yellow" },
                            ]}
                        />
                        <InputNumber style={{ flex: "0 0 200px" }} addonBefore="FontOutlineWidth: " min={0} max={100} step={1} value={script.assFormat.cnFontOutlineWidth} onChange={(v) => handlersUpdateScriptAss("cnFontOutlineWidth", v)} />
                        <Select
                            style={{ flex: "0 0 250px" }}
                            prefix="FontOutlineColor -"
                            value={script.assFormat.cnFontOutlineColor}
                            onChange={(v) => handlersUpdateScriptAss("cnFontOutlineColor", v)}
                            options={[
                                { value: "H00000000", label: "Black" },
                                { value: "H00FFFFFF", label: "White" },
                            ]}
                        />
                    </section>
                    <section className="btn-cn" style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Select
                            style={{ flex: 1 }}
                            prefix="Align(HV) -"
                            value={script.assFormat.cnAlignment}
                            onChange={(v) => handlersUpdateScriptAss("cnAlignment", v)}
                            options={[
                                { value: 5, label: "Center-Center-5" },
                                { value: 8, label: "Center-Top-8" },
                                { value: 2, label: "Center-Bottom-2" },
                            ]}
                        />
                        <InputNumber style={{ flex: 1 }} addonBefore="MarginLR: " min={0} max={100} step={1} value={script.assFormat.cnMarginLR} onChange={(v) => handlersUpdateScriptAss("cnMarginLR", v)} />
                        <InputNumber style={{ flex: 1 }} addonBefore="MarginV: " min={0} max={300} step={1} value={script.assFormat.cnMarginV} onChange={(v) => handlersUpdateScriptAss("cnMarginV", v)} />
                    </section>
                    <section className="btn-en" style={{ width: "100%", backgroundColor: "#ccc", display: "flex", justifyContent: "space-between" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#999" }}>EN </div>
                        <InputNumber addonBefore="FontSize: " min={0} max={100} step={1} value={script.assFormat.enFontSize} onChange={(v) => handlersUpdateScriptAss("enFontSize", v)} style={{ flex: "0 0 140px" }} />
                        <Select
                            style={{ flex: "0 0 150px" }}
                            prefix="FontColor -"
                            value={script.assFormat.enFontColor}
                            onChange={(v) => handlersUpdateScriptAss("enFontColor", v)}
                            options={[
                                { value: "H00FFFFFF", label: "White" },
                                { value: "H00000000", label: "Black" },
                                { value: "H002CB2FE", label: "Olympics Yellow" },
                            ]}
                        />
                        <Select
                            style={{ flex: "0 0 220px" }}
                            prefix="FontColorInline -"
                            value={script.assFormat.enFontColorInline}
                            onChange={(v) => handlersUpdateScriptAss("enFontColorInline", v)}
                            options={[
                                { value: "H3517DC", label: "USA Red" },
                                { value: "H2CB2FE", label: "Olympics Yellow" },
                            ]}
                        />
                        <InputNumber style={{ flex: "0 0 200px" }} addonBefore="FontOutlineWidth: " min={0} max={100} step={1} value={script.assFormat.enFontOutlineWidth} onChange={(v) => handlersUpdateScriptAss("enFontOutlineWidth", v)} />
                        <Select
                            style={{ flex: "0 0 250px" }}
                            prefix="FontOutlineColor -"
                            value={script.assFormat.enFontOutlineColor}
                            onChange={(v) => handlersUpdateScriptAss("enFontOutlineColor", v)}
                            options={[
                                { value: "H00000000", label: "Black" },
                                { value: "H00FFFFFF", label: "White" },
                            ]}
                        />
                    </section>
                    <section className="btn-en" style={{ width: "100%", backgroundColor: "#ccc", display: "flex", justifyContent: "space-between" }}>
                        <Select
                            style={{ flex: 1 }}
                            prefix="Align(HV) -"
                            value={script.assFormat.enAlignment}
                            onChange={(v) => handlersUpdateScriptAss("enAlignment", v)}
                            options={[
                                { value: 5, label: "Center-Center-5" },
                                { value: 8, label: "Center-Top-8" },
                                { value: 2, label: "Center-Bottom-2" },
                            ]}
                        />
                        <InputNumber style={{ flex: 1 }} addonBefore="MarginLR: " min={0} max={100} step={1} value={script.assFormat.enMarginLR} onChange={(v) => handlersUpdateScriptAss("enMarginLR", v)} />
                        <InputNumber style={{ flex: 1 }} addonBefore="MarginV: " min={0} max={300} step={1} value={script.assFormat.enMarginV} onChange={(v) => handlersUpdateScriptAss("enMarginV", v)} />
                    </section>
                    <section style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <Button icon={<LinkOutlined />} style={{ flex: "1", backgroundColor: "#5cb85c", borderRadius: 0 }} href={subtitleVideoURL} target="_blank" iconPosition="end" />
                    </section>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", backgroundColor: "rgb(32, 32, 36)" }}>
                        <a href={previewFrame} target="_blank">
                            <img src={previewFrame} className={previewClass} ref={refPreview} />
                        </a>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default Subtitle;
