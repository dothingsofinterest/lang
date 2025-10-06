import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { PlusCircleOutlined, UploadOutlined, PrinterOutlined, DownloadOutlined, LogoutOutlined } from "@ant-design/icons";
import store, { RootState } from "../../stores";
import { useSelector, useDispatch, Provider } from "react-redux";
import { updateName, updateActiveSentence, updateActiveVocab, updateProcessings } from "../../stores/reducers/project";
import { updateURL, updateURLCompressed } from "../../stores/reducers/video";
import { updateData } from "../../stores/reducers/script";
import { clearToken } from "../../stores/reducers/auth";
import { createJson as fnCreateJson, validateJsonFile as fnValidateJsonFile } from "../../utils/script";
import { videoUpload, videoCompress, scriptUpload } from "../../api/requestAuth";
import printJS from "print-js";
import ScriptDOM from "../dictation/Script";
import ReactDOMServer from "react-dom/server";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] settings/index");
    const dispatch = useDispatch();
    const projectName = useSelector((state: RootState) => state.project.name);
    const script = useSelector((state: RootState) => state.script.data);
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const scriptTimeOffset = useSelector((state: RootState) => state.script.timeOffset);
    const videoURL = useSelector((state: RootState) => state.video.URL);
    const videoURLCompressed = useSelector((state: RootState) => state.video.URLCompressed);
    const processings = useSelector((state: RootState) => state.project.processings);
    const handlersUploadVideo = async (file: any) => {
        if (/^(.+?)\.(mp4|MP4)$/g.test(file.name) && file.type === "video/mp4") {
            dispatch(updateProcessings({ buttonID: 0, buttonStatus: true }));
            try {
                const formData = new FormData();
                formData.append("video", file);
                const res = await videoUpload(formData);
                if (res.code === 1) {
                    // Set Project Name
                    dispatch(updateName(res.data.project));
                    // Reset avtive sentence
                    dispatch(updateActiveSentence(0));
                    dispatch(updateActiveVocab(0));
                    // Create Local Video URL
                    dispatch(updateURL(URL.createObjectURL(file)));
                    // Create Local Low Video URL
                    const resBlob = await videoCompress({ project: res.data.project });
                    const blob = new Blob([resBlob], { type: "video/mp4" });
                    const url = URL.createObjectURL(blob);
                    dispatch(updateURLCompressed(url));
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
        if (/^(.+?)\.(json|JSON)$/g.test(file.name) && file.type === "application/json") {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async (e) => {
                try {
                    if (e.target?.result) {
                        const content = e.target.result as string;
                        const data = JSON.parse(content);
                        if (fnValidateJsonFile(data)) {
                            dispatch(updateData(data));
                            // Upload Script
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await scriptUpload(formData);
                            if (res.code === 1) {
                                // Set Project Name
                                dispatch(updateName(res.data.project));
                                // Reset avtive sentence
                                dispatch(updateActiveSentence(0));
                                dispatch(updateActiveVocab(0));
                                console.log("Upload succeed.");
                            } else {
                                alert(res.message);
                            }
                            document.title = data.name;
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
        return false;
    };
    const handlersExportScript = async () => {
        if (dataArticle.name) {
            try {
                const blob = new Blob([JSON.stringify(fnCreateJson(script, scriptTimeOffset), null, 4)], { type: "application/json" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `${script.name.split("/")[0]}.json`,
                    types: [{ description: script.name, accept: { "application/json": [".json"] } }],
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
    };
    const handlersPrint = () => {
        if (dataArticle.name) {
            const css = `
            * { outline: none; }
            html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
            body { margin: 0; padding: 0; font-size: 14px; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
            ol, ul, li { list-style: none; }
            #article-print { width: 1000px; }
            #article-print h1 { text-align: center; font-size: 16px; font-weight: 900; line-height: 40px; color: #000; margin: 10px 15px; }
            #article-print .scene { background: #666; padding: 10px 0 0; margin: 10px 20px; border-radius: 4px; }
            #article-print .scene h2 { text-align: center; font-size: 14px; font-weight: 300; font-style: italic; line-height: 20px; color: #ccc; margin: 0px 10px; }
            #article-print .scene p { border-top: 1px dotted #ccc; margin: 0; padding: 6px 10px; color: #fff; font-size: 14px; line-height: 26px; }
            #article-print .scene p.pure { text-indent: 30px; }
            #article-print .scene p:first-of-type  { border-top: 0; }
            #article-print .scene p .point { padding: 0 4px; }
            #article-print .scene p .point:first-child { padding: 0; }
            #article-print .scene p .role { font-style: normal; font-weight: 900; color: #ccc; }
            #article-print .scene ul { border-top: 1px dotted #ccc; margin: 0; padding: 6px 10px; color: #fff; font-size: 14px; line-height: 26px; }
            #article-print .scene ul .role { font-style: normal; font-weight: 900; color: #ccc; }
            #article-print footer { height: 100%; }
            #article-print footer .vocabs,
            #article-print footer .notes { color: #fff; padding: 10px 0 0; margin: 20px; background: #666; border-radius: 4px; }
            #article-print footer .vocabs .title,
            #article-print footer .notes .title { color: #fff; margin: 0 10px; line-height: 22px; text-align: center; font-weight: 900; font-size: 16px; }
            #article-print footer .vocabs .vocab-item,
            #article-print footer .notes .note-item { margin: 0; padding: 6px 10px; border-top: 1px dotted #ccc; line-height: 26px; }
            #article-print footer .vocabs .vocab-item:nth-child(2),
            #article-print footer .notes .note-item:nth-child(2) { border-top: 0; }
            #article-print footer .vocabs .item-index,
            #article-print footer .notes .item-index { font-weight: 900; margin-right: 4px; }`;
            const content = ReactDOMServer.renderToStaticMarkup(
                <Provider store={store}>
                    <ScriptDOM dataArticle={dataArticle} activeSentence={0} activeVocab={0} boxID="article-print" />
                </Provider>,
            );
            printJS({ printable: `${content}`, type: "raw-html", style: css });
        } else {
            alert(`Data not be set`);
        }
    };
    const handlersLogout = () => {
        dispatch(clearToken());
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
                    <Upload beforeUpload={handlersImportScript} showUploadList={false}>
                        <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                            Import Script
                        </Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} onClick={handlersExportScript} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Export Script
                    </Button>
                    <Upload showUploadList={false} beforeUpload={handlersUploadVideo} disabled={processings[0]}>
                        <Button icon={<UploadOutlined />} loading={processings[0]} style={{ borderRadius: "0", width: "10%", backgroundColor: "#ccc", justifyContent: "center" }}>
                            Import Video
                        </Button>
                    </Upload>
                </section>
                <section className="sec upload">
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Print
                    </Button>
                    <Button icon={<LogoutOutlined />} onClick={handlersLogout} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                        Logout
                    </Button>
                </section>
                <section className="sec">
                    <Input addonBefore="Project name: " value={projectName} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                </section>
                <section className="sec">
                    <Input addonBefore="Local video : " value={videoURL} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                </section>
                <section className="sec">
                    <Input addonBefore="Local compressed video : " value={videoURLCompressed} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                </section>
                <section style={{ display: "flex", justifyContent: "space-between" }}>
                    <Input addonBefore="Script Name: " value={script.name} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                </section>
            </div>
        </Layout>
    );
};
export default Index;
