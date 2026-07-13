import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import { Input, Space, Select, Button } from "antd";
import { ScriptParagraphWithSentences, ScriptSentence, ScriptRole, ScriptScene } from "../../types/Data";
import { AimOutlined, EnterOutlined } from "@ant-design/icons";
import { strip } from "../../utils/number";
import "./Paragraphs.scss";

interface ParagraphsProps {
    paragraphs: ScriptParagraphWithSentences[];
    roles: ScriptRole[];
    scenes: ScriptScene[];
    onParagraphInsert?: (prevId: number | null, nextId: number | null) => void;
    onParagraphUpdate?: (paragraphId: number, roleId: number, sceneId: number) => void;
    onParagraphDelete?: (pId: number) => void;
    onParagraphCut?: (prevId: number | null, nextId: number | null, sentenceIds: number[]) => void;
    onSentenceInsert?: (paragraphId: number, prevId: number | null, nextId: number | null) => void;
    onSentenceDelete?: (paragraphId: number, sentenceId: number) => void;
    onSentenceUpdate?: (paragraphId: number, sentenceId: number, startTime: number, endTime: number, text: string, piece: string) => void;
    onLocateTime?: (time: number) => void;
    onSceneChange?: (sceneId: number, paragraphId: number) => void;
    onRoleChange?: (roleId: number, paragraphId: number) => void;
}

export interface ParagraphsRef {
    insertParagraph: () => void;
    deleteParagraph: () => void;
    cutParagraph: () => void;
    insertSentence: () => void;
    deleteSentence: () => void;
}

