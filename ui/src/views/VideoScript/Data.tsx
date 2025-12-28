import React, { useState, useRef, useEffect } from "react";
import { Input, Space, Button, Tree, Select, InputNumber, Mentions } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, FileWordOutlined, MinusCircleOutlined, GoogleOutlined, PlusCircleOutlined, TeamOutlined, DesktopOutlined, PlusSquareOutlined, MinusSquareOutlined, ToolFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { vocabImagePronunciationMove, vocabImagePronunciationRemove } from "../../api/requestAuth";
import { updateScriptParagraphs, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptGrammars, updateScriptParagraphsByInsert, updateScriptParagraphsByDelete, updateScriptParagraphsByCut, updateScriptParagraphsByInsertSentence, updateScriptParagraphsByDeleteSentence, updateScriptParagraphRole, updateScriptParagraphScene, updateScriptSentenceText, updateScriptSentenceTime, updateScriptTimeOffset, updateScriptVocabs, updateScriptVocabsByDelete } from "../../stores/reducers/plan";
import { fnFloatToSRTTime, fnSRTTimeToFloat, fnGetMaxTimeFromSentences } from "../../utils/script";
import { Vocab as DataVocab } from "../../types/Data";
import EditorVocabs from "../CommonEditorVocabs/Index";
import EditorGrammars from "../CommonEditorGrammars/Index";
import EditorRoles from "./EditorRoles";
import EditorScenes from "./EditorScenes";
import "./Data.scss";

