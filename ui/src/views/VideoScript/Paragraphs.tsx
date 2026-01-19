import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input, Space, Button, Select, Mentions } from "antd";
import { Paragraph as DataParagraph, Scene as DataScene } from "../../types/Data";
import { fnSRTTimeToFloat, fnIsSRTTime } from "../../utils/script";
import EditorLinkings from "../CommonEditorLinkings/Index";
import "./Paragraphs.scss";

const defaultSentence = {
    key: "0-0",
    startTime: "",
    endTime: "",
    texts: [],
    linkings: [],
};

const defaultParagraph = {
    key: `0`,
    scene: ``,
    roles: [],
    sentences: [defaultSentence],
};

interface ParagraphsProps {
    paragraphs: DataParagraph[];
    scenes: DataScene[];
    roles: string[];
    onSubmit?: (paragraphs: DataParagraph[]) => void;
}

export interface ParagraphsRef {
    insertParagraph: () => void;
    deleteParagraph: () => void;
    cutParagraph: () => void;
    insertSentence: () => void;
    deleteSentence: () => void;
    openLinkingsEditor: () => void;
}

const Paragraphs = forwardRef<ParagraphsRef, ParagraphsProps>(({ paragraphs, scenes, roles, onSubmit }, ref) => {
    const [linkings, setLinkings] = useState<string[]>([]);
    const [linkingsEditor, setLinkingsEditor] = useState(false);
    const refCurKey = useRef<string>("0-0");
    const handlersSetCurKey = (key: string) => {
        refCurKey.current = key;
    };
    const handlersParagraphInsert = () => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined) {
                const pKey = Number(keyPair[0]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    const a = paragraphs.slice(0, pKey + 1);
                    a.push(defaultParagraph);
                    const b = paragraphs.slice(pKey + 1);
                    const newParagraphs = [...a, ...b].map((paragraph, pk) => {
                        return { ...paragraph, key: `${pk}`, sentences: paragraph.sentences.map((sentence, sk) => ({ ...sentence, key: `${pk}-${sk}` })) };
                    });
                    if (onSubmit !== undefined) {
                        onSubmit(newParagraphs);
                    }
                }
            }
        }
    };
    const handlersParagraphDelete = () => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined) {
                const pKey = Number(keyPair[0]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    if (paragraphs.length > 1) {
                        const a = paragraphs.slice(0, pKey);
                        const b = paragraphs.slice(pKey + 1);
                        const newParagraphs = [...a, ...b].map((paragraph, pk) => {
                            return { ...paragraph, key: `${pk}`, sentences: paragraph.sentences.map((sentence, sk) => ({ ...sentence, key: `${pk}-${sk}` })) };
                        });
                        if (onSubmit !== undefined) {
                            onSubmit(newParagraphs);
                        }
                    }
                }
            }
        }
    };
    const handlersParagraphCut = () => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const curParagraphSentences = curParagraph.sentences.slice(0, sKey);
                        const newParagraphSentences = curParagraph.sentences.slice(sKey);
                        const a = paragraphs.slice(0, pKey + 1).map((p) => (p.key === curParagraph.key ? { ...p, sentences: curParagraphSentences } : p));
                        a.push({ ...defaultParagraph, sentences: newParagraphSentences });
                        const b = paragraphs.slice(pKey + 1);
                        const newParagraphs = [...a, ...b].map((paragraph, pk) => ({ ...paragraph, key: `${pk}`, sentences: paragraph.sentences.map((sentence, sk) => ({ ...sentence, key: `${pk}-${sk}` })) }));
                        if (onSubmit !== undefined) {
                            onSubmit(newParagraphs);
                        }
                    }
                }
            }
        }
    };
    const handlersSentenceInsert = () => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    const a = curParagraph.sentences.slice(0, sKey + 1);
                    a.push(defaultSentence);
                    const b = curParagraph.sentences.slice(sKey + 1);
                    const newSentences = [...a, ...b].map((sentence, sk) => ({ ...sentence, key: `${curParagraph.key}-${sk}` }));
                    const newParagraphs = paragraphs.map((paragraph) => (paragraph.key === curParagraph.key ? { ...paragraph, sentences: newSentences } : paragraph));
                    if (onSubmit !== undefined) {
                        onSubmit(newParagraphs);
                    }
                }
            }
        }
    };
    const handlersSentenceDelete = () => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const a = curParagraph.sentences.slice(0, sKey);
                        const b = curParagraph.sentences.slice(sKey);
                        b.shift();
                        const newSentences = [...a, ...b].map((sentence, sk) => ({ ...sentence, key: `${curParagraph.key}-${sk}` }));
                        const newParagraphs = paragraphs.map((paragraph) => (paragraph.key === curParagraph.key ? { ...paragraph, sentences: newSentences } : paragraph));
                        if (onSubmit !== undefined) {
                            onSubmit(newParagraphs);
                        }
                    }
                }
            }
        }
    };
    const handlersParagraphUpdateScene = (index: number | string, key: string) => {
        const sIndex = Number(index);
        const pKey = Number(key);
        const curParagraph = paragraphs[pKey];
        if (curParagraph !== undefined) {
            const newParagraph = { ...curParagraph, scene: sIndex };
            const newParagraphs = paragraphs.map((paragraph) => (paragraph.key === newParagraph.key ? newParagraph : paragraph));
            if (onSubmit !== undefined) {
                onSubmit(newParagraphs);
            }
        }
    };
    const handlersParagraphUpdateRole = (value: string, key: string) => {
        const roleText = value.trim();
        const pKey = Number(key);
        const curParagraph = paragraphs[pKey];
        if (curParagraph !== undefined) {
            const match = roleText ? roleText.match(/@[^@]+/g) : null;
            const res = match !== null ? match.map((v) => v.slice(1)) : [];
            const newParagraph = { ...curParagraph, roles: res };
            const newParagraphs = paragraphs.map((paragraph) => (paragraph.key === newParagraph.key ? newParagraph : paragraph));
            if (onSubmit !== undefined) {
                onSubmit(newParagraphs);
            }
        }
    };
    const handlersSentenceUpdateStartTime = (value: string, key: string) => {
        if (value) {
            const keyPair = key.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[sKey];
                    if (curSentence !== undefined) {
                        if (fnIsSRTTime(value)) {
                            if (value !== curSentence.startTime) {
                                if ((curSentence.endTime && fnSRTTimeToFloat(value) < fnSRTTimeToFloat(curSentence.endTime)) || !curSentence.endTime) {
                                    const newSentences = curParagraph.sentences.map((sentence) => (sentence.key == curSentence.key ? { ...curSentence, startTime: value ? value : "" } : sentence));
                                    const newParagraphs = paragraphs.map((paragraph) => (paragraph.key == curParagraph.key ? { ...paragraph, sentences: newSentences } : paragraph));
                                    if (onSubmit !== undefined) {
                                        onSubmit(newParagraphs);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const handlersSentenceUpdateEndTime = (value: string, key: string) => {
        if (value) {
            const keyPair = key.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[sKey];
                    if (curSentence !== undefined) {
                        if (fnIsSRTTime(value)) {
                            if (value !== curSentence.endTime) {
                                if ((curSentence.startTime && fnSRTTimeToFloat(value) > fnSRTTimeToFloat(curSentence.startTime)) || !curSentence.startTime) {
                                    const newSentences = curParagraph.sentences.map((sentence) => (sentence.key == curSentence.key ? { ...curSentence, endTime: value ? value : "" } : sentence));
                                    const newParagraphs = paragraphs.map((paragraph) => (paragraph.key == curParagraph.key ? { ...paragraph, sentences: newSentences } : paragraph));
                                    if (onSubmit !== undefined) {
                                        onSubmit(newParagraphs);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    const handlersSentenceUpdateText = (value: string, key: string) => {
        if (value) {
            const keyPair = key.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                // prettier-ignore
                const text = value.split("\n---\n").map((v: string) => {
                    const s = v.split("\n");
                    return s[1] === undefined ? `${s[0].trim()}` : `${s[0].trim()}\n${s[1].trim()}`;
                }).join("\n---\n");
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[sKey];
                    if (curSentence !== undefined) {
                        if (text !== curSentence.texts.join("\n---\n")) {
                            const newSentences = curParagraph.sentences.map((sentence) => (sentence.key == curSentence.key ? { ...curSentence, texts: text ? text.split("\n---\n") : [] } : sentence));
                            const newParagraphs = paragraphs.map((paragraph) => (paragraph.key === curParagraph.key ? { ...paragraph, sentences: newSentences } : paragraph));
                            if (onSubmit !== undefined) {
                                onSubmit(newParagraphs);
                            }
                        }
                    }
                }
            }
        }
    };
    const handlersSentenceUpdateLinkings = async (list: string[]) => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const curParagraph = paragraphs[pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[sKey];
                    if (curSentence !== undefined) {
                        const newSentences = curParagraph.sentences.map((sentence) => (sentence.key == curSentence.key ? { ...curSentence, linkings: list ? list : [] } : sentence));
                        const newParagraphs = paragraphs.map((paragraph) => (paragraph.key == curParagraph.key ? { ...paragraph, sentences: newSentences } : paragraph));
                        if (onSubmit !== undefined) {
                            onSubmit(newParagraphs);
                        }
                        setLinkings(list);
                    }
                }
            }
        }
    };
    const handlersLinkingsEditorOpen = () => {
        if (refCurKey.current) {
            const keyPair = refCurKey.current.split("-");
            if (keyPair[0] !== undefined && keyPair[1] !== undefined) {
                const pKey = Number(keyPair[0]);
                const sKey = Number(keyPair[1]);
                const paragraph = paragraphs[pKey];
                const sentence = paragraph.sentences[sKey];
                setLinkings(sentence.linkings ? sentence.linkings : []);
                setLinkingsEditor(true);
            }
        }
    };
    const handlersLinkingsEditorClose = () => {
        setLinkingsEditor(false);
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
        openLinkingsEditor: handlersLinkingsEditorOpen,
    }));
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <div id="video-script-paragraphs">
            {paragraphs.map((paragraph, k) => {
                return (
                    <div className="paragraph" key={k}>
                        <div className="meta">
                            <Select size="small" onChange={(v) => handlersParagraphUpdateScene(v, paragraph.key)} defaultValue={paragraph.scene} options={scenes.map((v) => ({ label: v.value, value: v.index }))} />
                            <Mentions autoSize onChange={(v) => handlersParagraphUpdateRole(v, paragraph.key)} defaultValue={filterItemRoles(paragraph.roles)} options={roles.map((v) => ({ label: v, value: v }))} />
                        </div>
                        {paragraph.sentences.map((scene, k) => {
                            return (
                                <div className="sentence" key={k}>
                                    <Space size="small" className="time" direction="vertical">
                                        <Input size="small" className="time-input" defaultValue={scene.startTime} onFocus={(e) => handlersSetCurKey(scene.key)} onBlur={(e) => handlersSentenceUpdateStartTime(e.target.value, scene.key)} placeholder="00:00:00,000" />
                                        <Input size="small" className="time-input" defaultValue={scene.endTime} onFocus={(e) => handlersSetCurKey(scene.key)} onBlur={(e) => handlersSentenceUpdateEndTime(e.target.value, scene.key)} placeholder="00:00:00,001" />
                                    </Space>
                                    <Input.TextArea autoSize className="text" defaultValue={scene.texts.join("\n---\n")} onFocus={(e) => handlersSetCurKey(scene.key)} onBlur={(e) => handlersSentenceUpdateText(e.target.value, scene.key)} />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
            <EditorLinkings linkings={linkings} open={linkingsEditor} onClose={handlersLinkingsEditorClose} onSubmit={handlersSentenceUpdateLinkings} />
        </div>
    );
});

export default Paragraphs;
