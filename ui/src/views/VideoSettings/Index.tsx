import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { PlusCircleOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import store, { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateVideoHash, updateVideoMatchingSentence, updateTranslateMatchingSentence, updateScriptTimeOffset, updateProcessings, updateVideoURL, updateVideoAudioWaverURL, updateScriptData } from "../../stores/reducers/plan";
import { clearToken } from "../../stores/reducers/auth";
import { fnCreateJson, fnValidateJsonFile } from "../../utils/script";
import { videoImport, waveformCreate, importData, exportData } from "../../api/requestAuth";
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const plan = useSelector((state: RootState) => state.plan);
    const script = useSelector((state: RootState) => state.plan.script.data);
    const processings = useSelector((state: RootState) => state.plan.processings);
    const handlersImportVideo = async (file: any) => {
        if (/^(.+?)\.(mp4|MP4)$/g.test(file.name) && file.type === "video/mp4") {
            dispatch(updateProcessings({ buttonID: 0, buttonStatus: true }));
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await videoImport(formData);
                if (res.code === 1) {
                    dispatch(updateVideoHash(res.data.plan));
                    dispatch(updateVideoMatchingSentence(0));
                    dispatch(updateTranslateMatchingSentence(0));
                    dispatch(updateVideoURL(URL.createObjectURL(file)));
                    // Create Audio Waveform
                    const resWaveform = await waveformCreate({ plan: res.data.plan });
                    if (resWaveform.code === 1) {
                        dispatch(updateVideoAudioWaverURL(resWaveform.data.filename));
                    }
                } else {
                    alert(res.message);
                }
                dispatch(updateProcessings({ buttonID: 0, buttonStatus: false }));
            } catch (e: any) {
                alert(e.message);
                dispatch(updateProcessings({ buttonID: 0, buttonStatus: false }));
            }
        } else {
            alert("Please upload mp4 format video.");
        }
        return false;
    };
    const handlersImportData = async (file: any) => {
        if (plan.videoHash && plan.videoURL) {
            if (/^(.+?)\.(zip|ZIP)$/g.test(file.name) && file.type === "application/x-zip-compressed") {
                dispatch(updateProcessings({ buttonID: 1, buttonStatus: true }));
                try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await importData({ plan: plan.videoHash }, formData);
                    if (res.code === 1) {
                        const res = await fetch(`${Domain}/data/${plan.videoHash}/script.json?${Date.now()}`);
                        const script = await res.json();
                        if (fnValidateJsonFile(script)) {
                            dispatch(updateScriptData(script));
                            document.title = script.title;
                        } else {
                            alert(`Script format is invalid.`);
                        }
                    } else {
                        alert(res.message);
                    }
                    dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
                } catch (e: any) {
                    alert(e.message);
                    dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
                }
            } else {
                alert("Please upload a zip data file.");
            }
        } else {
            alert("Please create a plan.");
        }
        return false;
    };
    const handlersExportData = async () => {
        if (plan.videoHash && plan.videoURL) {
            try {
                const resBlob = await exportData({ plan: plan.videoHash });
                const blob = new Blob([resBlob], { type: "application/zip" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `data.zip`,
                    types: [{ description: script.title, accept: { "application/zip": [".zip"] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error("save error: ", error);
            }
        } else {
            alert("Please create a plan.");
        }
    };
    const handlersLogout = () => {
        dispatch(clearToken());
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Layout className="main-inner" id="settings-index">
            <div className="main-inner-item-main">
                <section className="sec upload">
                    <Upload showUploadList={false} beforeUpload={handlersImportVideo} disabled={processings[0]}>
                        <Button icon={<PlusCircleOutlined />} loading={processings[0]} style={{ borderRadius: "0", backgroundColor: "#ccc" }}>
                            Upload video to create a study plan
                        </Button>
                    </Upload>
                    <Input addonBefore="Plan" value={plan.videoHash} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                </section>
                <section className="sec upload">
                    <Upload beforeUpload={handlersImportData} showUploadList={false}>
                        <Button icon={<UploadOutlined />} style={{ flex: 1, borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                            Import data
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handlersExportData} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Export data
                    </Button>
                </section>
            </div>
        </Layout>
    );
};
export default Index;
