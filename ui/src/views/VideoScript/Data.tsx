import React, { useState, useRef, useEffect } from "react";
import { Input, Space, Button, Tree, Select, InputNumber, Mentions, Drawer, Upload } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, MinusCircleOutlined, PlusCircleOutlined, DownCircleOutlined, PlusSquareOutlined, MinusSquareOutlined, ToolFilled, RedoOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { vocabImageUpload, vocabPronunciationUpload, vocabPronunciationGenerate, vocabImagePronunciationMove, vocabImagePronunciationRemove } from "../../api/requestAuth";
import { updateScriptParagraphs, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptParagraphsByInsert, updateScriptParagraphsByDelete, updateScriptParagraphsByCut, updateScriptParagraphsByInsertSentence, updateScriptParagraphsByDeleteSentence, updateScriptParagraphRole, updateScriptParagraphScene, updateScriptSentenceText, updateScriptSentenceTime, updateScriptTimeOffset, updateScriptVocabs, updateScriptVocabsByDelete } from "../../stores/reducers/plan";
import { fnFloatToSRTTime, fnSRTTimeToFloat, fnGetMaxTimeFromSentences, fnParseVocabs } from "../../utils/script";
import { Vocab as DataVocab } from "../../types/Data";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import Vocab from "./Vocab";
import Grammar from "./Grammar";
import "./Data.scss";

