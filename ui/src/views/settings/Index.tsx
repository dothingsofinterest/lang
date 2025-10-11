import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { PlusCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import store, { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateName, updateActiveSentence, updateActiveVocab, updateProcessings, updateVideoURL, updateVideoCompressedURL, updateScriptData } from "../../stores/reducers/project";
import { clearToken } from "../../stores/reducers/auth";
import { createJson as fnCreateJson, validateJsonFile as fnValidateJsonFile } from "../../utils/script";
import { importVideo, compressVideo, importScript, importVocabImg, streamVocabImg, importTts, streamTts } from "../../api/requestAuth";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] settings/index");
    const dispatch = useDispatch();
    const project = useSelector((state: RootState) => state.project);
    const script = useSelector((state: RootState) => state.project.script.data);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const scriptTimeOffset = useSelector((state: RootState) => state.project.script.timeOffset);
    const processings = useSelector((state: RootState) => state.project.processings);
    const handlersImportVideo = async (file: any) => {
        if (/^(.+?)\.(mp4|MP4)$/g.test(file.name) && file.type === "video/mp4") {
            dispatch(updateProcessings({ buttonID: 0, buttonStatus: true }));
            try {
                const formData = new FormData();
                formData.append("video", file);
                const res = await importVideo(formData);
                if (res.code === 1) {
                    // Set Project Name
                    dispatch(updateName(res.data.project));
                    // Reset avtive sentence
                    dispatch(updateActiveSentence(0));
                    dispatch(updateActiveVocab(0));
                    // Create Local Video URL
                    dispatch(updateVideoURL(URL.createObjectURL(file)));
                    // Create Local Low Video URL
                    const resBlob = await compressVideo({ project: res.data.project });
                    const blob = new Blob([resBlob], { type: "video/mp4" });
                    const url = URL.createObjectURL(blob);
                    dispatch(updateVideoCompressedURL(url));
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
    const handlersImportScript = (file: any) => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            if (/^(.+?)\.(json|JSON)$/g.test(file.name) && file.type === "application/json") {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async (e) => {
                    try {
                        if (e.target?.result) {
                            const content = e.target.result as string;
                            const data = JSON.parse(content);
                            if (fnValidateJsonFile(data)) {
                                dispatch(updateScriptData(data));
                                const formData = new FormData();
                                formData.append("file", file);
                                const res = await importScript({ project: project.name }, formData);
                                if (res.code === 1) {
                                    dispatch(updateActiveSentence(0));
                                    dispatch(updateActiveVocab(0));
                                } else {
                                    alert(res.message);
                                }
                                document.title = data.title;
                            } else {
                                alert(`Json file format is invalid.`);
                            }
                        }
                    } catch (e: any) {
                        alert(e.message);
                    }
                };
            } else {
                alert("Please upload json file.");
            }
        } else {
            alert("Please create a project.");
        }
        return false;
    };
    const handlersExportScript = async () => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            if (dataFormatted.title) {
                try {
                    const blob = new Blob([JSON.stringify(fnCreateJson(script, scriptTimeOffset), null, 4)], { type: "application/json" });
                    const handle = await await (window as any).showSaveFilePicker({
                        suggestedName: `${script.title.split("/")[0]}.json`,
                        types: [{ description: script.title, accept: { "application/json": [".json"] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (error) {
                    console.error("save error: ", error);
                }
            } else {
                alert(`Data not be set`);
            }
        } else {
            alert("Please create a project.");
        }
    };
    const handlersLogout = () => {
        dispatch(clearToken());
    };
    const handlersImportTTSZip = async (file: any) => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            if (/^(.+?)\.(zip|ZIP)$/g.test(file.name) && file.type === "application/x-zip-compressed") {
                dispatch(updateProcessings({ buttonID: 1, buttonStatus: true }));
                try {
                    const formData = new FormData();
                    formData.append("zip", file);
                    const res = await importTts(formData);
                    if (res.code !== 1) {
                        alert(res.message);
                    }
                    dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
                } catch (e: any) {
                    alert(e.message);
                    dispatch(updateProcessings({ buttonID: 1, buttonStatus: false }));
                }
            } else {
                alert("Please upload a zip file.");
            }
        } else {
            alert("Please create a project.");
        }
        return false;
    };
    const handlersImportVocabsImgZip = async (file: any) => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            if (/^(.+?)\.(zip|ZIP)$/g.test(file.name) && file.type === "application/x-zip-compressed") {
                dispatch(updateProcessings({ buttonID: 2, buttonStatus: true }));
                try {
                    const formData = new FormData();
                    formData.append("zip", file);
                    const res = await importVocabImg({ project: project.name }, formData);
                    if (res.code !== 1) {
                        alert(res.message);
                    }
                    dispatch(updateProcessings({ buttonID: 2, buttonStatus: false }));
                } catch (e: any) {
                    alert(e.message);
                    dispatch(updateProcessings({ buttonID: 2, buttonStatus: false }));
                }
            } else {
                alert("Please upload a zip file.");
            }
        } else {
            alert("Please create a project.");
        }
        return false;
    };
    const handlersExportVocabsImgZip = async () => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            try {
                const resBlob = await streamVocabImg({ project: project.name });
                const blob = new Blob([resBlob], { type: "application/zip" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `images.zip`,
                    types: [{ description: script.title, accept: { "application/zip": [".zip"] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error("save error: ", error);
            }
        } else {
            alert("Please create a project.");
        }
    };
    const handlersExportTTSZip = async () => {
        if (project.name && project.videoURL && project.videoCompressedURL) {
            try {
                const resBlob = await streamTts({});
                const blob = new Blob([resBlob], { type: "application/zip" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `tts.zip`,
                    types: [{ description: script.title, accept: { "application/zip": [".zip"] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error("save error: ", error);
            }
        } else {
            alert("Please create a project.");
        }
    };
    useEffect(() => {
        console.log("[mounted] settings/index");
        return () => {
            console.log("[unmounted] settings/index");
        };
    }, []);
    return (
        <Layout className="main-inner" id="settings-index">
            <div className="main-inner-item-main">
                <section className="sec upload">
                    <Upload showUploadList={false} beforeUpload={handlersImportVideo} disabled={processings[0]}>
                        <Button icon={<PlusCircleOutlined />} loading={processings[0]} style={{ borderRadius: "0", backgroundColor: "#ccc" }}>
                            Import video to create a project
                        </Button>
                    </Upload>
                    <Input addonBefore="Project" value={project.name} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                </section>
                <section className="sec upload">
                    <Upload beforeUpload={handlersImportScript} showUploadList={false}>
                        <Button icon={<PlusCircleOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                            Import Script
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handlersExportScript} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Export Script
                    </Button>
                </section>
                <section className="sec upload">
                    <Upload beforeUpload={handlersImportTTSZip} showUploadList={false}>
                        <Button icon={<PlusCircleOutlined />} style={{ flex: 1, borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                            Import TTS
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handlersExportTTSZip} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Export TTS
                    </Button>
                </section>
                <section className="sec upload">
                    <Upload beforeUpload={handlersImportVocabsImgZip} showUploadList={false}>
                        <Button icon={<PlusCircleOutlined />} style={{ flex: 1, borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                            Import Vocabulary Image
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handlersExportVocabsImgZip} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Export Vocabulary Image
                    </Button>
                </section>
            </div>
        </Layout>
    );
};
export default Index;
