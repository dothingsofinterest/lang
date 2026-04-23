// import React, { useState, useRef, useEffect } from "react";
// import { Layout, Input, Button, Upload } from "antd";
// import { PlusCircleOutlined, UploadOutlined, DownloadOutlined, LineChartOutlined, SearchOutlined } from "@ant-design/icons";
// import store, { RootState } from "../../stores";
// import { useSelector, useDispatch } from "react-redux";
// import { updateLoadingUploadVideo, updateLoadingImportData } from "../../stores/reducers/status";
// import { updateVideoHash, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScriptData } from "../../stores/reducers/data";
// import { clearToken } from "../../stores/reducers/auth";
// import { fnValidateVideoScript, fnDealParagraphs, fnDealVocab } from "../../utils/script";
// import { statisticsCountVocab, statisticsSearch, speechConcat, speechBatchTranscode } from "../../api/requestAuth";
// import { Domain } from "../../settings.js";
// import "./Index.scss";

// const Index = () => {
//     const dispatch = useDispatch();
//     const data = useSelector((state: RootState) => state.data);
//     const script = useSelector((state: RootState) => state.data.script);
//     const loadingUploadVideo = useSelector((state: RootState) => state.status.loadingUploadVideo);
//     const loadingImportData = useSelector((state: RootState) => state.status.loadingImportData);
//     const [keywords, setKeywords] = useState("");
//     const handlersImportVideo = async (file: any) => {
//         if (/^(.+?)\.(mp4)$/g.test(file.name) && file.type === "video/mp4") {
//             //     dispatch(updateLoadingUploadVideo(1));
//             //     try {
//             //         const formData = new FormData();
//             //         formData.append("file", file);
//             //         const res = await videoImport(formData);
//             //         if (res.code === 1) {
//             //             dispatch(updateVideoHash(res.data.hash));
//             //             dispatch(updateVideoURL(URL.createObjectURL(file)));
//             //             const resWaveform = await videoInit({ hash: res.data.hash });
//             //             if (resWaveform.code === 1) {
//             //                 dispatch(updateVideoAudioWaverURL(`${Domain}/data/${res.data.hash}/${resWaveform.data.audiowaveform}`));
//             //             }
//             //         } else {
//             //             alert(res.message);
//             //         }
//             //         dispatch(updateLoadingUploadVideo(0));
//             //     } catch (e: any) {
//             //         alert(e.message);
//             //         dispatch(updateLoadingUploadVideo(0));
//             //     }
//         } else {
//             alert("Please upload mp4 format video.");
//         }
//         return false;
//     };
//     const handlersImportData = async (file: any) => {
//         if (data.videoHash && data.videoURL) {
//             if (/^(.+?)\.(zip|ZIP)$/g.test(file.name) && file.type === "application/x-zip-compressed") {
//                 dispatch(updateLoadingImportData(1));
//                 // try {
//                 //     const formData = new FormData();
//                 //     formData.append("file", file);
//                 //     const res = await importData({ hash: data.videoHash }, formData);
//                 //     if (res.code === 1) {
//                 //         const resScript = await fetch(`${Domain}/data/${data.videoHash}/script.json?${Date.now()}`);
//                 //         const script = await resScript.json();
//                 //         if (fnValidateVideoScript(script)) {
//                 //             if (script.title) {
//                 //                 // temporary
//                 //                 script.vocab = fnDealVocab(script);
//                 //                 script.paragraphs = fnDealParagraphs(script);
//                 //                 dispatch(updateScriptData(script));
//                 //             }
//                 //         } else {
//                 //             alert(`Script format is invalid.`);
//                 //         }
//                 //         document.title = script.title;
//                 //     } else {
//                 //         alert(`${res.message}`);
//                 //     }
//                 //     dispatch(updateLoadingImportData(0));
//                 // } catch (e: any) {
//                 //     alert(e.message);
//                 //     dispatch(updateLoadingImportData(0));
//                 // }
//             } else {
//                 alert("Please upload a zip data file.");
//             }
//         } else {
//             alert("Please upload a video.");
//         }
//         return false;
//     };
//     const handlersExportData = async () => {
//         if (data.videoHash && data.videoURL && data.scriptParsed.title) {
//             try {
//                 // const handle = await (window as any).showSaveFilePicker({
//                 //     suggestedName: `data.zip`,
//                 //     types: [{ description: `data`, accept: { "application/zip": [".zip"] } }],
//                 // });
//                 // const writable = await handle.createWritable();
//                 // const resBlob = await exportData({ hash: data.videoHash });
//                 // const blob = new Blob([resBlob], { type: "application/zip" });
//                 // await writable.write(blob);
//                 // await writable.close();
//                 // ---
//                 const dirHandle = await (window as any).showDirectoryPicker();
//                 const isValidDir = await fnValidateExportDir(data.scriptParsed.title, dirHandle);
//                 // if (isValidDir) {
//                 //     const fileHandle = await dirHandle.getFileHandle("data.zip", { create: true });
//                 //     const writable = await fileHandle.createWritable();
//                 //     const resBlob = await exportData({ hash: data.videoHash });
//                 //     const blob = new Blob([resBlob], { type: "application/zip" });
//                 //     await writable.write(blob);
//                 //     await writable.close();
//                 // } else {
//                 //     alert("You selected a wrong place!");
//                 //     return;
//                 // }
//             } catch (error) {
//                 console.error("save error: ", error);
//                 alert("Something wrong happened.");
//             }
//         } else {
//             alert("Please upload a video with a title.");
//         }
//     };
//     const handlersExportAudio = async () => {
//         if (data.videoHash && data.videoURL) {
//             try {
//                 const handle = await await (window as any).showSaveFilePicker({
//                     suggestedName: `${script.title}.mp3`,
//                     types: [{ description: script.title, accept: { "audio/mpeg": [".mp3"] } }],
//                 });
//                 const writable = await handle.createWritable();
//                 const resBlob = await speechConcat({ hash: data.videoHash });
//                 const blob = new Blob([resBlob], { type: "audio/mpeg" });
//                 await writable.write(blob);
//                 await writable.close();
//             } catch (error) {
//                 console.error("save error: ", error);
//             }
//         } else {
//             alert("Please upload a video.");
//         }
//     };
//     const handlerStatisticsCount = async () => {
//         const res = await statisticsCountVocab();
//         await speechBatchTranscode({ hash: data.videoHash });
//         alert(`Video: ${res.data.videoCount}, Vocab: ${res.data.videoVocabCount}`);
//     };
//     const handlerStatisticsSearch = async () => {
//         if (keywords) {
//             const res = await statisticsSearch({ keywords: keywords });
//             alert(res.data.map((v: string, k: number) => `${k}. ${v}`).join("\r\n"));
//         }
//     };
//     const handlersTypeKeywords = (value: string) => {
//         setKeywords(value);
//     };
//     const handlersLogout = () => {
//         dispatch(clearToken());
//     };
//     const fnValidateExportDir = async (name: string, dirHandle: FileSystemDirectoryHandle) => {
//         try {
//             const fileHandle = await dirHandle.getFileHandle(".data.json");
//             const file = await fileHandle.getFile();
//             const text = await file.text();
//             const fileObject = JSON.parse(text);
//             return fileObject.name === name;
//         } catch {
//             return false;
//         }
//     };
//     useEffect(() => {
//         return () => {};
//     }, []);
//     return (
//         <Layout className="main-inner" id="settings">
//             <div className="main-inner-item-aside"></div>
//             <div className="main-inner-item-main">
//                 <section className="sec">
//                     <Upload className="sec-item" showUploadList={false} beforeUpload={handlersImportVideo} disabled={!!loadingUploadVideo || !!data.scriptParsed.title}>
//                         <Button icon={<PlusCircleOutlined />} disabled={!!data.scriptParsed.title} loading={!!loadingUploadVideo}>
//                             Upload an mp4 Video
//                         </Button>
//                     </Upload>
//                 </section>
//                 <section className="sec">
//                     <Upload className="sec-item" beforeUpload={handlersImportData} showUploadList={false} disabled={!!data.scriptParsed.title}>
//                         <Button icon={<UploadOutlined />} disabled={!!data.scriptParsed.title} loading={!!loadingImportData}>
//                             Import Data
//                         </Button>
//                     </Upload>
//                     <div className="sec-item">
//                         <Button icon={<DownloadOutlined />} onClick={handlersExportData}>
//                             Export Data
//                         </Button>
//                     </div>
//                 </section>
//                 <section className="sec">
//                     <div className="sec-item">
//                         <Button icon={<LineChartOutlined />} onClick={handlerStatisticsCount}>
//                             Count
//                         </Button>
//                     </div>
//                     <div className="sec-item vertical">
//                         <Input value={keywords} onChange={(e) => handlersTypeKeywords(e.target.value)} />
//                         <Button icon={<SearchOutlined />} onClick={handlerStatisticsSearch}>
//                             Search
//                         </Button>
//                     </div>
//                     <div className="sec-item">
//                         <Button icon={<DownloadOutlined />} onClick={handlersExportAudio}>
//                             Export Audio
//                         </Button>
//                     </div>
//                 </section>
//             </div>
//             <div className="main-inner-item-aside"></div>
//         </Layout>
//     );
// };
// export default Index;
