import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Switch, Tooltip } from "antd";
import { FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, RedoOutlined, ScissorOutlined, FileWordFilled, MinusCircleOutlined, GoogleOutlined, PlusCircleOutlined, DownloadOutlined, TeamOutlined, DesktopOutlined, PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { updateLoadingVideoScriptIndexWaver, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom } from "../../stores/reducers/status";
import { updateScriptParagraphs, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptVocab, updateScriptGrammar } from "../../stores/reducers/data";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { fnFloatToSRTTime, fnSRTTimeToFloat, fnIsSRTTime } from "../../utils/script";
import { Vocab as DataVocab, Scene as DataScene, Paragraph as DataParagrap, Grammar as DataGrammar } from "../../types/Data";
import { Scrollbars } from "react-custom-scrollbars-2";
import Paragraphs, { ParagraphsRef } from "./Paragraphs";
import WaveSurfer from "wavesurfer.js";
import EditorLines from "./EditorLines";
import EditorVocab from "./EditorVocab";
import EditorGrammar from "./EditorGrammar";
import EditorRoles from "./EditorRoles";
import EditorScenes from "./EditorScenes";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const data = useSelector((state: RootState) => state.data);
    const script = useSelector((state: RootState) => state.data.script);
    const loading = useSelector((state: RootState) => state.status.LoadingVideoScriptIndexWaver);
    const currentTime = useSelector((state: RootState) => state.status.videoScriptCurrentTime);
    const waveformZoom = useSelector((state: RootState) => state.status.videoScriptWaveformZoom);
    const [vocabEditor, setVocabEditor] = useState(false);
    const [grammarEditor, setGrammarEditor] = useState(false);
    const [sceneEditor, setSceneEditor] = useState(false);
    const [rolesEditor, setRolesEditor] = useState(false);
    const [linesEditor, setLinesEditor] = useState(false);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refSlider = useRef<HTMLInputElement>(null);
    const refWavesurfer = useRef<WaveSurfer | null>(null);
    const refScrollbar = useRef<Scrollbars>(null);
    const refParagraphs = useRef<ParagraphsRef>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const handlersScriptNameUpdate = (value: string) => {
        dispatch(updateScriptTitle({ text: value.trim() }));
    };
    const handlersSentenceInsert = () => {
        refParagraphs.current?.insertSentence();
    };
    const handlersSentenceDelete = () => {
        refParagraphs.current?.deleteSentence();
    };
    const handlersParagraphInsert = () => {
        refParagraphs.current?.insertParagraph();
    };
    const handlersParagraphDelete = () => {
        const confirmed = window.confirm("Do you confirm to delete?");
        if (confirmed) {
            refParagraphs.current?.deleteParagraph();
        }
    };
    const handlersParagraphCut = () => {
        const confirmed = window.confirm("Do you confirm to cut?");
        if (confirmed) {
            refParagraphs.current?.cutParagraph();
        }
    };
    const handlersParagraphsSubmit = (paragraphs: DataParagrap[]) => {
        dispatch(updateScriptParagraphs(paragraphs));
    };
    const handlersParagraphsLocateTime = (time: string) => {
        fnLocateCurrentTime(time);
    };
    const handlersVocabEditorOpen = () => {
        setVocabEditor(true);
    };
    const handlersVocabEditorClose = () => {
        setVocabEditor(false);
    };
    const handlersVocabEditorSubmit = async (vocabList: DataVocab[]) => {
        dispatch(updateScriptVocab(vocabList));
    };
    const handlersGrammarEditorSubmit = (grammarList: DataGrammar[]) => {
        dispatch(updateScriptGrammar(grammarList));
    };
    const handlersGrammarEditorOpen = () => {
        setGrammarEditor(true);
    };
    const handlersGrammarEditorClose = () => {
        setGrammarEditor(false);
    };
    const handlersScenesEditorOpen = () => {
        setSceneEditor(true);
    };
    const handlersScenesEditorClose = () => {
        setSceneEditor(false);
    };
    const handlersScenesEditorSubmit = async (scenes: DataScene[]) => {
        dispatch(updateScriptScenes(scenes));
    };
    const handlersRolesEditorOpen = () => {
        setRolesEditor(true);
    };
    const handlersRolesEditorClose = () => {
        setRolesEditor(false);
    };
    const handlersRolesEditorSubmit = async (roles: string[]) => {
        dispatch(updateScriptRoles(roles));
    };
    const handlersLinesEditorSubmit = (paragraphs: DataParagrap[]) => {
        dispatch(updateScriptParagraphs(paragraphs));
    };
    const handlersLinesEditorOpen = () => {
        setLinesEditor(true);
    };
    const handlersLinesEditorClose = () => {
        setLinesEditor(false);
    };
    const handlersScroll = (event: React.UIEvent<HTMLElement>) => {
        const target = event.currentTarget;
        if (refPanel.current) {
            if (target.scrollTop > 50) {
                refPanel.current.classList.add("fixed");
            } else {
                refPanel.current.classList.remove("fixed");
            }
        }
    };
    const handlersVideoPlayBackward = async () => {
        if (refVideo.current && data.videoURL) {
            const floatTime = Math.max(0, refVideo.current.currentTime - 0.1);
            refVideo.current.currentTime = floatTime;
            refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
            dispatch(updateVideoScriptCurrentTime(floatTime));
            await navigator.clipboard.writeText(`${fnFloatToSRTTime(floatTime)}`);
        }
    };
    const handlersVideoPlayForward = async () => {
        if (refVideo.current && data.videoURL) {
            const floatTime = refVideo.current.currentTime + 0.1;
            refVideo.current.currentTime = floatTime;
            refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
            dispatch(updateVideoScriptCurrentTime(floatTime));
            await navigator.clipboard.writeText(`${fnFloatToSRTTime(floatTime)}`);
        }
    };
    const handlersVideoPlay = () => {
        if (refVideo.current && data.videoURL) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current
                    .play()
                    .then()
                    .catch((err) => {
                        console.error("播放失败:", err);
                    });
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
                if (refWavesurfer.current) {
                    refWavesurfer.current.pause();
                }
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersVideoSlide = (e: any) => {
        dispatch(updateVideoScriptWaveformZoom(e.target?.valueAsNumber));
    };
    const handlersCurrentTime = (v: any) => {
        fnLocateCurrentTime(v);
    };
    const handlersVideoTagOnTimeUpdate = (e: any) => {
        // console.log("video current time:", e.target.currentTime);
        // console.log("video current time SRC:", fnFloatToSRTTime(e.target.currentTime));
    };
    const handlersVideoTagOnEnded = () => {
        dispatch(updateVideoScriptCurrentTime(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTagOnPaused = async (e: any) => {
        dispatch(updateVideoScriptCurrentTime(e.target.currentTime));
        await navigator.clipboard.writeText(fnFloatToSRTTime(e.target.currentTime));
    };
    const handlersCreateWaver = async () => {
        if (!refWavesurfer.current) {
            try {
                dispatch(updateLoadingVideoScriptIndexWaver(1));
                const res = await fetch(`${data.videoAudioWaveformURL}?${Date.now()}`);
                const jsonData = await res.json();
                if (jsonData.data.length > 0) {
                    refWavesurfer.current = WaveSurfer.create({
                        container: "#waver",
                        media: refVideo.current || undefined,
                        waveColor: "rgb(200, 0, 200)",
                        progressColor: "rgb(100, 0, 100)",
                        interact: true,
                        height: 129,
                        cursorColor: "rgb(87, 87, 89)",
                        autoScroll: true,
                        dragToSeek: true,
                        normalize: true, // 把整段音频的最大振幅“压”到满值，细微部分相对更明显
                        peaks: jsonData.data,
                        minPxPerSec: 10,
                    });
                    refWavesurfer.current.on("click", async () => {
                        const currentTime = refWavesurfer.current?.getCurrentTime() || 0;
                        dispatch(updateVideoScriptCurrentTime(currentTime));
                        await navigator.clipboard.writeText(`${fnFloatToSRTTime(currentTime)}`);
                    });
                    // refWavesurfer.current.on("drag", async (relativeX) => {
                    //     const currentTime = refWavesurfer.current?.getCurrentTime() || 0;
                    //     dispatch(updateVideoScriptCurrentTime(currentTime));
                    //     await navigator.clipboard.writeText(`${fnFloatToSRTTime(currentTime)}`);
                    // });
                    refWavesurfer.current.on("loading", (percent) => {
                        // console.log("Loading", percent + "%");
                    });
                    refWavesurfer.current.once("ready", (duration) => {
                        console.log("Ready", duration + "s");
                        refWavesurfer.current?.seekTo(currentTime / refWavesurfer.current.getDuration());
                        refWavesurfer.current?.zoom(waveformZoom);
                        dispatch(updateLoadingVideoScriptIndexWaver(0));
                    });
                    refWavesurfer.current.once("decode", () => {
                        refSlider.current?.addEventListener("input", (e: any) => {
                            if (refWavesurfer.current?.getDecodedData()) {
                                refWavesurfer.current?.zoom(e.target?.valueAsNumber);
                            } else {
                                console.log("Audio is loading...");
                            }
                        });
                    });
                }
            } catch (err: any) {
                console.error(err.message);
            }
        }
    };
    const fnLocateCurrentTime = (time: string) => {
        const floatTime = fnIsSRTTime(time) ? fnSRTTimeToFloat(time) : Number(time);
        if (typeof floatTime === "number" && !isNaN(floatTime)) {
            if (refVideo.current && data.videoURL) {
                refVideo.current.currentTime = floatTime;
                refWavesurfer.current?.seekTo(floatTime / refWavesurfer.current.getDuration());
                dispatch(updateVideoScriptCurrentTime(floatTime));
            }
        }
    };
    useEffect(() => {
        return () => {
            if (refWavesurfer.current) {
                refWavesurfer.current.destroy();
                refWavesurfer.current = null;
            }
        };
    }, []);
    return (
        <Layout id="script-index" className="main-inner" style={{ position: "relative", padding: "0 0 178px", margin: "0" }}>
            <div className="main-inner-item-aside">
                <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlersVideoTagOnPaused} onEnded={handlersVideoTagOnEnded} onTimeUpdate={handlersVideoTagOnTimeUpdate} ref={refVideo}>
                    <source src={data.videoURL} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
                    <div ref={refPanel} className="script-panel">
                        <Tooltip title={`Add a Paragraph`}>
                            <Button icon={<PlusSquareOutlined />} onClick={handlersParagraphInsert} />
                        </Tooltip>
                        <Tooltip title={`Remove a Paragraph`}>
                            <Button icon={<MinusSquareOutlined />} onClick={handlersParagraphDelete} />
                        </Tooltip>
                        <Tooltip title={`Cut a Paragraph`}>
                            <Button icon={<ScissorOutlined />} onClick={handlersParagraphCut} />
                        </Tooltip>
                        <Tooltip title={`Insert a Sentence`}>
                            <Button icon={<PlusCircleOutlined />} onClick={handlersSentenceInsert} />
                        </Tooltip>
                        <Tooltip title={`Remove a Sentence`}>
                            <Button icon={<MinusCircleOutlined />} onClick={handlersSentenceDelete} />
                        </Tooltip>
                        <Tooltip title={`Import Lines`}>
                            <Button icon={<DownloadOutlined />} onClick={handlersLinesEditorOpen} />
                        </Tooltip>
                        <Tooltip title={`Edit Roles`}>
                            <Button icon={<TeamOutlined />} onClick={handlersRolesEditorOpen} />
                        </Tooltip>
                        <Tooltip title={`Edit Scenes`}>
                            <Button icon={<DesktopOutlined />} onClick={handlersScenesEditorOpen} />
                        </Tooltip>
                        <Tooltip title={`Edit Vocab`}>
                            <Button icon={<FileWordFilled />} onClick={handlersVocabEditorOpen} />
                        </Tooltip>
                        <Tooltip title={`Edit Grammar`}>
                            <Button icon={<GoogleOutlined />} onClick={handlersGrammarEditorOpen} />
                        </Tooltip>
                    </div>
                    <div className="script-meta">
                        <Input defaultValue={script.title} onBlur={(e) => handlersScriptNameUpdate(e.target.value)} placeholder="Script Title" />
                    </div>
                    <Paragraphs paragraphs={script.paragraphs} scenes={script.scenes} roles={script.roles} onLocateTime={handlersParagraphsLocateTime} onSubmit={handlersParagraphsSubmit} ref={refParagraphs} />
                </Scrollbars>
                <EditorRoles roles={script.roles} open={rolesEditor} onClose={handlersRolesEditorClose} onSubmit={handlersRolesEditorSubmit} />
                <EditorScenes scenes={script.scenes} open={sceneEditor} onClose={handlersScenesEditorClose} onSubmit={handlersScenesEditorSubmit} />
                <EditorLines open={linesEditor} onClose={handlersLinesEditorClose} onSubmit={handlersLinesEditorSubmit} />
                <EditorVocab hash={data.videoHash} list={script.vocab} open={vocabEditor} onClose={handlersVocabEditorClose} onSubmit={handlersVocabEditorSubmit} />
                <EditorGrammar grammarList={script.grammar} open={grammarEditor} onClose={handlersGrammarEditorClose} onSubmit={handlersGrammarEditorSubmit} />
            </div>
            <div className="main-inner-item-footer" style={{ height: "178px", position: "absolute", bottom: "0", left: "0" }}>
                <div className="panel">
                    <Button className="item" icon={<RedoOutlined />} onClick={handlersCreateWaver} loading={!!loading} />
                    <Button className="item" icon={<FastBackwardOutlined />} onClick={handlersVideoPlayBackward} />
                    <Button className="item" icon={playButton} onClick={handlersVideoPlay} />
                    <Button className="item" icon={<FastForwardOutlined />} onClick={handlersVideoPlayForward} />
                    <Input className="item" value={fnFloatToSRTTime(currentTime)} onChange={(e) => handlersCurrentTime(e.target.value)} />
                    <input className="item" ref={refSlider} type="range" value={waveformZoom} onInput={handlersVideoSlide} />
                </div>
                <div id="waver" style={{ height: "146px" }}></div>
            </div>
        </Layout>
    );
};
export default Index;
