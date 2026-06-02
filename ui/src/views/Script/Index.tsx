import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
// prettier-ignore
import { 
    FastBackwardOutlined, 
    PauseCircleOutlined, 
    FastForwardOutlined, 
    PlayCircleOutlined, 
    LinkOutlined,
    RedoOutlined, 
    ScissorOutlined, 
    MinusCircleOutlined, 
    PlusCircleOutlined, 
    DownloadOutlined, 
    TeamOutlined, 
    DesktopOutlined, 
    PlusSquareOutlined, 
    MinusSquareOutlined 
} from "@ant-design/icons";
import { updateLoadingVideoScriptIndexWaver, updateScriptVideoCurrentTime, updateVideoScriptWaveformZoom } from "../../stores/reducers/status";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { ScriptParagraphWithSentences, ScriptSentence, ScriptScene, ScriptRole } from "../../types/Data";
import { Scrollbars } from "react-custom-scrollbars-2";
import Paragraphs, { ParagraphsRef } from "./Paragraphs";
import WaveSurfer from "wavesurfer.js";
import PanelLines from "./PanelLines";
import PanelRoles from "./PanelRoles";
import PanelScenes from "./PanelScenes";
import { strip } from "../../utils/number";
import { Domain } from "../../settings.js";
// prettier-ignore
import { scriptParagraphList, 
    scriptParagraphInsert,
    scriptParagraphUpdate, 
    scriptParagraphRemove, 
    scriptParagraphCut, 
    scriptSentenceInsert, 
    scriptSentenceInsertBatch, 
    scriptSentenceRemove, 
    scriptSentenceUpdate, 
    scriptRoleList, 
    scriptRoleCreate, 
    scriptRoleUpdate, 
    scriptRoleRemove, 
    scriptSceneList, 
    scriptSceneCreate, 
    scriptSceneUpdate, 
    scriptSceneRemove,
    audioClip
} from "../../api/requestAuth";
import "./Index.scss";

const AssetsPrefix = `${Domain}/database`;
const UploadPrefix = `${Domain}/upload/temp`;