const Data = React.memo(() => {
    const dispatch = useDispatch();
    const plan = useSelector((state: RootState) => state.plan);
    const script = useSelector((state: RootState) => state.plan.script);
    const timeOffset = useSelector((state: RootState) => state.plan.scriptTimeOffset);
    const [renderVersion, setRenderVersion] = useState(0);
    const [vocabsEditor, setVocabsEditor] = useState(false);
    const [sceneEditor, setSceneEditor] = useState(false);
    const [rolesEditor, setRolesEditor] = useState(false);
    const [grammarsEditor, setGrammarsEditor] = useState(false);
    const refScrollbar = useRef<Scrollbars>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const refCurSentenceKey = useRef("0-0");
    const refScrollTop = useRef(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    // 使用方法：为已存在的字幕添加时间偏移，导出。再导入不再依赖偏移。
    const handlersSubUpdateTimeOffset = (value: number | null) => {
        if (value !== null && !isNaN(value)) {
            const firstStartTime = script.paragraphs[0].sentences[0].startTime;
            const firstStartTimeN = fnSRTTimeToFloat(firstStartTime) + value;
            if (firstStartTimeN > 0) {
                dispatch(updateScriptTimeOffset(value));
                setRenderVersion((prev) => prev + 1);
            }
        }
    };
    const handlersSubInsertParagraph = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateScriptParagraphsByInsert({ pKey: parseInt(keyInfo[0]) }));
            setRenderVersion((prev) => prev + 1);
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
        }
    };
    const handlersSubDeleteParagraph = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateScriptParagraphsByDelete({ pKey: parseInt(keyInfo[0]) }));
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubCutParagraph = () => {
        const confirmed = window.confirm("Do you confirm to cut?");
        if (confirmed) {
            if (refCurSentenceKey.current) {
                const keyInfo = refCurSentenceKey.current.split("-");
                dispatch(updateScriptParagraphsByCut({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
                setRenderVersion((prev) => prev + 1);
            }
        }
    };
    const handlersSubInsertSentence = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateScriptParagraphsByInsertSentence({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubDeleteSentence = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateScriptParagraphsByDeleteSentence({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubUpdateName = (value: string) => {
        dispatch(updateScriptTitle({ text: value.trim() }));
    };
    const handlersSubUpdateStartTime = (event: any, key: string) => {
        const keyInfo = key.split("-");
        dispatch(updateScriptSentenceTime({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), type: 0, text: event.target.value.trim() }));
    };
    const handlersSubUpdateEndTime = (event: any, key: string) => {
        if (event.target.value) {
            const keyInfo = key.split("-");
            dispatch(updateScriptSentenceTime({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), type: 1, text: event.target.value.trim() }));
        }
    };
    const handlersSubUpdateText = (event: any, key: string) => {
        if (event.target.value) {
            const keyInfo = key.split("-");
            // prettier-ignore
            const text = event.target.value.split("\n---\n").map((v: string) => {
                const s = v.split("\n");
                return s[1] === undefined ? `${s[0].trim()}` : `${s[0].trim()}\n${s[1].trim()}`;
            }).join("\n---\n");
            dispatch(updateScriptSentenceText({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), text: text }));
        }
    };
    const handlersSubUpdateRole = (value: string, key: string) => {
        dispatch(updateScriptParagraphRole({ pKey: parseInt(key), text: value.trim() }));
    };
    const handlersVocabsEditorOpen = () => {
        setVocabsEditor(true);
    };
    const handlersVocabsEditorClose = () => {
        setVocabsEditor(false);
    };
    const handlersVocabsEditorSubmit = async (vocab: DataVocab) => {
        if (vocab.text && vocab.pronunciation) {
            const res = await vocabImagePronunciationMove({ plan: plan.hash, vocabImage: vocab.image ? vocab.image : "a.txt", vocabPronunciation: vocab.pronunciation });
            if (res.code === 1) {
                dispatch(updateScriptVocabs(vocab));
            }
        }
    };
    const handlersVocabsEditorRemove = async (index: number) => {
        dispatch(updateScriptVocabsByDelete(index));
        const vocab = script.vocabs[index];
        if (vocab && (vocab.image || vocab.pronunciation)) {
            await vocabImagePronunciationRemove({ plan: plan.hash, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
        }
    };
    const handlersScenesEditorOpen = () => {
        setSceneEditor(true);
    };
    const handlersScenesEditorClose = () => {
        setSceneEditor(false);
    };
    const handlersScenesEditorSubmit = async (scenes: string[]) => {
        dispatch(updateScriptScenes(scenes));
    };
    const handlersGrammarsEditorOpen = () => {
        setGrammarsEditor(true);
    };
    const handlersGrammarsEditorClose = () => {
        setGrammarsEditor(false);
    };
    const handlersGrammarsEditorSubmit = async (grammars: string[]) => {
        dispatch(updateScriptGrammars(grammars));
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
    const handlersSubUpdateScene = (value: string, key: string) => {
        dispatch(updateScriptParagraphScene({ pKey: parseInt(key), text: value.trim() }));
    };
    const handlersSubSetCurSentence = (key: string) => {
        refCurSentenceKey.current = key;
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
    const handlersResortData = () => {
        const paragraphs = [...script.paragraphs];
        const n = paragraphs.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                const maxTime = fnGetMaxTimeFromSentences(paragraphs[j].sentences);
                const maxTimeNext = fnGetMaxTimeFromSentences(paragraphs[j + 1].sentences);
                if (maxTime > maxTimeNext) {
                    const temp = paragraphs[j];
                    paragraphs[j] = paragraphs[j + 1];
                    paragraphs[j + 1] = temp;
                }
            }
        }
        const newParagraphs = paragraphs.map((paragraph, pk) => {
            const newValue = { ...paragraph };
            newValue.key = `${pk}`;
            newValue.sentences = newValue.sentences.map((sentence, sk) => {
                const newValue = { ...sentence };
                newValue.key = `${pk}-${sk}`;
                return newValue;
            });
            return newValue;
        });
        dispatch(updateScriptParagraphs(newParagraphs));
        setRenderVersion((prev) => prev + 1);
        alert("Succeed.");
    };
    const filterPlusOffset = (SRTTime: string): string => {
        if (timeOffset) {
            const res = fnSRTTimeToFloat(SRTTime) + timeOffset;
            return res > 0 ? fnFloatToSRTTime(res) : SRTTime;
        } else {
            return SRTTime;
        }
    };
    const filterItemRoles = (roles: string[]): string => {
        return roles.length > 0 ? roles.map((v: string) => `@${v}`).join(" ") : "";
    };
    useEffect(() => {
        return () => {};
    }, []);
    useEffect(() => {
        refScrollbar.current?.scrollTop(refScrollTop.current);
    }, [renderVersion]);
    return (
        <Scrollbars id="video-script-data" key={renderVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
            <div ref={refPanel} className="script-panel">
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubInsertParagraph}>
                    P
                </Button>
                <Button icon={<MinusSquareOutlined />} onClick={handlersSubDeleteParagraph}>
                    P
                </Button>
                <Button icon={<ScissorOutlined />} onClick={handlersSubCutParagraph}>
                    P
                </Button>
                <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertSentence}>
                    S
                </Button>
                <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteSentence}>
                    S
                </Button>
                <InputNumber min={-10000.0} max={10000.0} step={0.01} value={timeOffset} onChange={(v) => handlersSubUpdateTimeOffset(v)} style={{ flex: "0 0 80px" }} />
                <Button icon={<ToolFilled />} onClick={handlersResortData}>
                    Script
                </Button>
                <Button icon={<TeamOutlined />} onClick={handlersRolesEditorOpen}>
                    Roles
                </Button>
                <Button icon={<DesktopOutlined />} onClick={handlersScenesEditorOpen}>
                    Scenes
                </Button>
                <Button icon={<FileWordOutlined />} onClick={handlersVocabsEditorOpen}>
                    Vocabs
                </Button>
                <Button icon={<GoogleOutlined />} onClick={handlersGrammarsEditorOpen}>
                    Grammars
                </Button>
            </div>
            <div className="script-meta">
                <Input defaultValue={script.title} onBlur={(e) => handlersSubUpdateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
            </div>
            <Tree
                className="script-tree"
                selectable={false}
                style={{ height: "100%", borderRadius: "0" }}
                fieldNames={{ key: "key", children: "sentences" }}
                showLine
                defaultExpandAll
                treeData={script.paragraphs}
                titleRender={(item: any) => {
                    return item.roles ? (
                        <div className="tree-item-meta">
                            <Select size="small" onChange={(v) => handlersSubUpdateScene(v, item.key)} defaultValue={item.scene} options={script.scenes.map((v) => ({ label: v, value: v }))} />
                            <Mentions autoSize onChange={(v) => handlersSubUpdateRole(v, item.key)} defaultValue={filterItemRoles(item.roles)} options={script.roles.map((v) => ({ label: v, value: v }))} placeholder="@Role1-角色1 @Role2-角色2" />
                        </div>
                    ) : (
                        <div style={{ width: "100%" }}>
                            <div style={{ width: "100%", display: "flex" }}>
                                <Space size="small" style={{ flex: "0 0 100px", rowGap: "4px", overflow: "hidden" }} direction="vertical" className="time-test">
                                    <Input size="small" defaultValue={filterPlusOffset(item.startTime)} onBlur={(e) => handlersSubUpdateStartTime(e, item.key)} style={{ borderRadius: 0 }} placeholder="00:00:00,000" />
                                    <Input size="small" defaultValue={filterPlusOffset(item.endTime)} onBlur={(e) => handlersSubUpdateEndTime(e, item.key)} style={{ borderRadius: 0 }} placeholder="00:00:00,001" />
                                </Space>
                                <Input.TextArea autoSize defaultValue={item.texts.join("\n---\n")} onFocus={(e) => handlersSubSetCurSentence(item.key)} onBlur={(e) => handlersSubUpdateText(e, item.key)} style={{ flex: 1, fontSize: "12px", minHeight: "52px", marginLeft: "4px", borderRadius: "0", color: "#000" }} />
                            </div>
                        </div>
                    );
                }}
            />
            <EditorRoles roles={script.roles} open={rolesEditor} onClose={handlersRolesEditorClose} onSubmit={handlersRolesEditorSubmit} />
            <EditorScenes scenes={script.scenes} open={sceneEditor} onClose={handlersScenesEditorClose} onSubmit={handlersScenesEditorSubmit} />
            <EditorVocabs vocabs={plan.data.vocabs} open={vocabsEditor} onClose={handlersVocabsEditorClose} onSubmit={handlersVocabsEditorSubmit} onRemove={handlersVocabsEditorRemove} />
            <EditorGrammars grammars={script.grammars} open={grammarsEditor} onClose={handlersGrammarsEditorClose} onSubmit={handlersGrammarsEditorSubmit} />
            <section style={{ display: "none" }}>
                <audio ref={refAudio}></audio>
            </section>
        </Scrollbars>
    );
});
export default Data;
