import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { PlusCircleOutlined, UploadOutlined, PrinterOutlined, DownloadOutlined, RetweetOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateName, updateProcessings } from "../../stores/reducers/project";
import { updateLocalOrigin, updateLocalOriginCompress } from "../../stores/reducers/video";
import { updateData } from "../../stores/reducers/script";
import { fnGetScriptWithTimeOffset, fnGenerateSRT, fnGenerateASS } from "../../utils/script";
import { videoUpload, videoCompress, scriptUpload } from "../../api/requestFile";
import printJS from "print-js";
import ScriptDOM from "../script/ScriptDOM";
import ReactDOMServer from "react-dom/server";

const Index = () => {
    const dispatch = useDispatch();
    const projectName = useSelector((state: RootState) => state.project.name);
    const script = useSelector((state: RootState) => state.script.data);
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const scriptTimeOffset = useSelector((state: RootState) => state.script.timeOffset);
    const localOrigin = useSelector((state: RootState) => state.video.localOrigin);
    const localOriginCompress = useSelector((state: RootState) => state.video.localOriginCompress);
    const processings = useSelector((state: RootState) => state.project.processings);
    const [loadings, setLoadings] = useState<boolean[]>([]);
    // Event Handlers
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
                    // Create Local Video URL
                    dispatch(updateLocalOrigin(URL.createObjectURL(file)));
                    // Create Local Low Video URL
                    const resBlob = await videoCompress({ project: res.data.project });
                    const blob = new Blob([resBlob], { type: "video/mp4" });
                    const url = URL.createObjectURL(blob);
                    dispatch(updateLocalOriginCompress(url));
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
    const handlersSubImportScript = (file: any) => {
        if (/^(.+?)\.(json|JSON)$/g.test(file.name) && file.type === "application/json") {
            if (projectName) {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async (e) => {
                    try {
                        if (e.target?.result) {
                            const content = e.target.result as string;
                            const data = JSON.parse(content);
                            dispatch(updateData(data));
                            // Upload Script
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await scriptUpload({ project: projectName }, formData);
                            if (res.code === 1) {
                                console.log("Upload succeed.");
                            } else {
                                alert(res.message);
                            }
                            document.title = data.name;
                        }
                    } catch (e: any) {
                        alert(e.message);
                    }
                };
            } else {
                alert(`Project name not be set`);
            }
        } else {
            alert("Please upload json file.");
        }
        return false;
    };
    const handlersSubExportScript = async () => {
        if (dataArticle.name) {
            try {
                const blob = new Blob([JSON.stringify(fnGetScriptWithTimeOffset(script, scriptTimeOffset), null, 4)], { type: "application/json" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `${script.name}.json`,
                    types: [
                        {
                            description: script.name,
                            accept: { "application/json": [".json"] },
                        },
                    ],
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
    const handlersSubExportSRT = async () => {
        if (dataArticle.name) {
            try {
                const blob = new Blob([fnGenerateSRT(script, scriptTimeOffset)], { type: "text/srt" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `${script.name}.srt`,
                    types: [
                        {
                            description: script.name,
                            accept: { "text/srt": [".srt"] },
                        },
                    ],
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
    const handlersSubExportASS = async () => {
        if (script.name) {
            try {
                const blob = new Blob([fnGenerateASS(script, scriptTimeOffset)], { type: "text/plain" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `${script.name}.ass`,
                    types: [
                        {
                            description: script.name,
                            accept: { "text/plain": [".ass"] },
                        },
                    ],
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
            article { width: 1000px; }
            article h1 { text-align: center; font-size: 16px; font-weight: 900; line-height: 50px; color: #000; margin: 10px 0; }
            article h2 { text-align: center; font-size: 14px; font-weight: 300; line-height: 20px; color: #000; margin: 10px 16px; }
            article .scene { background: #ccc; padding: 6px 0; margin-bottom: 10px; }
            article .p { border: 1px dotted #000; margin: 12px 20px; padding: 2px 6px; color: #000; font-size: 14px; line-height: 28px; }
            article .p .point { padding: 0 4px; }
            article .p .role { font-style: normal; font-weight: 900; padding-right: 2px; }
            article .p ul { font-style: normal; font-size: 12px; }
            article footer { height: 100%; }
            article footer .words { margin-bottom: 10px; }
            article footer .words,
            article footer .grammers { color: #fff; line-height: 28px; background-color: #333; padding: 10px 20px; }
            article footer .words .item-index,
            article footer .grammers .item-index { font-weight: 900; }
            article footer .words .title,
            article footer .grammers .title { line-height: 36px; display: flex; align-items: center; text-align: center; justify-content: center; font-weight: 900; font-size: 14px; }
            article footer .title:before, 
            article footer .title:after { position: relative; width: 50%; border-block-start: 1px dotted #fff; border-block-end: 0; transform: translateY(50%); content: ""; }`;
            const content = ReactDOMServer.renderToStaticMarkup(<ScriptDOM dataArticle={dataArticle} activeSentence={0} />);
            printJS({ printable: `${content}`, type: "raw-html", style: css });
        } else {
            alert(`Data not be set`);
        }
    };
    // Event Handlers
    // Template Functions
    useEffect(() => {
        console.log("----------Mounted | Set/Index Component----------");
        return () => {
            console.log("----------Unmounted | Set/Index Component----------");
        };
    }, []);
    console.log("----------Rendered | Set/Index Component----------");
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ flex: "0 0 800px", position: "relative", height: "100%", padding: "32px 0 132px", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "auto", position: "absolute", right: "0", top: "0", backgroundColor: "#202024", overflow: "hidden" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Upload showUploadList={false} beforeUpload={handlersUploadVideo} disabled={processings[0]}>
                                <Button icon={<PlusCircleOutlined />} loading={processings[0]} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc", justifyContent: "center" }} />
                            </Upload>
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Input addonBefore="Project Name: " value={projectName} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Input addonBefore="Video Local: " value={localOrigin} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Input addonBefore="Video Local Low: " value={localOriginCompress} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Upload beforeUpload={handlersSubImportScript} showUploadList={false}>
                                <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                    Import JSON
                                </Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} onClick={handlersSubExportScript} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Export JSON
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={handlersSubExportSRT} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Export SRT
                            </Button>
                            <Button icon={<DownloadOutlined />} onClick={handlersSubExportASS} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Export ASS
                            </Button>
                            <Button icon={<PrinterOutlined />} onClick={handlersPrint} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                                Print
                            </Button>
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Input addonBefore="Script Name: " value={script.name} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }} disabled />
                        </div>
                    </section>
                </aside>
            </Layout>
        </>
    );
};
export default Index;