const Index = () => {
    const dispatch = useDispatch();
    const scriptId = useSelector((state: RootState) => state.script.scriptId);
    const loading = useSelector((state: RootState) => state.status.loadingVideoScriptIndexWaver);
    const videoCurrentTime = useSelector((state: RootState) => state.status.scriptVideoCurrentTime);
    const waveformZoom = useSelector((state: RootState) => state.status.videoScriptWaveformZoom);
    const [listParagraph, setListParagraph] = useState<ScriptParagraphWithSentences[]>([]);
    const [listScriptRole, setListScriptRole] = useState<ScriptRole[]>([]);
    const [listScriptScene, setListScriptScene] = useState<ScriptScene[]>([]);
    const [scenesPanel, setScenesPanel] = useState(false);
    const [rolesPanel, setRolesPanel] = useState(false);
    const [linesPanel, setLinesPanel] = useState(false);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [clipTimeStart, setClipTimeStart] = useState<number>(0);
    const [clipTimeEnd, setClipTimeEnd] = useState<number>(1);
    const [clipLink, setClipLink] = useState("");
    const refVideo = useRef<HTMLVideoElement>(null);
    const refSlider = useRef<HTMLInputElement>(null);
    const refWavesurfer = useRef<WaveSurfer | null>(null);
    const refScrollbar = useRef<Scrollbars>(null);
    const refParagraphs = useRef<ParagraphsRef>(null);
    const refPanel = useRef<HTMLDivElement>(null);
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
    const onLocateTime = (time: number) => {
        fnLocateCurrentTime(time);
    };
    const onParagraphInsert = (prevId: number | null, nextId: number | null) => {
        scriptParagraphInsert({ scriptId, prevId, nextId }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed");
            }
        });
    };
    const onParagraphUpdate = (paragraphId: number, roleId: number, sceneId: number) => {
        scriptParagraphUpdate({ scriptId, paragraphId, roleId, sceneId }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed");
            }
        });
    };
    const onParagraphDelete = (paragraphId: number) => {
        scriptParagraphRemove({ scriptId, paragraphId }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed");
            }
        });
    };
    const onParagraphCut = (prevId: number | null, nextId: number | null, sentenceIds: number[]) => {
        scriptParagraphCut({ scriptId, prevId, nextId, sentenceIds }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed");
            }
        });
    };
    const onSentenceInsert = (paragraphId: number, prevId: number | null, nextId: number | null) => {
        scriptSentenceInsert({ scriptId, paragraphId, prevId, nextId }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed");
            }
        });
    };
    const onSentenceDelete = (paragraphId: number, sentenceId: number) => {
        scriptSentenceRemove({ scriptId, paragraphId, sentenceId }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed");
            }
        });
    };
    // prettier-ignore
    const onSentenceUpdate = (
        paragraphId: number, 
        sentenceId: number, 
        startTime: number, 
        endTime: number, 
        text: string, 
        piece: string
    ) => {
        scriptSentenceUpdate({ scriptId, paragraphId, sentenceId, startTime, endTime, text, piece }).then((res) => {
            if (res.code === 1) {
                apiGetParagraphList();
            } else {
                alert("Failed to update")
            }
        });
    };
    const onLinesSubmit = (sentences: ScriptSentence[]) => {
        scriptParagraphInsert({ scriptId, prevId: null, nextId: null }).then((res) => {
            if (res.code === 1) {
                scriptSentenceInsertBatch({ scriptId, paragraphId: res.data, sentences }).then((res) => {
                    if (res.code === 1) {
                        apiGetParagraphList();
                    } else {
                        alert("Failed");
                    }
                });
            }
        });
    };
    const onSceneChange = (time: number) => {
        fnLocateCurrentTime(time);
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
    const handlerVideoPlayBackward = async () => {
        if (refVideo.current) {
            const floatTime = Math.max(0, refVideo.current.currentTime - 0.1);
            const precision = Number(strip(floatTime).toFixed(3));
            refVideo.current.currentTime = precision;
            refWavesurfer.current?.seekTo(precision / refWavesurfer.current.getDuration());
            dispatch(updateScriptVideoCurrentTime(precision));
            await navigator.clipboard.writeText(`${precision}`);
        }
    };
    const handlerVideoPlayForward = async () => {
        if (refVideo.current) {
            const floatTime = refVideo.current.currentTime + 0.1;
            const precision = Number(strip(floatTime).toFixed(3));
            refVideo.current.currentTime = precision;
            refWavesurfer.current?.seekTo(precision / refWavesurfer.current.getDuration());
            dispatch(updateScriptVideoCurrentTime(precision));
            await navigator.clipboard.writeText(`${precision}`);
        }
    };
    const handlerClip = () => {
        if (clipTimeEnd > clipTimeStart) {
            audioClip({ scriptId, start: clipTimeStart, end: clipTimeEnd }).then((res) => {
                if (res.code === 1) {
                    setClipLink(`${UploadPrefix}/${res.data}`);
                } else {
                    alert("Failed");
                }
            });
        }
    };
    const handlerVideoPlay = () => {
        if (refVideo.current) {
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
    const handlerVideoSlide = (e: any) => {
        dispatch(updateVideoScriptWaveformZoom(e.target?.valueAsNumber));
    };
    const handlerCurrentTime = (v: any) => {
        fnLocateCurrentTime(v);
    };
    const handlerVideoTagOnEnded = () => {
        dispatch(updateScriptVideoCurrentTime(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlerVideoTagOnPaused = async (e: any) => {
        const precesion = Number(strip(e.target.currentTime).toFixed(3));
        dispatch(updateScriptVideoCurrentTime(precesion));
        await navigator.clipboard.writeText(`${precesion}`);
    };
    const handlerCreateWaver = async () => {
        if (!refWavesurfer.current) {
            try {
                dispatch(updateLoadingVideoScriptIndexWaver(1));
                const res = await fetch(`${AssetsPrefix}/${scriptId}/audiowaveform.json?${Date.now()}`);
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
                        const precesion = Number(strip(currentTime).toFixed(3));
                        dispatch(updateScriptVideoCurrentTime(precesion));
                        await navigator.clipboard.writeText(`${precesion}`);
                    });
                    refWavesurfer.current.on("loading", (percent) => {
                        // console.log("Loading", percent + "%");
                    });
                    refWavesurfer.current.once("ready", (duration) => {
                        console.log("Ready", duration + "s");
                        refWavesurfer.current?.seekTo(videoCurrentTime / refWavesurfer.current.getDuration());
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
    const apiGetParagraphList = async () => {
        scriptParagraphList({ scriptId }).then((res) => {
            if (res.code === 1) {
                setListParagraph(res.data);
            }
        });
    };
    const apiGetRoleList = () => {
        scriptRoleList({ scriptId }).then((res) => {
            if (res.code === 1) {
                setListScriptRole(res.data);
            }
        });
    };
    const apiGetSceneList = () => {
        scriptSceneList({ scriptId }).then((res) => {
            if (res.code === 1) {
                setListScriptScene(res.data);
            }
        });
    };
    const onRoleCreate = async (name: string) => {
        scriptRoleCreate({ scriptId, name }).then((res) => {
            if (res.code === 1) {
                apiGetRoleList();
            } else {
                alert("Failed");
            }
        });
    };
    const onRoleUpdate = (id: number, name: string) => {
        scriptRoleUpdate({ id, name }).then((res) => {
            if (res.code === 1) {
                apiGetRoleList();
            } else {
                alert("Failed");
            }
        });
    };
    const onRoleRemove = (id: number) => {
        scriptRoleRemove({ id }).then((res) => {
            if (res.code === 1) {
                apiGetRoleList();
            } else {
                alert("Failed");
            }
        });
    };
    const onSceneCreate = async (name: string) => {
        scriptSceneCreate({ scriptId, name }).then((res) => {
            if (res.code === 1) {
                apiGetSceneList();
            } else {
                alert("Failed");
            }
        });
    };
    const onSceneUpdate = (id: number, name: string) => {
        scriptSceneUpdate({ id, name }).then((res) => {
            if (res.code === 1) {
                apiGetSceneList();
            } else {
                alert("Failed");
            }
        });
    };
    const onSceneRemove = (id: number) => {
        scriptSceneRemove({ id }).then((res) => {
            if (res.code === 1) {
                apiGetSceneList();
            } else {
                alert("Failed");
            }
        });
    };
    const fnLocateCurrentTime = (time: number) => {
        if (refVideo.current) {
            refVideo.current.currentTime = time;
            refWavesurfer.current?.seekTo(time / refWavesurfer.current.getDuration());
            dispatch(updateScriptVideoCurrentTime(time));
        }
    };
    useEffect(() => {
        apiGetRoleList();
        apiGetSceneList();
        apiGetParagraphList();
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
                <video style={{ width: "100%", margin: "0 auto" }} id="video" onPause={handlerVideoTagOnPaused} onEnded={handlerVideoTagOnEnded} ref={refVideo}>
                    <source src={`${AssetsPrefix}/${scriptId}/video.mp4`} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
                    <div ref={refPanel} className="script-panel">
                        <Button icon={<PlusSquareOutlined />} onClick={handlersParagraphInsert} />
                        <Button icon={<MinusSquareOutlined />} onClick={handlersParagraphDelete} />
                        <Button icon={<ScissorOutlined />} onClick={handlersParagraphCut} />
                        <Button icon={<PlusCircleOutlined />} onClick={handlersSentenceInsert} />
                        <Button icon={<MinusCircleOutlined />} onClick={handlersSentenceDelete} />
                        <Button icon={<DownloadOutlined />} onClick={() => setLinesPanel(true)} />
                        <Button icon={<TeamOutlined />} onClick={() => setRolesPanel(true)} />
                        <Button icon={<DesktopOutlined />} onClick={() => setScenesPanel(true)} />
                    </div>
                    {/* prettier-ignore */}
                    <Paragraphs 
                        paragraphs={listParagraph} 
                        roles={listScriptRole} 
                        scenes={listScriptScene} 
                        onParagraphInsert={onParagraphInsert} 
                        onParagraphUpdate={onParagraphUpdate} 
                        onParagraphDelete={onParagraphDelete} 
                        onSentenceInsert={onSentenceInsert} 
                        onSentenceDelete={onSentenceDelete} 
                        onSentenceUpdate={onSentenceUpdate} 
                        onParagraphCut={onParagraphCut} 
                        onLocateTime={onLocateTime} 
                        onSceneChange={onSceneChange} 
                        ref={refParagraphs} />
                </Scrollbars>
                {/* prettier-ignore */}
                <PanelRoles 
                    roles={listScriptRole} 
                    open={rolesPanel} 
                    onCreate={onRoleCreate} 
                    onUpdate={onRoleUpdate} 
                    onRemove={onRoleRemove} 
                    onClose={() => 
                    setRolesPanel(false)} />
                {/* prettier-ignore */}
                <PanelScenes 
                    scenes={listScriptScene} 
                    open={scenesPanel} 
                    onCreate={onSceneCreate} 
                    onUpdate={onSceneUpdate} 
                    onRemove={onSceneRemove} 
                    onClose={() => setScenesPanel(false)} />
                <PanelLines open={linesPanel} onSubmit={onLinesSubmit} onClose={() => setLinesPanel(false)} />
            </div>
            <div className="main-inner-item-footer" style={{ height: "178px", position: "absolute", bottom: "0", left: "0" }}>
                <div className="panel">
                    <Button className="item" icon={<RedoOutlined />} onClick={handlerCreateWaver} loading={!!loading} />
                    <Button className="item" icon={<FastBackwardOutlined />} onClick={handlerVideoPlayBackward} />
                    <Button className="item" icon={playButton} onClick={handlerVideoPlay} />
                    <Button className="item" icon={<FastForwardOutlined />} onClick={handlerVideoPlayForward} />
                    <Input className="item" value={videoCurrentTime} onChange={(e) => handlerCurrentTime(e.target.value)} />
                    <Input className="item" value={clipTimeStart} onChange={(e) => setClipTimeStart(Number(e.target.value))} style={{ flex: "0 0 80px" }} />
                    <Input className="item" value={clipTimeEnd} onChange={(e) => setClipTimeEnd(Number(e.target.value))} style={{ flex: "0 0 80px" }} />
                    <Button className="item" icon={<RedoOutlined />} onClick={handlerClip} style={{ flex: "0 0 40px" }} />
                    <Button className="item" icon={<LinkOutlined />} onClick={(_) => window.open(clipLink)} style={{ flex: "0 0 40px" }} />
                    <input className="item" ref={refSlider} type="range" value={waveformZoom} onInput={handlerVideoSlide} />
                </div>
                <div id="waver" style={{ height: "146px" }}></div>
            </div>
        </Layout>
    );
};
export default Index;
