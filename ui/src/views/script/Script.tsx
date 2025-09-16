import React, { useState, useRef, useEffect } from "react";
import { Input, Space, Button, Tree, Select, InputNumber, Mentions } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateParagraphsByInsert, updateParagraphsByDelete, updateParagraphsByCut, updateParagraphsByInsertSentence, updateParagraphsByDeleteSentence, updateName, updateRoles, updateScenes, updateVocabs, updateNotes, updateSentenceText, updateSentenceTime, updateParagraphScene, updateParagraphRole, updateTimeOffset } from "../../stores/reducers/script";
import { fnParseVocabs, fnFloatToSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import "./Script.scss";

const Script = React.memo(() => {
    console.log("----------Mounted | Script/Script----------");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const timeOffset = useSelector((state: RootState) => state.script.timeOffset);
    const [renderVersion, setRenderVersion] = useState(0);
    const [parsedVocabs, setParsedVocabs] = useState("");
    const refScrollbar = useRef<Scrollbars>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const refCurSentenceKey = useRef("0-0");
    const refScrollTop = useRef(0);
    // Event Handlers
    // 使用方法：为已存在的字幕添加时间偏移，导出。再导入不再依赖偏移。
    const handlersSubUpdateTimeOffset = (value: number | null) => {
        if (value !== null && !isNaN(value)) {
            const firstStartTime = script.paragraphs[0].sentences[0].startTime;
            const firstStartTimeN = fnSRTTimeToFloat(firstStartTime) + value;
            console.log(firstStartTimeN);
            if (firstStartTimeN > 0) {
                dispatch(updateTimeOffset(value));
                setRenderVersion((prev) => prev + 1);
            }
        }
    };
    const handlersSubInsertParagraph = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateParagraphsByInsert({ pKey: parseInt(keyInfo[0]) }));
            setRenderVersion((prev) => prev + 1);
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
        }
    };
    const handlersSubDeleteParagraph = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateParagraphsByDelete({ pKey: parseInt(keyInfo[0]) }));
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubCutParagraph = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateParagraphsByCut({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubInsertSentence = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateParagraphsByInsertSentence({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubDeleteSentence = () => {
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateParagraphsByDeleteSentence({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersSubUpdateName = (value: string) => {
        if (value !== script.name) {
            dispatch(updateName({ text: value.trim() }));
        }
    };
    const handlersSubUpdateRoles = (value: string) => {
        if (value.trim() !== script.roles.join("/")) {
            dispatch(updateRoles({ text: value.trim() }));
        }
    };
    const handlersSubUpdateScenes = (value: string) => {
        if (value.trim() !== script.scenes.join("/")) {
            dispatch(updateScenes({ text: value.trim() }));
        }
    };
    const handlersSubUpdateVocabs = (value: string) => {
        if (value.trim() !== script.vocabs.join("\n")) {
            dispatch(updateVocabs({ text: value.trim() }));
        }
    };
    const handlersSubUpdateNotes = (value: string) => {
        if (value.trim() !== script.notes.join("\n---\n")) {
            dispatch(updateNotes({ text: value.trim() }));
        }
    };
    const handlersSubUpdateStartTime = (event: any, key: string) => {
        if (event.target.value) {
            const keyInfo = key.split("-");
            dispatch(updateSentenceTime({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), type: 0, text: event.target.value.trim() }));
        }
    };
    const handlersSubUpdateEndTime = (event: any, key: string) => {
        if (event.target.value) {
            const keyInfo = key.split("-");
            dispatch(updateSentenceTime({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), type: 1, text: event.target.value.trim() }));
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
            dispatch(updateSentenceText({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), text: text }));
        }
    };
    const handlersSubUpdateRole = (value: string, key: string) => {
        dispatch(updateParagraphRole({ pKey: parseInt(key), text: value.trim() }));
    };
    const handlersSubUpdateScene = (value: string, key: string) => {
        dispatch(updateParagraphScene({ pKey: parseInt(key), text: value.trim() }));
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
    const handlersParseVocabs = (text: string) => {
        setParsedVocabs(fnParseVocabs(text));
    };
    // Event Handlers
    // Template Functions
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
    // Template Functions
    useEffect(() => {
        console.log("----------Mounted | Script/Script----------");
        return () => {
            console.log("----------Unmounted | Script/Script----------");
        };
    }, []);
    useEffect(() => {
        console.log("----------Watch renderVersion | Script/Script----------");
        refScrollbar.current?.scrollTop(refScrollTop.current);
    }, [renderVersion]);
    return (
        <Scrollbars id="script-script" key={renderVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
            <div ref={refPanel} style={{ width: "100%", marginBottom: "10px", height: "32px", display: "flex", justifyContent: "space-between" }}>
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubInsertParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    P
                </Button>
                <Button icon={<MinusSquareOutlined />} onClick={handlersSubDeleteParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    P
                </Button>
                <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertSentence} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    S
                </Button>
                <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteSentence} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    S
                </Button>
                <Button icon={<ScissorOutlined />} onClick={handlersSubCutParagraph} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}>
                    Cut P
                </Button>
                <InputNumber min={-100.0} max={100.0} step={0.01} value={timeOffset} onChange={(v) => handlersSubUpdateTimeOffset(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
            </div>
            <div style={{ width: "100%", display: "flex", marginBottom: "4px" }}>
                <Input defaultValue={script.name} onBlur={(e) => handlersSubUpdateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
                <Input defaultValue={script.roles.join("/")} onBlur={(e) => handlersSubUpdateRoles(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Role1-角色1/Role2-角色2" />
                <Input defaultValue={script.scenes.join("/")} onBlur={(e) => handlersSubUpdateScenes(e.target.value)} style={{ borderRadius: "0", marginLeft: "4px" }} placeholder="Scene1-场景1/Scene2-场景2" />
            </div>
            <Tree
                selectable={false}
                style={{ height: "100%", borderRadius: "0" }}
                fieldNames={{ key: "key", children: "sentences" }}
                showLine
                defaultExpandAll
                treeData={script.paragraphs}
                titleRender={(item: any) => {
                    return item.roles ? (
                        <div style={{ width: "100%", display: "flex" }}>
                            <Select size="small" onChange={(v) => handlersSubUpdateScene(v, item.key)} defaultValue={item.scene} options={script.scenes.map((v) => ({ label: v, value: v }))} style={{ width: "426px", borderRadius: 0 }} />
                            <Mentions autoSize onChange={(v) => handlersSubUpdateRole(v, item.key)} defaultValue={filterItemRoles(item.roles)} options={script.roles.map((v) => ({ label: v, value: v }))} style={{ fontSize: "12px", lineHeight: "22px", borderRadius: 0, marginLeft: "4px", height: "24px" }} placeholder="@Role1-角色1 @Role2-角色2" />
                        </div>
                    ) : (
                        <div style={{ width: "100%" }}>
                            <div style={{ width: "100%", display: "flex" }}>
                                <Space size="small" style={{ flex: "0 0 100px", rowGap: "4px", overflow: "hidden" }} direction="vertical">
                                    <Input size="small" defaultValue={filterPlusOffset(item.startTime)} onBlur={(e) => handlersSubUpdateStartTime(e, item.key)} style={{ borderRadius: 0 }} placeholder="00:00:00,000" />
                                    <Input size="small" defaultValue={filterPlusOffset(item.endTime)} onBlur={(e) => handlersSubUpdateEndTime(e, item.key)} style={{ borderRadius: 0 }} placeholder="00:00:00,001" />
                                </Space>
                                <Input.TextArea autoSize defaultValue={item.texts.join("\n---\n")} onFocus={(e) => handlersSubSetCurSentence(item.key)} onBlur={(e) => handlersSubUpdateText(e, item.key)} style={{ flex: 1, fontSize: "12px", minHeight: "52px", marginLeft: "4px", borderRadius: "0", color: "#000" }} />
                            </div>
                        </div>
                    );
                }}
            />
            <div style={{ width: "100%" }}>
                <Input.TextArea autoSize value={parsedVocabs} onChange={(e) => handlersParseVocabs(e.target.value)} style={{ flex: 1, minHeight: "100px", borderRadius: "0", color: "#000" }} placeholder="Paste Vocabs" />
                <Input.TextArea
                    autoSize
                    defaultValue={script.vocabs.join("\n")}
                    onBlur={(e) => handlersSubUpdateVocabs(e.target.value)}
                    style={{ flex: 1, minHeight: "200px", borderRadius: "0", color: "#000" }}
                    placeholder="n.内容;目录, content/contents, /ˈkɑːntent/ &#10;v.满足, content/contents/contented/contented/contenting, /kənˈtent/ &#10;adj.满意的, content, /kənˈtent/"
                />
                <Input.TextArea
                    autoSize
                    defaultValue={script.notes.join("\n---\n")}
                    onBlur={(e) => handlersSubUpdateNotes(e.target.value)}
                    style={{ flex: 1, minHeight: "200px", borderRadius: "0", color: "#000" }}
                    placeholder="Unfamiliar Grammars. &#10;To separate piece by ---"
                />
            </div>
        </Scrollbars>
    );
});
export default Script;