const Data = React.memo(() => {
    const dispatch = useDispatch();
    const plan = useSelector((state: RootState) => state.plan);
    const script = useSelector((state: RootState) => state.plan.script);
    const timeOffset = useSelector((state: RootState) => state.plan.script.timeOffset);
    const [vocab, setVocab] = useState<DataVocab>({ text: "", image: "", voice: 0, speed: 150, pronunciation: "" });
    const [parsedVocabs, setParsedVocabs] = useState("");
    const [renderVersion, setRenderVersion] = useState(0);
    const [vocabPanel, setVocabPanel] = useState(false);
    const [vocabActive, setVocabActive] = useState(0);
    const refScrollbar = useRef<Scrollbars>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const refCurSentenceKey = useRef("0-0");
    const refScrollTop = useRef(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    // 使用方法：为已存在的字幕添加时间偏移，导出。再导入不再依赖偏移。
    const handlersSubUpdateTimeOffset = (value: number | null) => {
        if (value !== null && !isNaN(value)) {
            const firstStartTime = script.data.paragraphs[0].sentences[0].startTime;
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
    const handlersSubUpdateRoles = (value: string) => {
        if (value.trim() !== script.data.roles.join("/")) {
            dispatch(updateScriptRoles({ text: value.trim() }));
        }
    };
    const handlersSubUpdateScenes = (value: string) => {
        if (value.trim() !== script.data.scenes.join("/")) {
            dispatch(updateScriptScenes({ text: value.trim() }));
        }
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
    const handlersSwitchVocabPanel = () => {
        setVocabPanel(!vocabPanel);
    };
    const handlersParseVocabs = (text: string) => {
        setParsedVocabs(fnParseVocabs(text));
    };
    const handlersUpdateVocabText = (value: string) => {
        setVocab({ ...vocab, text: value });
    };
    const handlersUpdateVocabPronounceVoice = (value: number) => {
        setVocab({ ...vocab, voice: value });
    };
    const handlersUpdateVocabPronounceSpeed = (value: number) => {
        setVocab({ ...vocab, speed: value });
    };
    const handlersUpdateVocabImage = async (file: any) => {
        if (vocab.text) {
            if (/^(.+?)\.(png|jpg)$/g.test(file.name) && (file.type === "image/png" || file.type === "image/jpeg")) {
                try {
                    const part = vocab.text.split(" | ");
                    const nameEN = part[0].replaceAll(/[\s\,\/\:\?\.]+/g, "_");
                    const nameCNHash = md5(part[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.png`;
                    const formData = new FormData();
                    formData.append("file", file, name);
                    const res = await vocabImageUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, image: res.data.filename });
                    }
                } catch (e: any) {
                    alert(e.message);
                }
            } else {
                alert("Please upload a png or jpg image.");
            }
        } else {
            alert("Please type vocab text.");
        }
    };
    const handlersPlayVocabPronunciation = async () => {
        if (vocab.pronunciation) {
            if (refAudio.current) {
                refAudio.current.play();
            }
        }
    };
    const handlersGenerateVocabPronunciation = async () => {
        if (vocab.text) {
            try {
                const part = vocab.text.split(" | ");
                const content = part[0].replaceAll("/", ", ");
                const filenameEN = part[0].replaceAll(/[\s\,\/\:\?\.]+/g, "_");
                const filenameCNHash = md5(part[2]).slice(25);
                const filename = `${filenameEN}_${filenameCNHash}.mp3`;
                const res = await vocabPronunciationGenerate({ content, filename, voice: vocab.voice, speed: vocab.speed });
                if (res.code) {
                    setVocab({ ...vocab, pronunciation: filename });
                    if (refAudio.current) {
                        const audio = refAudio.current;
                        audio.src = "data:audio/wav;base64," + res.data;
                        audio.load();
                        audio.play();
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    const handlersUpdateVocabPronunciation = async (file: any) => {
        if (vocab.text) {
            if (/^(.+?)\.(mp3)$/g.test(file.name) && file.type === "audio/mpeg") {
                try {
                    const nameEN = vocab.text.split(" | ")[0].replaceAll(/[\s\,\/\:\?\.]+/g, "_");
                    const nameCNHash = md5(vocab.text.split(" | ")[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.mp3`;
                    const formData = new FormData();
                    formData.append("file", file, name);
                    const res = await vocabPronunciationUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, pronunciation: res.data.filename });
                        if (refAudio.current) {
                            const audio = refAudio.current;
                            audio.src = `${Domain}/data/temp/${res.data.filename}`;
                            audio.load();
                            audio.play();
                        }
                    }
                } catch (e: any) {
                    alert(e.message);
                }
            } else {
                alert("Please upload a wav format audio.");
            }
        } else {
            alert("Please type vocab text.");
        }
    };
    const handlersAddVocab = async () => {
        if (vocab.text && vocab.pronunciation) {
            const res = await vocabImagePronunciationMove({ plan: plan.videoHash, vocabImage: vocab.image ? vocab.image : "a.txt", vocabPronunciation: vocab.pronunciation });
            if (res.code === 1) {
                dispatch(updateScriptVocabs(vocab));
                setVocab({ text: "", image: "", voice: 0, speed: 150, pronunciation: "" });
                setParsedVocabs("");
            }
        }
    };
    const handlersRemoveVocab = async () => {
        const confirmed = window.confirm("Do you confirm to delete?");
        if (confirmed) {
            dispatch(updateScriptVocabsByDelete({ pKey: vocabActive }));
            setVocabActive(0);
            const vocab = script.data.vocabs[vocabActive];
            if (vocab && (vocab.image || vocab.pronunciation)) {
                await vocabImagePronunciationRemove({ plan: plan.videoHash, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
            }
        }
    };
    const handlersVocabOnRendered = (index: number) => {
        setVocabActive(index);
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
        const paragraphs = [...script.data.paragraphs];
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
    const handlersDownToMiddle = () => {
        const grammarElement = document.getElementById("script-grammar");
        if (grammarElement && grammarElement.offsetTop) {
            refScrollbar.current?.scrollTop(grammarElement.offsetTop - 200 || 0);
        }
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
        <Scrollbars id="script" key={renderVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
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
                <Button icon={<PlusSquareOutlined />} onClick={handlersSwitchVocabPanel}>
                    Vocab
                </Button>
                <Button icon={<MinusSquareOutlined />} onClick={handlersRemoveVocab}>
                    Vocab
                </Button>
                <Button icon={<DownCircleOutlined />} onClick={handlersDownToMiddle} />
            </div>
            <div className="script-meta">
                <Input defaultValue={script.data.title} onBlur={(e) => handlersSubUpdateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
                <Input defaultValue={script.data.roles.join("/")} onBlur={(e) => handlersSubUpdateRoles(e.target.value)} placeholder="Role1-角色1/Role2-角色2" />
                <Input defaultValue={script.data.scenes.join("/")} onBlur={(e) => handlersSubUpdateScenes(e.target.value)} placeholder="Scene1-场景1/Scene2-场景2" />
            </div>
            <Tree
                selectable={false}
                style={{ height: "100%", borderRadius: "0" }}
                fieldNames={{ key: "key", children: "sentences" }}
                showLine
                defaultExpandAll
                treeData={script.data.paragraphs}
                titleRender={(item: any) => {
                    return item.roles ? (
                        <div style={{ width: "100%", display: "flex" }}>
                            <Select size="small" onChange={(v) => handlersSubUpdateScene(v, item.key)} defaultValue={item.scene} options={script.data.scenes.map((v) => ({ label: v, value: v }))} style={{ width: "426px", borderRadius: 0 }} />
                            <Mentions autoSize onChange={(v) => handlersSubUpdateRole(v, item.key)} defaultValue={filterItemRoles(item.roles)} options={script.data.roles.map((v) => ({ label: v, value: v }))} style={{ fontSize: "12px", lineHeight: "22px", borderRadius: 0, marginLeft: "4px", height: "24px" }} placeholder="@Role1-角色1 @Role2-角色2" />
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
            <Grammar grammars={script.data.grammars} />
            <Vocab vocabs={script.dataFormatted.vocabs} onRendered={handlersVocabOnRendered} />
            <Drawer className="vocab-panel" title="Add a vocab" size="large" onClose={handlersSwitchVocabPanel} open={vocabPanel}>
                <Input.TextArea autoSize value={parsedVocabs} onChange={(e) => handlersParseVocabs(e.target.value)} placeholder="Paste Vocabs" />
                <div className="text-image-btn">
                    <Input className="text" value={vocab.text} onChange={(e) => handlersUpdateVocabText(e.target.value)} style={{ borderRadius: "0", color: "#000" }} placeholder="pronunciation/pronunciations | prəˌnʌnsiˈeɪʃn | n.读音;发音" />
                    <div className="image">{vocab.image && <img src={`${Domain}/data/temp/${vocab.image}`} />}</div>
                    <Upload beforeUpload={handlersUpdateVocabImage} showUploadList={false}>
                        <Button icon={<PlusSquareOutlined />} />
                    </Upload>
                </div>
                <div className="audio-btn">
                    <Select
                        style={{ width: 120 }}
                        defaultValue={0}
                        onChange={handlersUpdateVocabPronounceVoice}
                        options={[
                            { value: 0, label: "Man-0" },
                            { value: 1, label: "Woman-1" },
                        ]}
                    />
                    <Select
                        style={{ width: 120 }}
                        defaultValue={150}
                        onChange={handlersUpdateVocabPronounceSpeed}
                        options={[
                            { value: 150, label: "Normal" },
                            { value: 120, label: "Slow" },
                            { value: 100, label: "Very Slow" },
                        ]}
                    />
                    <Button className="play" onClick={handlersPlayVocabPronunciation}>
                        {vocab.pronunciation}
                    </Button>
                    <Button className="gen" icon={<RedoOutlined />} onClick={handlersGenerateVocabPronunciation} />
                    <Upload beforeUpload={handlersUpdateVocabPronunciation} showUploadList={false}>
                        <Button icon={<PlusSquareOutlined />} />
                    </Upload>
                </div>
                <div className="btn">
                    <Button icon={<PlusSquareOutlined />} onClick={handlersAddVocab} />
                </div>
            </Drawer>
            <section style={{ display: "none" }}>
                <audio ref={refAudio}></audio>
            </section>
        </Scrollbars>
    );
});
export default Data;
