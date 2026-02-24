import React, { useState, useRef, useEffect } from "react";
import { Vocab as DataVocab } from "../../types/Data";
import { Input, Button, Select, Drawer, Upload } from "antd";
import { PlusSquareOutlined, ReloadOutlined, RedoOutlined, MinusOutlined, ClearOutlined } from "@ant-design/icons";
import { fnParseVocabs } from "../../utils/script";
import { fnBase64ToBlob } from "../../utils/util";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import { vocabImageUpload, vocabPronunciationGenerate, vocabPronunciationUpload, vocabImagePronunciationMove, vocabImagePronunciationRemove } from "../../api/requestAuth";
import "./Index.scss";

interface CommonEditorVocabsProps {
    plan: string;
    list: DataVocab[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (list: DataVocab[]) => void;
}

const speedOptions = [
    { value: 150, label: "Normal" },
    { value: 120, label: "Slow" },
    { value: 100, label: "Very Slow" },
];

const voiceOptions = [
    { value: 0, label: "Man-0" },
    { value: 1, label: "Woman-1" },
];

const defaultVocab = { text: "", image: "", voice: 0, speed: 150, pronunciation: "" };

const CommonEditorVocabs: React.FC<CommonEditorVocabsProps> = ({ plan, list, open, onClose, onSubmit }) => {
    const [parsedVocabs, setParsedVocabs] = useState("");
    const [vocab, setVocab] = useState<DataVocab>(defaultVocab);
    const [vocabActive, setVocabActive] = useState(-1);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refVocabAudio = useRef<HTMLAudioElement>(null);
    const handlersParseVocabs = (text: string) => {
        setParsedVocabs(fnParseVocabs(text));
    };
    const handlersUpdateVocabText = (value: string) => {
        setVocab({ ...vocab, text: value });
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
    const handlersUpdateVocabPronounceVoice = (value: number) => {
        setVocab({ ...vocab, voice: value });
    };
    const handlersUpdateVocabPronounceSpeed = (value: number) => {
        setVocab({ ...vocab, speed: value });
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
                const filenameEN = part[0].replaceAll(/[\s\,\/\:\?\.\%]+/g, "_");
                const filenameCNHash = md5(part[2]).slice(25);
                const filename = `${filenameEN}_${filenameCNHash}.mp3`;
                const res = await vocabPronunciationGenerate({ content, filename, voice: vocab.voice, speed: vocab.speed });
                if (res.code) {
                    setVocab({ ...vocab, pronunciation: filename });
                    if (refAudio.current) {
                        const audio = refAudio.current;
                        audio.src = "data:audio/mpeg;base64," + res.data;
                        audio.load();
                        audio.play();
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    const handlersUploadVocabPronunciation = async (file: any) => {
        if (vocab.text) {
            if (/^(.+?)\.(mp3)$/g.test(file.name) && file.type === "audio/mpeg") {
                try {
                    const nameEN = vocab.text.split(" | ")[0].replaceAll(/[\s\,\/\:\?\.\%]+/g, "_");
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
                alert("Please upload a mp3 format audio.");
            }
        } else {
            alert("Please type vocab text.");
        }
    };
    const handlersUploadVocabPronunciationBase64 = async (base64: string) => {
        if (vocab.text) {
            const regGoogle = /\{\"translate\_tts\"\:\[\"(.+)\"\]\}/; // Google Translattion
            const match = base64.match(regGoogle);
            if (match && match[1]) {
                try {
                    const blob = fnBase64ToBlob(match[1], "audio/mpeg");
                    const nameEN = vocab.text.split(" | ")[0].replaceAll(/[\s\,\/\:\?\.\%]+/g, "_");
                    const nameCNHash = md5(vocab.text.split(" | ")[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.mp3`;
                    const formData = new FormData();
                    formData.append("file", blob, name);
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
                alert("Please input base64 string.");
            }
        } else {
            alert("Please type vocab text.");
        }
    };
    const handlersListUnshiftItem = async () => {
        if (vocabActive === -1) {
            if (vocab.text && vocab.pronunciation) {
                const res = await vocabImagePronunciationMove({ plan: plan, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
                if (res.code === 1) {
                    const newList = [...list];
                    newList.unshift(vocab);
                    if (onSubmit !== undefined) {
                        setVocab(defaultVocab);
                        setParsedVocabs("");
                        setVocabActive(-1);
                        onSubmit(newList);
                    }
                }
            }
        }
    };
    const handlersListDeleteItem = async () => {
        const confirmed = window.confirm("Are you confirmed to delete?");
        if (confirmed) {
            const curVocab = list[vocabActive];
            if (curVocab !== undefined && curVocab.text && curVocab.pronunciation) {
                const res = await vocabImagePronunciationRemove({ plan: plan, vocabImage: curVocab.image, vocabPronunciation: curVocab.pronunciation });
                if (res.code === 1) {
                    const a = list.slice(0, vocabActive);
                    const b = list.slice(vocabActive + 1);
                    const newList = [...a, ...b];
                    if (onSubmit !== undefined) {
                        setVocab(defaultVocab);
                        setParsedVocabs("");
                        setVocabActive(-1);
                        onSubmit(newList);
                    }
                }
            }
        }
    };
    const handlersListUpdateItem = () => {
        if (vocabActive !== -1) {
            if (vocab.text) {
                const newList = list.map((item, index) => (index === vocabActive ? { ...item, text: vocab.text } : item));
                if (onSubmit !== undefined) {
                    setVocab(defaultVocab);
                    setParsedVocabs("");
                    setVocabActive(-1);
                    onSubmit(newList);
                }
            }
        }
    };
    const handlersClickVocab = (index: number) => {
        if (list.length > 0) {
            setVocabActive(index);
            const vocab = list[index];
            if (vocab && vocab.text && vocab.pronunciation) {
                setVocab({ ...defaultVocab, text: vocab.text });
                if (refVocabAudio.current) {
                    const audio = refVocabAudio.current;
                    audio.src = `${Domain}/data/${plan}/vocab_pronunciations/${vocab.pronunciation}`;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    const handlersClearTemp = () => {
        if (list.length > 0) {
            setVocabActive(-1);
            setVocab(defaultVocab);
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="common-editor-vocabs-index" title="Edit Vocabs" width={800} size="large" onClose={handlersOnClose} open={open}>
            {onSubmit && (
                <div className="vocab-panel">
                    <Input.TextArea autoSize value={parsedVocabs} onChange={(e) => handlersParseVocabs(e.target.value)} />
                    <div className="text-image-btn">
                        <Input className="text" value={vocab.text} onChange={(e) => handlersUpdateVocabText(e.target.value)} style={{ borderRadius: "0", color: "#000" }} />
                        <div className="image">{vocab.image && <img src={`${Domain}/data/temp/${vocab.image}`} />}</div>
                        <Upload beforeUpload={handlersUpdateVocabImage} showUploadList={false}>
                            <Button icon={<PlusSquareOutlined />} />
                        </Upload>
                    </div>
                    <div className="audio-player">
                        <Button onClick={handlersPlayVocabPronunciation}>{vocab.pronunciation}</Button>
                    </div>
                    <div className="audio-btn">
                        <Select style={{ width: 120 }} value={vocab.voice} onChange={handlersUpdateVocabPronounceVoice} options={voiceOptions} />
                        <Select style={{ width: 120 }} value={vocab.speed} onChange={handlersUpdateVocabPronounceSpeed} options={speedOptions} />
                        <Input className="base64" value={``} onChange={(e) => handlersUploadVocabPronunciationBase64(e.target.value)} />
                        <Button className="gen" icon={<RedoOutlined />} onClick={handlersGenerateVocabPronunciation} />
                        <Upload beforeUpload={handlersUploadVocabPronunciation} showUploadList={false}>
                            <Button icon={<PlusSquareOutlined />} />
                        </Upload>
                    </div>
                    <div className="btn">
                        <Button icon={<ReloadOutlined />} onClick={handlersListUpdateItem} />
                        <Button icon={<ClearOutlined />} onClick={handlersClearTemp} />
                        <Button icon={<MinusOutlined />} onClick={handlersListDeleteItem} />
                        <Button icon={<PlusSquareOutlined />} onClick={handlersListUnshiftItem} />
                    </div>
                </div>
            )}
            <div className="vocab-list">
                {list.length > 0 &&
                    list.map((value, key) => {
                        return (
                            <div key={key} className={vocabActive === key ? "item active" : "item"} onClick={() => handlersClickVocab(key)}>
                                <span className="text">
                                    <i className="index">[{key + 1}] </i>
                                    {value.text}
                                </span>
                                <span className="img">{value.image && <img src={`${Domain}/data/${plan}/vocab_images/${value.image}`} />}</span>
                            </div>
                        );
                    })}
            </div>
            <section style={{ display: "none" }}>
                <audio ref={refAudio}></audio>
                <audio ref={refVocabAudio}></audio>
            </section>
        </Drawer>
    );
};

export default CommonEditorVocabs;
