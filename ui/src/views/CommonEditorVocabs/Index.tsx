import React, { useState, useRef, useEffect } from "react";
import { Vocab as DataVocab } from "../../types/Data";
import { Input, Button, Select, Drawer, Upload } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, RedoOutlined } from "@ant-design/icons";
import { fnParseVocabs } from "../../utils/script";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import { vocabImageUpload, vocabPronunciationGenerate, vocabPronunciationUpload } from "../../api/requestAuth";
import "./Index.scss";

interface CommonEditorVocabsProps {
    open: boolean;
    vocabs: DataVocab[];
    onClose?: () => void;
    onSubmit?: (vocab: DataVocab) => void;
    onRemove?: (index: number) => void;
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

const CommonEditorVocabs: React.FC<CommonEditorVocabsProps> = ({ open, vocabs, onClose, onSubmit, onRemove }) => {
    const [parsedVocabs, setParsedVocabs] = useState("");
    const [vocab, setVocab] = useState<DataVocab>(defaultVocab);
    const [vocabActive, setVocabActive] = useState(0);
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
    const handlersUpdateVocabPronunciation = async (file: any) => {
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
    const handlersClickVocab = (index: number) => {
        if (vocabs.length > 0) {
            setVocabActive(index);
            const vocab = vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refVocabAudio.current) {
                    const audio = refVocabAudio.current;
                    audio.src = vocab.pronunciation;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    const handlersOnSubmit = async () => {
        if (vocab.text && vocab.pronunciation) {
            if (onSubmit !== undefined) {
                onSubmit({ ...vocab });
                setVocab(defaultVocab);
                setParsedVocabs("");
            }
        }
    };
    const handlersOnRemove = async () => {
        const confirmed = window.confirm("Do you confirm to delete?");
        if (confirmed) {
            if (onRemove !== undefined) {
                onRemove(vocabActive);
                setVocab(defaultVocab);
                setVocabActive(0);
            }
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
        <Drawer id="common-editor-vocabs-index" title="Edit Vocabs" size="large" onClose={handlersOnClose} open={open}>
            {onSubmit && onRemove && (
                <div className="vocab-panel">
                    <Input.TextArea autoSize value={parsedVocabs} onChange={(e) => handlersParseVocabs(e.target.value)} placeholder="Paste Vocabs" />
                    <div className="text-image-btn">
                        <Input className="text" value={vocab.text} onChange={(e) => handlersUpdateVocabText(e.target.value)} style={{ borderRadius: "0", color: "#000" }} placeholder="pronunciation/pronunciations | prəˌnʌnsiˈeɪʃn | n.读音;发音" />
                        <div className="image">{vocab.image && <img src={`${Domain}/data/temp/${vocab.image}`} />}</div>
                        <Upload beforeUpload={handlersUpdateVocabImage} showUploadList={false}>
                            <Button icon={<PlusSquareOutlined />} />
                        </Upload>
                    </div>
                    <div className="audio-btn">
                        <Select style={{ width: 120 }} value={vocab.voice} onChange={handlersUpdateVocabPronounceVoice} options={voiceOptions} />
                        <Select style={{ width: 120 }} value={vocab.speed} onChange={handlersUpdateVocabPronounceSpeed} options={speedOptions} />
                        <Button className="play" onClick={handlersPlayVocabPronunciation}>
                            {vocab.pronunciation}
                        </Button>
                        <Button className="gen" icon={<RedoOutlined />} onClick={handlersGenerateVocabPronunciation} />
                        <Upload beforeUpload={handlersUpdateVocabPronunciation} showUploadList={false}>
                            <Button icon={<PlusSquareOutlined />} />
                        </Upload>
                    </div>
                    <div className="btn">
                        <Button icon={<MinusSquareOutlined />} onClick={handlersOnRemove} />
                        <Button icon={<PlusSquareOutlined />} onClick={handlersOnSubmit} />
                    </div>
                </div>
            )}
            <div className="vocab-list">
                {vocabs.length > 0 &&
                    vocabs.map((value, key) => {
                        return (
                            <div key={key} className={vocabActive === key ? "item active" : "item"} onClick={() => handlersClickVocab(key)}>
                                <span className="text">
                                    <i className="index">[{key + 1}] </i>
                                    {value.text}
                                </span>
                                <span className="img">{value.image && <img src={value.image} />}</span>
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