// prettier-ignore
const Paragraphs = React.forwardRef<ParagraphsRef, ParagraphsProps>(({ 
        paragraphs, 
        roles, 
        scenes, 
        onParagraphInsert, 
        onParagraphUpdate, 
        onParagraphDelete, 
        onParagraphCut, 
        onSentenceInsert, 
        onSentenceDelete, 
        onSentenceUpdate, 
        onLocateTime 
    }, ref) => {
    const refCurPId = useRef<number>(0);
    const refCurSId = useRef<number>(0);
    const handlerSetActive = (pOrderNum: number, sOrderNum: number) => {
        refCurPId.current = pOrderNum;
        refCurSId.current = sOrderNum;
    };
    const handlerParagraphInsert = () => {
        if (onParagraphInsert !== undefined) {
            if (paragraphs.length > 0) {
                const pID = refCurPId.current;
                const curParagraphIndex = paragraphs.findIndex(({ id }) => id === pID);
                if (curParagraphIndex !== -1) {
                    const nextParagraph = paragraphs[curParagraphIndex + 1];
                    onParagraphInsert(pID, nextParagraph ? nextParagraph.id : null);
                }
            } else {
                onParagraphInsert(null, null);
            }
        }
    };
    const handlerParagraphDelete = () => {
        if (onParagraphDelete !== undefined) {
            const pId = refCurPId.current;
            const curParagraph = paragraphs.find(({ id }) => id === pId);
            if (curParagraph) {
                onParagraphDelete(pId);
            }
        }
    };
    const handlerParagraphCut = () => {
        if (onParagraphCut !== undefined) {
            const pID = refCurPId.current;
            const sID = refCurSId.current;
            const curParagraphIndex = paragraphs.findIndex(({ id }) => id === pID);
            if (curParagraphIndex !== -1) {
                const curPSentences = paragraphs[curParagraphIndex].sentences;
                if (curPSentences.length > 1) {
                    const curSIndex = curPSentences.findIndex(({ id }) => id === sID);
                    if (curSIndex > 0) {
                        const sentenceIds = curPSentences.slice(curSIndex).map((s) => s.id);
                        const nextParagraph = paragraphs[curParagraphIndex + 1];
                        onParagraphCut(pID, nextParagraph ? nextParagraph.id : null, sentenceIds);
                    }
                }
            }
        }
    };
    const handlerSentenceInsert = () => {
        if (onSentenceInsert !== undefined) {
            const pID = refCurPId.current;
            const sID = refCurSId.current;
            const curParagraph = paragraphs.find(({ id }) => id === pID);
            if (curParagraph) {
                const curPSentences = curParagraph.sentences;
                const curSentenceIndex = curPSentences.findIndex(({ id }) => id === sID);
                if (curSentenceIndex !== -1) {
                    const nextSentence = curPSentences[curSentenceIndex + 1];
                    onSentenceInsert(pID, sID, nextSentence ? nextSentence.id : null);
                }
            }
        }
    };
    const handlerSentenceDelete = () => {
        if (onSentenceDelete !== undefined) {
            const pID = refCurPId.current;
            const sID = refCurSId.current;
            const curParagraph = paragraphs.find(({ id }) => id === pID);
            if (curParagraph) {
                const curPSentences = curParagraph.sentences;
                if (curPSentences.length > 1) {
                    const curSentence = curPSentences.find(({ id }) => id === sID);
                    if (curSentence) {
                        onSentenceDelete(curParagraph.id, curSentence.id);
                    }
                }
            }
        }
    };
    const handlerSentenceUpdateStartTime = (paragraphId: number, sentence: ScriptSentence, value: string) => {
        if (onSentenceUpdate !== undefined) {
            const precision = Number(strip(value).toFixed(3));
            onSentenceUpdate(paragraphId, sentence.id, precision * 1000, sentence.endTime, sentence.text, sentence.piece);
        }
    };
    const handlerSentenceUpdateEndTime = (paragraphId: number, sentence: ScriptSentence, value: string) => {
        if (onSentenceUpdate !== undefined) {
            const precision = Number(strip(value).toFixed(3));
            onSentenceUpdate(paragraphId, sentence.id, sentence.startTime, precision * 1000, sentence.text, sentence.piece);
        }
    };
    const handlerSentenceUpdateText = (paragraphId: number, sentence: ScriptSentence, value: string) => {
        if (onSentenceUpdate !== undefined) {
            onSentenceUpdate(paragraphId, sentence.id, sentence.startTime, sentence.endTime, value, sentence.piece);
        }
    };
    const handlerLocateTime = (time: number) => {
        if (onLocateTime !== undefined) {
            onLocateTime(time);
        }
    };
    const handlerButtTime = (pId: number, sId: number) => {
        if (onSentenceUpdate !== undefined) {
            const curParagraph = paragraphs.find(({ id }) => id === pId);
            if (curParagraph !== undefined) {
                const curPSentences = curParagraph.sentences;
                const curSIndex = curPSentences.findIndex(({ id }) => id === sId);
                const curSentence = curPSentences.find(({ id }) => id === sId);
                const lastSentence = curParagraph.sentences[curSIndex - 1];
                if (curSentence !== undefined && lastSentence !== undefined) {
                    // prettier-ignore
                    onSentenceUpdate(
                        curParagraph.id, 
                        curSentence.id, 
                        strip(lastSentence.endTime + 1), 
                        curSentence.endTime, 
                        curSentence.text ? curSentence.text : "",
                        curSentence.piece ? curSentence.piece : ""
                    );
                }
            }
        }
    };
    const handlerSceneChange = (paragraph: any, value: number) => {
        if (onParagraphUpdate !== undefined) {
            onParagraphUpdate(paragraph.id, paragraph.roleId, value);
        }
    };
    const handlerRoleChange = (paragraph: any, value: number) => {
        if (onParagraphUpdate !== undefined) {
            onParagraphUpdate(paragraph.id, value, paragraph.sceneId);
        }
    };
    useImperativeHandle(ref, () => ({
        insertParagraph: handlerParagraphInsert,
        deleteParagraph: handlerParagraphDelete,
        cutParagraph: handlerParagraphCut,
        insertSentence: handlerSentenceInsert,
        deleteSentence: handlerSentenceDelete,
    }));
    return (
        <div id="script-paragraphs">
            {paragraphs.map((paragraph) => {
                return (
                    <div className="paragraph" key={paragraph.id}>
                        <div className="meta">
                             {/* prettier-ignore */}
                            <Select 
                                value={paragraph.sceneId} 
                                size="small" 
                                onChange={(v) => handlerSceneChange(paragraph, v)} 
                                options={scenes.map((v) => ({ label: v.name, value: v.id }))} />
                            {/* prettier-ignore */}
                            <Select 
                                size="small" 
                                value={paragraph.roleId} 
                                onChange={(v) => handlerRoleChange(paragraph, v)} 
                                options={roles.map((v) => ({ label: v.name, value: v.id }))} />
                        </div>
                        {paragraph.sentences.map((sentence: any) => {
                            return (
                                <div className="sentence" key={`${sentence.id}${sentence.startTime}${sentence.endTime}`}>
                                    <Space size="small" className="time" direction="vertical">
                                        <Space size="small" className="time-inner">
                                            {/* prettier-ignore */}
                                            <Input 
                                                size="small" 
                                                className="time-input" 
                                                defaultValue={sentence.startTime / 1000} 
                                                onFocus={(_) => handlerSetActive(paragraph.id, sentence.id)} 
                                                onBlur={(e) => handlerSentenceUpdateStartTime(paragraph.id, sentence, e.target.value)} />
                                            <Button icon={<AimOutlined />} onClick={() => handlerLocateTime(sentence.startTime / 1000)} />
                                            <Button icon={<EnterOutlined />} onClick={() => handlerButtTime(paragraph.id, sentence.id)} />
                                        </Space>
                                        <Space size="small" className="time-inner end">
                                            {/* prettier-ignore */}
                                            <Input 
                                                size="small" 
                                                className="time-input" 
                                                defaultValue={sentence.endTime / 1000} 
                                                onFocus={(_) => handlerSetActive(paragraph.id, sentence.id)} 
                                                onBlur={(e) => handlerSentenceUpdateEndTime(paragraph.id, sentence, e.target.value)} />
                                            <Button icon={<AimOutlined />} onClick={() => handlerLocateTime(sentence.endTime / 1000)} />
                                            <Button icon={<EnterOutlined />} />
                                        </Space>
                                    </Space>
                                    {/* prettier-ignore */}
                                    <Input.TextArea 
                                        spellCheck={true}
                                        autoSize 
                                        className="text" 
                                        defaultValue={sentence.text} 
                                        onFocus={(_) => handlerSetActive(paragraph.id, sentence.id)} 
                                        onBlur={(e) => handlerSentenceUpdateText(paragraph.id, sentence, e.target.value)} />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
});

export default Paragraphs;
