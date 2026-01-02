import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { PlusCircleOutlined, UploadOutlined, DownloadOutlined, LineChartOutlined, SearchOutlined } from "@ant-design/icons";
import store, { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateHash, updateType, updateVideoMatchingSentence, updateVideoTranslateMatchingSentence, updateProcessings, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScriptData, updateDiaryData } from "../../stores/reducers/plan";
import { clearToken } from "../../stores/reducers/auth";
import { fnValidateVideoScript } from "../../utils/script";
import { fnValidateDiary } from "../../utils/diary";
import { videoImport, videoInit, importData, exportData, planCountVocabs, planSearch, concatAudio } from "../../api/requestAuth";
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const plan = useSelector((state: RootState) => state.plan);
    const script = useSelector((state: RootState) => state.plan.script);
    const diary = useSelector((state: RootState) => state.plan.diary);
    const processings = useSelector((state: RootState) => state.plan.processings);
    const [keywords, setKeywords] = useState("");
    const handlersImportVideo = async (file: any) => {
        if (/^(.+?)\.(mp4)$/g.test(file.name) && file.type === "video/mp4") {
            dispatch(updateProcessings({ buttonID: 0, buttonStatus: true }));
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await videoImport(formData);
                if (res.code === 1) {
                    dispatch(updateHash(res.data.plan));
                    dispatch(updateVideoMatchingSentence(0));
                    dispatch(updateVideoTranslateMatchingSentence(0));
                    dispatch(updateVideoURL(URL.createObjectURL(file)));
                    const resWaveform = await videoInit({ plan: res.data.plan });
                    if (resWaveform.code === 1) {
                        dispatch(updateVideoAudioWaverURL(resWaveform.data.audiowaveform));
                        dispatch(updateVideoAudioURL(resWaveform.data.audio));
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
        if (plan.hash && plan.videoURL) {
            if (/^(.+?)\.(zip|ZIP)$/g.test(file.name) && file.type === "application/x-zip-compressed") {
                dispatch(updateProcessings({ buttonID: 1, buttonStatus: true }));
                try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const res = await importData({ plan: plan.hash }, formData);
                    if (res.code === 1) {
                        const resScript = await fetch(`${Domain}/data/${plan.hash}/script.json?${Date.now()}`);
                        const script = await resScript.json();
                        if (fnValidateVideoScript(script)) {
                            if (script.title) {
                                dispatch(updateType(1));
                                dispatch(updateScriptData(script));
                            }
                        } else {
                            alert(`Script format is invalid.`);
                        }
                        const resDiary = await fetch(`${Domain}/data/${plan.hash}/diary.json?${Date.now()}`);
                        const diary = await resDiary.json();
                        if (fnValidateDiary(diary)) {
                            if (diary.title) {
                                dispatch(updateType(2));
                                dispatch(updateDiaryData(diary));
                            }
                        } else {
                            alert(`Diary format is invalid.`);
                        }
                        document.title = script.title || diary.title;
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
        if (plan.hash && plan.videoURL && plan.data.title) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `data.zip`,
                    types: [{ description: `data`, accept: { "application/zip": [".zip"] } }],
                });
                const writable = await handle.createWritable();
                const resBlob = await exportData({ plan: plan.hash });
                const blob = new Blob([resBlob], { type: "application/zip" });
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error("save error: ", error);
            }
        } else {
            alert("Please create a plan or type a title.");
        }
    };
    const handlersExportAudio = async () => {
        if (plan.hash && plan.videoURL) {
            try {
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `${script.title}.mp3`,
                    types: [{ description: script.title, accept: { "audio/mpeg": [".mp3"] } }],
                });
                const writable = await handle.createWritable();
                const resBlob = await concatAudio({ plan: plan.hash });
                const blob = new Blob([resBlob], { type: "audio/mpeg" });
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error("save error: ", error);
            }
        } else {
            alert("Please create a plan.");
        }
    };
    const handlersPlanCount = async () => {
        const res = await planCountVocabs();
        alert(`Plan: ${res.data.planCount}, Plan vocabs: ${res.data.planVocabsCount}`);
    };
    const handlersPlanSearch = async () => {
        if (keywords) {
            const res = await planSearch({ keywords: keywords });
            alert(res.data.map((v: string, k: number) => `${k}. ${v}`).join("\r\n"));
        }
    };
    const handlersTypeKeywords = (value: string) => {
        setKeywords(value);
    };
    const handlersLogout = () => {
        dispatch(clearToken());
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Layout className="main-inner" id="video-settings">
            <div className="main-inner-item-main">
                <section className="sec">
                    <Upload className="sec-item" showUploadList={false} beforeUpload={handlersImportVideo} disabled={processings[0] || !!plan.data.title}>
                        <Button icon={<PlusCircleOutlined />} disabled={!!plan.data.title} loading={processings[0]}>
                            Upload a video
                        </Button>
                    </Upload>
                    <div className="sec-item">
                        <Input addonBefore="Plan" value={plan.hash} disabled />
                    </div>
                </section>
                <section className="sec">
                    <Upload className="sec-item" beforeUpload={handlersImportData} showUploadList={false} disabled={!!plan.data.title}>
                        <Button icon={<UploadOutlined />} disabled={!!plan.data.title}>
                            Import data
                        </Button>
                    </Upload>
                    <div className="sec-item">
                        <Button icon={<DownloadOutlined />} onClick={handlersExportData}>
                            Export data
                        </Button>
                    </div>
                    <div className="sec-item">
                        <Button icon={<DownloadOutlined />} onClick={handlersExportAudio}>
                            Export Audio
                        </Button>
                    </div>
                </section>
                <section className="sec">
                    <div className="sec-item">
                        <Button icon={<LineChartOutlined />} onClick={handlersPlanCount}>
                            Count
                        </Button>
                    </div>
                    <div className="sec-item">
                        <Input addonBefore="Keywords" value={keywords} onChange={(e) => handlersTypeKeywords(e.target.value)} />
                    </div>
                    <div className="sec-item">
                        <Button icon={<SearchOutlined />} onClick={handlersPlanSearch}>
                            Search
                        </Button>
                    </div>
                </section>
                <div className="tips">
                    <p>【基础】</p>
                    <p>1. 深刻理解台词中的单词</p>
                    <p>2. 深刻理解台词中的语法</p>
                    <p>&nbsp;</p>
                    <p>&nbsp;</p>
                    <p>【听力】</p>
                    <p>1. 每日大量朗读、背诵视频台词，听清并模仿其中连读、弱读</p>
                    <p>2. 每日大量听视频台词中的单词、短语，并快速选出意思</p>
                    <p>3. 每日少量精听，写下视频台词</p>
                    <p>&nbsp;</p>
                    <p>&nbsp;</p>
                    <p>【口语】</p>
                    <p>1. 提高汉-英的词汇量。每日写出视频台词中，汉语版的单词、短语、句子</p>
                    <p>2. 写日记。</p>
                </div>
            </div>
        </Layout>
    );
};
export default Index;
