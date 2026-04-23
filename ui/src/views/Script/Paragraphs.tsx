import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input, Space, Select, Button, Mentions } from "antd";
import { Paragraph as DataParagraph, Scene as DataScene } from "../../types/Data";
import { fnSRTTimeToFloat, fnFloatToSRTTime, fnIsSRTTime } from "../../utils/script";
import { AimOutlined, EnterOutlined } from "@ant-design/icons";
import "./Paragraphs.scss";

const defaultSentence = {
    id: 1,
    startTime: "",
    endTime: "",
    texts: [],
};

const defaultParagraph = {
    id: 1,
    scene: ``,
    roles: [],
    sentences: [defaultSentence],
};

interface IDs {
    pID: number;
    sID: number;
}

interface ParagraphsProps {
    paragraphs: DataParagraph[];
    scenes: DataScene[];
    roles: string[];
    onSubmit?: (paragraphs: DataParagraph[]) => void;
    onLocateTime?: (time: string) => void;
}

export interface ParagraphsRef {
    insertParagraph: () => void;
    deleteParagraph: () => void;
    cutParagraph: () => void;
    insertSentence: () => void;
    deleteSentence: () => void;
}

const Paragraphs = React.forwardRef<ParagraphsRef, ParagraphsProps>(({ paragraphs, scenes, roles, onSubmit, onLocateTime }, ref) => {
    const refCurIDs = useRef<IDs>({ pID: 0, sID: 0 });
    const handlerSetCurIDs = (paragraphID: number, sentenceID: number) => {
        refCurIDs.current = { pID: paragraphID, sID: sentenceID };
    };
    const handlersParagraphInsert = () => {
        const pID = Number(refCurIDs.current?.pID);
        const curIndex = paragraphs.findIndex(({ id }) => id === pID);
        if (curIndex !== -1) {
            const a = paragraphs.slice(0, curIndex + 1);
            const b = paragraphs.slice(curIndex + 1);
            const pIDs = paragraphs.map((paragraph) => paragraph.id);
            const pIDNew = pIDs.length === 0 ? 1 : Math.max(...pIDs) + 1;
            let maxID = 1;
            paragraphs.forEach((paragraph) => (maxID = Math.max(maxID, ...paragraph.sentences.map((sentence) => sentence.id))));
            a.push({ ...defaultParagraph, id: pIDNew, sentences: [{ ...defaultSentence, id: maxID + 1 }] });
            if (onSubmit !== undefined) {
                onSubmit([...a, ...b]);
            }
        }
    };
    const handlersParagraphDelete = () => {
        const pID = Number(refCurIDs.current?.pID);
        const curIndex = paragraphs.findIndex(({ id }) => id === pID);
        if (curIndex !== -1) {
            if (paragraphs.length > 1) {
                const a = paragraphs.slice(0, curIndex);
                const b = paragraphs.slice(curIndex + 1);
                if (onSubmit !== undefined) {
                    onSubmit([...a, ...b]);
                }
            }
        }
    };
    const handlersParagraphCut = () => {
        const pID = Number(refCurIDs.current?.pID);
        const curParagraph = paragraphs.find(({ id }) => id === pID);
        if (curParagraph !== undefined) {
            if (curParagraph.sentences.length > 1) {
                const sID = Number(refCurIDs.current?.sID);
                const curPIndex = paragraphs.findIndex(({ id }) => id === pID);
                const curSIndex = curParagraph.sentences.findIndex(({ id }) => id === sID);
                const curParagraphSentences = curParagraph.sentences.slice(0, curSIndex);
                const newParagraphSentences = curParagraph.sentences.slice(curSIndex);
                const a = paragraphs.slice(0, curPIndex + 1).map((p) => (p.id === curParagraph.id ? { ...p, sentences: curParagraphSentences } : p));
                const pIDs = paragraphs.map((paragraph) => paragraph.id);
                const pIDNew = pIDs.length === 0 ? 1 : Math.max(...pIDs) + 1;
                a.push({ ...defaultParagraph, id: pIDNew, sentences: newParagraphSentences });
                const b = paragraphs.slice(curPIndex + 1);
                if (onSubmit !== undefined) {
                    onSubmit([...a, ...b]);
                }
            }
        }
    };
    const handlersSentenceInsert = () => {
        const pID = Number(refCurIDs.current?.pID);
        const curParagraph = paragraphs.find(({ id }) => id === pID);
        if (curParagraph !== undefined) {
            const sID = Number(refCurIDs.current?.sID);
            const curSentence = curParagraph.sentences.find(({ id }) => id === sID);
            if (curSentence !== undefined) {
                const curSIndex = curParagraph.sentences.findIndex(({ id }) => id === sID);
                const endTimeFromLast = curSentence.endTime ? curSentence.endTime : "";
                let maxID = 1;
                paragraphs.forEach((paragraph) => (maxID = Math.max(maxID, ...paragraph.sentences.map((sentence) => sentence.id))));
                const a = curParagraph.sentences.slice(0, curSIndex + 1);
                a.push({ ...defaultSentence, endTime: endTimeFromLast, id: maxID + 1 });
                const b = curParagraph.sentences.slice(curSIndex + 1);
                const newParagraphs = paragraphs.map((paragraph) => (paragraph.id === curParagraph.id ? { ...paragraph, sentences: [...a, ...b] } : paragraph));
                if (onSubmit !== undefined) {
                    onSubmit([...newParagraphs]);
                }
            }
        }
    };
    const handlersSentenceDelete = () => {
        const pID = Number(refCurIDs.current?.pID);
        const curParagraph = paragraphs.find(({ id }) => id === pID);
        if (curParagraph !== undefined) {
            if (curParagraph.sentences.length > 1) {
                const sID = Number(refCurIDs.current?.sID);
                const curSIndex = curParagraph.sentences.findIndex(({ id }) => id === sID);
                if (curSIndex !== -1) {
                    const a = curParagraph.sentences.slice(0, curSIndex);
                    const b = curParagraph.sentences.slice(curSIndex);
                    b.shift();
                    const newParagraphs = paragraphs.map((paragraph) => (paragraph.id === curParagraph.id ? { ...paragraph, sentences: [...a, ...b] } : paragraph));
                    if (onSubmit !== undefined) {
                        onSubmit([...newParagraphs]);
                    }
                }
            }
        }
    };
    const handlersParagraphUpdateScene = (sceneID: number | string, paragraphID: number) => {
        const sID = Number(sceneID);
        const pID = Number(paragraphID);
        const curParagraph = paragraphs.find(({ id }) => id === pID);
        if (curParagraph !== undefined) {
            const newParagraph = { ...curParagraph, scene: sID };
            const newParagraphs = paragraphs.map((paragraph) => (paragraph.id === newParagraph.id ? newParagraph : paragraph));
            if (onSubmit !== undefined) {
                onSubmit([...newParagraphs]);
            }
        }
    };
    const handlersParagraphUpdateRole = (value: string, paragraphID: number) => {
        const roleText = value.trim();
        const pID = Number(paragraphID);
        const curParagraph = paragraphs.find(({ id }) => id === pID);
        if (curParagraph !== undefined) {
            const match = roleText ? roleText.match(/@[^@]+/g) : null;
            const res = match !== null ? match.map((v) => v.slice(1)) : [];
            const newParagraph = { ...curParagraph, roles: res };
            const newParagraphs = paragraphs.map((paragraph) => (paragraph.id === newParagraph.id ? newParagraph : paragraph));
            if (onSubmit !== undefined) {
                onSubmit([...newParagraphs]);
            }
        }
    };
    const handlersSentenceUpdateStartTime = (value: string, IDs: IDs) => {
        if (value) {
            const pID = Number(IDs.pID);
            const curParagraph = paragraphs.find(({ id }) => id === pID);
            if (curParagraph !== undefined) {
                const sID = Number(IDs.sID);
                const curSentence = curParagraph.sentences.find(({ id }) => id === sID);
                if (curSentence !== undefined) {
                    if (fnIsSRTTime(value)) {
                        if (value !== curSentence.startTime) {
                            if ((curSentence.endTime && fnSRTTimeToFloat(value) < fnSRTTimeToFloat(curSentence.endTime)) || !curSentence.endTime) {
                                const newSentences = curParagraph.sentences.map((sentence) => (sentence.id == curSentence.id ? { ...curSentence, startTime: value ? value : "" } : sentence));
                                const newParagraphs = paragraphs.map((paragraph) => (paragraph.id == curParagraph.id ? { ...paragraph, sentences: newSentences } : paragraph));
                                if (onSubmit !== undefined) {
                                    onSubmit([...newParagraphs]);
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const handlersSentenceUpdateEndTime = (value: string, IDs: IDs) => {
        if (value) {
            const pID = Number(IDs.pID);
            const curParagraph = paragraphs.find(({ id }) => id === pID);
            if (curParagraph !== undefined) {
                const sID = Number(IDs.sID);
                const curSentence = curParagraph.sentences.find(({ id }) => id === sID);
                if (curSentence !== undefined) {
                    if (fnIsSRTTime(value)) {
                        if (value !== curSentence.endTime) {
                            if ((curSentence.startTime && fnSRTTimeToFloat(value) > fnSRTTimeToFloat(curSentence.startTime)) || !curSentence.startTime) {
                                const newSentences = curParagraph.sentences.map((sentence) => (sentence.id == curSentence.id ? { ...curSentence, endTime: value ? value : "" } : sentence));
                                const newParagraphs = paragraphs.map((paragraph) => (paragraph.id == curParagraph.id ? { ...paragraph, sentences: newSentences } : paragraph));
                                if (onSubmit !== undefined) {
                                    onSubmit(newParagraphs);
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const handlersSentenceUpdateText = (value: string, IDs: IDs) => {
        if (value) {
            const text = value
                .split("\n---\n")
                .map((v: string) => v.trim())
                .join("\n---\n");
            const pID = Number(IDs.pID);
            const curParagraph = paragraphs.find(({ id }) => id === pID);
            if (curParagraph !== undefined) {
                const sID = Number(IDs.sID);
                const curSentence = curParagraph.sentences.find(({ id }) => id === sID);
                if (curSentence !== undefined) {
                    if (text !== curSentence.texts.join("\n---\n")) {
                        const newSentences = curParagraph.sentences.map((sentence) => (sentence.id == curSentence.id ? { ...curSentence, texts: text ? text.split("\n---\n") : [] } : sentence));
                        const newParagraphs = paragraphs.map((paragraph) => (paragraph.id === curParagraph.id ? { ...paragraph, sentences: newSentences } : paragraph));
                        if (onSubmit !== undefined) {
                            onSubmit([...newParagraphs]);
                        }
                    }
                }
            }
        }
    };
    const handlerLocateTime = (time: string) => {
        if (onLocateTime !== undefined) {
            onLocateTime(time);
        }
    };
    const handlerButtTime = (IDs: IDs) => {
        const pID = Number(IDs.pID);
        const curParagraph = paragraphs.find(({ id }) => id === pID);
        if (curParagraph !== undefined) {
            const sID = Number(IDs.sID);
            const curSIndex = curParagraph.sentences.findIndex(({ id }) => id === sID);
            const curSentence = curParagraph.sentences.find(({ id }) => id === sID);
            const lasSIndex = curSIndex - 1;
            const lastSentence = curParagraph.sentences[lasSIndex];
            if (curSentence !== undefined && lastSentence !== undefined) {
                const floatTimeButt = lastSentence.endTime ? fnSRTTimeToFloat(lastSentence.endTime) + 0.001 : 0;
                const newSentences = curParagraph.sentences.map((sentence) => (sentence.id === curSentence.id ? { ...curSentence, startTime: fnFloatToSRTTime(floatTimeButt) } : sentence));
                const newParagraphs = paragraphs.map((paragraph) => (paragraph.id == curParagraph.id ? { ...paragraph, sentences: newSentences } : paragraph));
                if (onSubmit !== undefined) {
                    onSubmit([...newParagraphs]);
                }
            }
        }
    };
    const filterItemRoles = (roles: string[]): string => {
        return roles.length > 0 ? roles.map((v: string) => `@${v}`).join(" ") : "";
    };
    useImperativeHandle(ref, () => ({
        insertParagraph: handlersParagraphInsert,
        deleteParagraph: handlersParagraphDelete,
        cutParagraph: handlersParagraphCut,
        insertSentence: handlersSentenceInsert,
        deleteSentence: handlersSentenceDelete,
    }));
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <div id="video-script-paragraphs">
            {paragraphs.map((paragraph) => {
                return (
                    <div className="paragraph" key={paragraph.id}>
                        <div className="meta">
                            <Select size="small" onChange={(v) => handlersParagraphUpdateScene(v, paragraph.id)} defaultValue={paragraph.scene} options={scenes.map((v) => ({ label: v.value, value: v.index }))} />
                            <Mentions autoSize onChange={(v) => handlersParagraphUpdateRole(v, paragraph.id)} defaultValue={filterItemRoles(paragraph.roles)} options={roles.map((v) => ({ label: v, value: v }))} />
                        </div>
                        {paragraph.sentences.map((sentence) => {
                            return (
                                <div className="sentence" key={sentence.id}>
                                    <Space size="small" className="time" direction="vertical">
                                        <Space size="small" className="time-inner">
                                            <Input size="small" className="time-input" value={sentence.startTime} onFocus={() => handlerSetCurIDs(paragraph.id, sentence.id)} onChange={(e) => handlersSentenceUpdateStartTime(e.target.value, { pID: paragraph.id, sID: sentence.id })} placeholder="00:00:00,000" />
                                            <Button
                                                icon={<AimOutlined />}
                                                onClick={() => {
                                                    handlerLocateTime(sentence.startTime);
                                                }}
                                            />
                                            <Button
                                                icon={<EnterOutlined />}
                                                onClick={() => {
                                                    handlerButtTime({ pID: paragraph.id, sID: sentence.id });
                                                }}
                                            />
                                        </Space>
                                        <Space size="small" className="time-inner">
                                            <Input size="small" className="time-input" value={sentence.endTime} onFocus={() => handlerSetCurIDs(paragraph.id, sentence.id)} onChange={(e) => handlersSentenceUpdateEndTime(e.target.value, { pID: paragraph.id, sID: sentence.id })} placeholder="00:00:00,001" />
                                            <Button
                                                icon={<AimOutlined />}
                                                onClick={() => {
                                                    handlerLocateTime(sentence.endTime);
                                                }}
                                            />
                                            <Button icon={<EnterOutlined />} />
                                        </Space>
                                    </Space>
                                    <Input.TextArea autoSize className="text" defaultValue={sentence.texts.join("\n---\n")} onFocus={(e) => handlerSetCurIDs(paragraph.id, sentence.id)} onBlur={(e) => handlersSentenceUpdateText(e.target.value, { pID: paragraph.id, sID: sentence.id })} />
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
