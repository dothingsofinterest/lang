import React, { useState, useRef, useEffect } from "react";
import { Input, Space, Button, Tree, Select, InputNumber, Mentions } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptParagraphsByInsert, updateScriptParagraphsByDelete, updateScriptParagraphsByCut, updateScriptParagraphsByInsertSentence, updateScriptParagraphsByDeleteSentence, updateScriptParagraphRole, updateScriptParagraphScene, updateScriptSentenceText, updateScriptSentenceTime, updateScriptTimeOffset } from "../../stores/reducers/project";
import { fnFloatToSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import "./Data.scss";

const Data = React.memo(() => {
    console.log("[rendered] script/data");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.project.script.data);
    const timeOffset = useSelector((state: RootState) => state.project.script.timeOffset);
    const [renderVersion, setRenderVersion] = useState(0);
    const refScrollbar = useRef<Scrollbars>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const refCurSentenceKey = useRef("0-0");
    const refScrollTop = useRef(0);
    // 使用方法：为已存在的字幕添加时间偏移，导出。再导入不再依赖偏移。
    const handlersSubUpdateTimeOffset = (value: number | null) => {
        if (value !== null && !isNaN(value)) {
            const firstStartTime = script.paragraphs[0].sentences[0].startTime;
            const firstStartTimeN = fnSRTTimeToFloat(firstStartTime) + value;
            console.log(firstStartTimeN);
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
        if (refCurSentenceKey.current) {
            const keyInfo = refCurSentenceKey.current.split("-");
            dispatch(updateScriptParagraphsByCut({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]) }));
            setRenderVersion((prev) => prev + 1);
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
        if (value.trim() !== script.roles.join("/")) {
            dispatch(updateScriptRoles({ text: value.trim() }));
        }
    };
    const handlersSubUpdateScenes = (value: string) => {
        if (value.trim() !== script.scenes.join("/")) {
            dispatch(updateScriptScenes({ text: value.trim() }));
        }
    };
    const handlersSubUpdateStartTime = (event: any, key: string) => {
        if (event.target.value) {
            const keyInfo = key.split("-");
            dispatch(updateScriptSentenceTime({ pKey: parseInt(keyInfo[0]), sKey: parseInt(keyInfo[1]), type: 0, text: event.target.value.trim() }));
        }
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
        console.log("[mounted] script/data");
        return () => {
            console.log("[unmounted] script/data");
        };
    }, []);
    useEffect(() => {
        console.log("[effected by renderVersion] script/data");
        refScrollbar.current?.scrollTop(refScrollTop.current);
    }, [renderVersion]);
    return (
        <Scrollbars id="script-data" key={renderVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
            <div ref={refPanel} className="panel">
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubInsertParagraph}>
                    P
                </Button>
                <Button icon={<MinusSquareOutlined />} onClick={handlersSubDeleteParagraph}>
                    P
                </Button>
                <Button icon={<PlusCircleOutlined />} onClick={handlersSubInsertSentence}>
                    S
                </Button>
                <Button icon={<MinusCircleOutlined />} onClick={handlersSubDeleteSentence}>
                    S
                </Button>
                <Button icon={<ScissorOutlined />} onClick={handlersSubCutParagraph}>
                    Cut P
                </Button>
                <InputNumber min={-100.0} max={100.0} step={0.01} value={timeOffset} onChange={(v) => handlersSubUpdateTimeOffset(v)} style={{ flex: "0 0 80px" }} />
            </div>
            <div className="script-meta">
                <Input defaultValue={script.title} onBlur={(e) => handlersSubUpdateName(e.target.value)} style={{ borderRadius: "0" }} placeholder="Script Title" />
                <Input defaultValue={script.roles.join("/")} onBlur={(e) => handlersSubUpdateRoles(e.target.value)} placeholder="Role1-角色1/Role2-角色2" />
                <Input defaultValue={script.scenes.join("/")} onBlur={(e) => handlersSubUpdateScenes(e.target.value)} placeholder="Scene1-场景1/Scene2-场景2" />
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
        </Scrollbars>
    );
});
export default Data;
