import React, { useState, useRef, useEffect } from "react";
import { Vocab as DataVocab } from "../../types/Data";
import { Input, Button, Select, Drawer, Upload, message } from "antd";
import { PlusSquareOutlined, ReloadOutlined, RedoOutlined, MinusOutlined, ClearOutlined, ArrowUpOutlined, ArrowDownOutlined, LinkOutlined, FileImageOutlined } from "@ant-design/icons";
import { fnParseVocab, fnCheckVocabText, fnSRTTimeToFloat } from "../../utils/script";
import { fnBase64ToBlob } from "../../utils/util";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import { clipAudio } from "../../api/requestAuth";
import { vocabImageUpload, speechTTS, speechUpload, vocabImagePronunciationMove, vocabImagePronunciationRemove, fileMove, fileRemove, vocabCreate, vocabList } from "../../api/requestAuth";
import Audio, { AudioRef } from "../Public/Audio";
import "./EditorVocab.scss";

interface EditorVocabProps {
    hash: string;
    list: DataVocab[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (list: DataVocab[]) => void;
}

const inputTypeOptions = [
    { value: 1, label: "Listening" },
    { value: 5, label: "L & T" },
    { value: 6, label: "W & T" },
    { value: 7, label: "All" },
];

const pronounceSpeedOptions = [
    { value: 150, label: "Normal" },
    { value: 120, label: "Slow" },
    { value: 100, label: "Creeping" },
];

const pronounceCharacterOptions = [
    { value: 0, label: "Man" },
    { value: 1, label: "Woman" },
];

const pronounceEngineOptions = [
    { value: 0, label: "Google" },
    { value: 1, label: "Baidu" },
    { value: 2, label: "pyttsx3" },
];

const defaultVocab = { id: 0, text: "", type: 7, image: "", pronunciation: "" };

type Vocabulary = {
    id: number;
    definition: string;
    image: string;
    pronunciation: string;
    category: number;
};

const EditorVocab: React.FC<EditorVocabProps> = ({ hash, open, onClose, onSubmit }) => {
    const [list, setList] = useState<Vocabulary[]>([]);
    const [parsedVocab, setParsedVocab] = useState("");
    const [vocab, setVocab] = useState<DataVocab>(defaultVocab);
    const [vocabActive, setVocabActive] = useState(0);
    const [pronounceEngine, setPronounceEngine] = useState(0);
    const [pronounceVoice, setPronounceVoice] = useState(0);
    const [pronounceSpeed, setPronounceSpeed] = useState(150);
    const [clipTemp, setClipTemp] = useState("");
    const [clipTimeStart, setClipTimeStart] = useState(`00:00:00,000`);
    const [clipTimeEnd, setClipTimeEnd] = useState(`00:00:00,001`);
    const [messageApi, contextHolder] = message.useMessage();
    const refAudio = useRef<AudioRef>(null);
    const handlersParseVocab = (text: string) => {
        setParsedVocab(fnParseVocab(text));
    };
    const handlersVocabUpdateText = (value: string) => {
        setVocab({ ...vocab, text: value });
    };
    const handlersVocabUpdateType = (value: number) => {
        setVocab({ ...vocab, type: value });
    };
    const apiGetList = async () => {
        const res = await vocabList({ videoID: 1, page: 1, pageSize: 10 });
        console.log("res", res);
        if (res.code === 1) {
            setList(res.data.list);
        }
    };
    const handlersVocabUpdateImage = async (file: any) => {
        if (vocab.text && fnCheckVocabText(vocab.text)) {
            if (/^(.+?)\.(png|jpg)$/g.test(file.name) && (file.type === "image/png" || file.type === "image/jpeg")) {
                try {
                    const part = vocab.text.split(" | ");
                    const nameEN = part[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                    const nameCNHash = md5(part[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.png`;
                    const formData = new FormData();
                    formData.append("file", file, name);
                    const res = await vocabImageUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, image: res.data.filename });
                    }
                } catch (e: any) {
                    messageApi.open({
                        type: "error",
                        content: `${e.message}`,
                    });
                }
            } else {
                messageApi.open({
                    type: "error",
                    content: "Please upload a png or jpg image.",
                });
            }
        } else {
            messageApi.open({
                type: "error",
                content: "Vocab text format incorrect.",
            });
        }
    };
    const handlerPronounceUpdateEngine = (value: number) => {
        setPronounceEngine(value);
    };
    const handlersPronounceUpdateVoice = (value: number) => {
        setPronounceVoice(value);
    };
    const handlersPronounceUpdateSpeed = (value: number) => {
        setPronounceSpeed(value);
    };
    const handlersPronunciationClick = async () => {
        if (vocab.pronunciation) {
            const audioSrc = `${Domain}/upload/temp/${vocab.pronunciation}`;
            refAudio.current?.play(audioSrc, 1);
            window.open(audioSrc, "_blank");
        }
    };
    const handlersGenerateVocabPronunciation = async () => {
        if (vocab.text && fnCheckVocabText(vocab.text)) {
            try {
                const part = vocab.text.split(" | ");
                const content = part[0].replaceAll("/", ", ");
                const filenameEN = part[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                const filenameCNHash = md5(part[2]).slice(25);
                const filename = `${filenameEN}_${filenameCNHash}`;
                const res = await speechTTS({ engine: pronounceEngine, content, filename, voice: pronounceVoice, speed: pronounceSpeed });
                if (res.code) {
                    setVocab({ ...vocab, pronunciation: `${filename}.mp3` });
                    refAudio.current?.play(`${Domain}/upload/temp/${filename}.mp3?${Date.now()}`, 1);
                }
            } catch (e: any) {
                messageApi.open({
                    type: "error",
                    content: `${e.message}`,
                });
            }
        } else {
            messageApi.open({
                type: "error",
                content: "Vocab text format incorrect.",
            });
        }
    };
    const handlersUploadVocabPronunciation = async (file: any) => {
        if (vocab.text && fnCheckVocabText(vocab.text)) {
            if (/^(.+?)\.(mp3)$/g.test(file.name) && file.type === "audio/mpeg") {
                try {
                    const nameEN = vocab.text.split(" | ")[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                    const nameCNHash = md5(vocab.text.split(" | ")[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.mp3`;
                    const formData = new FormData();
                    formData.append("file", file, name);
                    const res = await speechUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, pronunciation: res.data.filename });
                        refAudio.current?.play(`${Domain}/upload/temp/${res.data.filename}?${Date.now()}`, 1);
                    }
                } catch (e: any) {
                    messageApi.open({
                        type: "error",
                        content: `${e.message}`,
                    });
                }
            } else {
                messageApi.open({
                    type: "error",
                    content: "Please upload a mp3 format audio.",
                });
            }
        } else {
            messageApi.open({
                type: "error",
                content: "Vocab text format incorrect.",
            });
        }
    };
    const handlersUploadVocabPronunciationBase64 = async (base64: string) => {
        if (vocab.text && fnCheckVocabText(vocab.text)) {
            const regGoogle = /\{\"translate\_tts\"\:\[\"(.+)\"\]\}/; // Google Translattion
            const match = base64.match(regGoogle);
            if (match && match[1]) {
                try {
                    const blob = fnBase64ToBlob(match[1], "audio/mpeg");
                    const nameEN = vocab.text.split(" | ")[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                    const nameCNHash = md5(vocab.text.split(" | ")[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.mp3`;
                    const formData = new FormData();
                    formData.append("file", blob, name);
                    const res = await speechUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, pronunciation: res.data.filename });
                        refAudio.current?.play(`${Domain}/upload/temp/${res.data.filename}?${Date.now()}`, 1);
                    }
                } catch (e: any) {
                    messageApi.open({
                        type: "error",
                        content: `${e.message}`,
                    });
                }
            } else {
                messageApi.open({
                    type: "error",
                    content: "Please input base64 string.",
                });
            }
        } else {
            messageApi.open({
                type: "error",
                content: "Vocab text format incorrect.",
            });
        }
    };
    const handlerVocabCreate = async () => {
        if (vocabActive === 0) {
            if (vocab.text && fnCheckVocabText(vocab.text) && vocab.pronunciation) {
                const res = await fileMove({ videoID: 1, image: vocab.image, pronunciation: vocab.pronunciation });
                if (res.code === 1) {
                    const res = await vocabCreate({ videoID: 1, definition: vocab.text, image: vocab.image, pronunciation: vocab.pronunciation, category: vocab.type });
                    // const newList = [...list];
                    // const vIDs = newList.map((item) => item.id);
                    // const id = vIDs.length === 0 ? 1 : Math.max(...vIDs) + 1;
                    // newList.unshift({ ...vocab, id });
                    // if (onSubmit !== undefined) {
                    //     setVocab(defaultVocab);
                    //     setParsedVocab("");
                    //     setVocabActive(0);
                    //     onSubmit(newList);
                    // }
                }
            }
        }
    };
    const handlersListDeleteItem = async () => {
        // const confirmed = window.confirm("Are you confirmed to delete?");
        // if (confirmed) {
        //     const curVocab = list.find(({ id }) => id === vocabActive);
        //     if (curVocab !== undefined && curVocab.text && curVocab.pronunciation) {
        //         const res = await vocabImagePronunciationRemove({ hash, vocabImage: curVocab.image, vocabPronunciation: curVocab.pronunciation });
        //         if (res.code === 1) {
        //             const curVocabIndex = list.findIndex(({ id }) => id === vocabActive);
        //             const a = list.slice(0, curVocabIndex);
        //             const b = list.slice(curVocabIndex + 1);
        //             if (onSubmit !== undefined) {
        //                 setVocab(defaultVocab);
        //                 setParsedVocab("");
        //                 setVocabActive(0);
        //                 onSubmit([...a, ...b]);
        //             }
        //         }
        //     }
        // }
    };
    const handlersListUpdateItem = async () => {
        // if (vocabActive !== 0) {
        //     if (vocab.text && fnCheckVocabText(vocab.text)) {
        //         const res = await vocabImagePronunciationMove({ hash, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
        //         if (res.code === 1) {
        //             const newList = list.map((item) => (item.id === vocabActive ? { ...item, text: vocab.text, type: vocab.type, image: vocab.image ? vocab.image : item.image, pronunciation: vocab.pronunciation ? vocab.pronunciation : item.pronunciation } : item));
        //             if (onSubmit !== undefined) {
        //                 setVocab(defaultVocab);
        //                 setParsedVocab("");
        //                 setVocabActive(0);
        //                 onSubmit(newList);
        //             }
        //         }
        //     }
        // }
    };
    const handlersListUpItem = () => {
        // if (vocabActive !== 0) {
        //     const vocabIndex = list.findIndex(({ id }) => id === vocabActive);
        //     const newList = [...list];
        //     const a = newList.slice(0, vocabIndex);
        //     const b = newList.slice(vocabIndex);
        //     const upOne = a.pop();
        //     const theOne = b.shift();
        //     if (theOne) {
        //         a.push(theOne);
        //     }
        //     if (upOne) {
        //         b.unshift(upOne);
        //     }
        //     if (onSubmit !== undefined) {
        //         onSubmit([...a, ...b]);
        //     }
        //     setVocabActive(vocabActive);
        // }
    };
    const handlersListDownItem = () => {
        // if (vocabActive !== 0) {
        //     const vocabIndex = list.findIndex(({ id }) => id === vocabActive);
        //     const newList = [...list];
        //     const a = newList.slice(0, vocabIndex);
        //     const b = newList.slice(vocabIndex);
        //     const theOne = b.shift();
        //     const downOne = b.shift();
        //     if (theOne) {
        //         b.unshift(theOne);
        //     }
        //     if (downOne) {
        //         b.unshift(downOne);
        //     }
        //     if (onSubmit !== undefined) {
        //         onSubmit([...a, ...b]);
        //     }
        //     setVocabActive(vocabActive);
        // }
    };
    const handlerClickVocab = (vocabID: number) => {
        // if (list.length > 0) {
        //     setVocabActive(vocabID);
        //     const vocab = list.find(({ id }) => id === vocabID);
        //     if (vocab && vocab.text && vocab.pronunciation) {
        //         setVocab({ ...defaultVocab, id: vocab.id, text: vocab.text, type: vocab.type ? vocab.type : 7 });
        //         refAudio.current?.play(`${Domain}/data/pronunciation/1/${vocab.pronunciation}?${Date.now()}`, 1);
        //     }
        // }
    };
    const handlersClearTemp = () => {
        if (list.length > 0) {
            setVocabActive(0);
            setVocab(defaultVocab);
        }
    };
    const handlersClipGenerate = async () => {
        const start = Number(fnSRTTimeToFloat(clipTimeStart));
        const end = Number(fnSRTTimeToFloat(clipTimeEnd));
        if (end > start) {
            const nameText = `${Date.now()}`;
            const name = `${md5(nameText).slice(25)}`;
            const res = await clipAudio({ hash, name, start, end });
            if (res.code === 1) {
                setClipTemp(`${name}.mp3`);
                refAudio.current?.play(`${Domain}/upload/temp/${name}.mp3`, 1);
            }
        }
    };
    const handlersClipClick = () => {
        if (clipTemp) {
            window.open(`${Domain}/data/upload/temp/${clipTemp}`, "_blank");
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    useEffect(() => {
        apiGetList();
        return () => {};
    }, []);
    return (
        <Drawer id="video-script-editor-vocab" title="Edit Vocab" width={800} size="large" onClose={handlersOnClose} open={open}>
            {onSubmit && (
                <div className="vocab-panel">
                    <Input.TextArea autoSize value={parsedVocab} onChange={(e) => handlersParseVocab(e.target.value)} />
                    <div className="panel-base">
                        <Input className="text" value={vocab.text} onChange={(e) => handlersVocabUpdateText(e.target.value)} style={{ borderRadius: "0", color: "#000" }} />
                        <Select style={{ width: 100 }} value={vocab.type} onChange={handlersVocabUpdateType} options={inputTypeOptions} />
                        <div className="image">{vocab.image && <img src={`${Domain}/data/temp/${vocab.image}`} />}</div>
                        <Upload beforeUpload={handlersVocabUpdateImage} showUploadList={false}>
                            <Button icon={<FileImageOutlined />} />
                        </Upload>
                    </div>
                    <div className="panel-audio">
                        <Select style={{ width: 120 }} value={pronounceEngine} onChange={handlerPronounceUpdateEngine} options={pronounceEngineOptions} />
                        <div className={`audio-meta${pronounceEngine === 2 ? " visible" : ""}`}>
                            <Select value={pronounceVoice} onChange={handlersPronounceUpdateVoice} options={pronounceCharacterOptions} />
                            <Select value={pronounceSpeed} onChange={handlersPronounceUpdateSpeed} options={pronounceSpeedOptions} />
                        </div>
                        <Input className="base64" value={``} onChange={(e) => handlersUploadVocabPronunciationBase64(e.target.value)} />
                        <Button className="pa-btn" onClick={handlersPronunciationClick} icon={<LinkOutlined />} />
                        <Button className="pa-btn" icon={<RedoOutlined />} onClick={handlersGenerateVocabPronunciation} />
                        <Upload className="pa-btn" beforeUpload={handlersUploadVocabPronunciation} showUploadList={false}>
                            <Button icon={<PlusSquareOutlined />} />
                        </Upload>
                    </div>
                    <div className="panel-clip">
                        <Input value={clipTimeStart} onChange={(e) => setClipTimeStart(e.target.value)} />
                        <MinusOutlined />
                        <Input value={clipTimeEnd} onChange={(e) => setClipTimeEnd(e.target.value)} />
                        <Button className="pc-btn" onClick={handlersClipClick} icon={<LinkOutlined />} />
                        <Button className="pc-btn" icon={<ReloadOutlined />} onClick={handlersClipGenerate} />
                    </div>
                    <div className="submit">
                        <Button icon={<ReloadOutlined />} onClick={handlersListUpdateItem} />
                        <Button icon={<ArrowUpOutlined />} onClick={handlersListUpItem} />
                        <Button icon={<ArrowDownOutlined />} onClick={handlersListDownItem} />
                        <Button icon={<ClearOutlined />} onClick={handlersClearTemp} />
                        <Button icon={<MinusOutlined />} onClick={handlersListDeleteItem} />
                        <Button icon={<PlusSquareOutlined />} onClick={handlerVocabCreate} />
                    </div>
                </div>
            )}
            <div className="vocab-list">
                {list.length > 0 &&
                    list.map((value, key) => {
                        return (
                            <div key={value.id} className={vocabActive === value.id ? "item active" : "item"} onClick={() => handlerClickVocab(value.id)}>
                                <span className="text">
                                    <i className="index">[{key + 1}] </i>
                                    {value.definition}
                                </span>
                                <span className="img">{value.image && <img src={`${Domain}/data/1/image/${value.image}`} />}</span>
                            </div>
                        );
                    })}
            </div>
            <Audio ref={refAudio} loop={false}></Audio>
            {contextHolder}
        </Drawer>
    );
};

export default EditorVocab;
