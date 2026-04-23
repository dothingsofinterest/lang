import React, { useState, useRef, useEffect } from "react";
import { Vocab as DataVocab } from "../../types/Data";
import { Input, Button, Select, Drawer, Upload, message } from "antd";
import { PlusSquareOutlined, ReloadOutlined, RedoOutlined, MinusOutlined, ClearOutlined, ArrowUpOutlined, ArrowDownOutlined, LinkOutlined, FileImageOutlined } from "@ant-design/icons";
import { fnParseVocab } from "../../utils/script";
import { fnBase64ToBlob } from "../../utils/util";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import { vocabCreate, vocabUpdate, vocabRemove, vocabList, speechTTS, speechUpload, vocabFileMove, vocabFileRemove, vocabFileUploadImage, audioClip } from "../../api/requestAuth";
import Audio, { AudioRef } from "../Public/Audio";
import { Pagination } from "antd";
import "./EditorVocab.scss";

interface EditorVocabProps {
    videoID: number;
    open: boolean;
    onClose?: () => void;
    onSubmit?: (list: DataVocab[]) => void;
}

interface ListParams {
    page: number;
    pageSize: number;
    totalPages: number;
    keyword?: string;
}

const checkVocabDefinition = (text: string) => /^(.+) \| (.+) \| (.+)$/.test(text);

const inputTypeOptions = [
    { value: 1, label: "Listening" },
    { value: 5, label: "L & T" },
    { value: 6, label: "W & T" },
    { value: 7, label: "All" },
];

const speechSpeedOptions = [
    { value: 150, label: "Normal" },
    { value: 120, label: "Slow" },
    { value: 100, label: "Creeping" },
];

const speechCharacterOptions = [
    { value: 0, label: "Man" },
    { value: 1, label: "Woman" },
];

const speechEngineOptions = [
    { value: 0, label: "Google" },
    { value: 1, label: "Baidu" },
    { value: 2, label: "pyttsx3" },
];

const defaultVocab = {
    id: 0,
    definition: "",
    image: "",
    speech: "",
    category: 7,
};

const EditorVocab: React.FC<EditorVocabProps> = ({ videoID, open, onClose, onSubmit }) => {
    const [list, setList] = useState<DataVocab[]>([]);
    const [listParams, setListParams] = useState<ListParams>({ page: 1, pageSize: 10, totalPages: 0, keyword: "" });
    const [parsedVocab, setParsedVocab] = useState("");
    const [vocab, setVocab] = useState<DataVocab>(defaultVocab);
    const [speechEngine, setSpeechEngine] = useState(0);
    const [speechVoice, setSpeechVoice] = useState(0);
    const [speechSpeed, setSpeechSpeed] = useState(150);
    const [clipTemp, setClipTemp] = useState("");
    const [clipTimeStart, setClipTimeStart] = useState(`0`);
    const [clipTimeEnd, setClipTimeEnd] = useState(`0.1`);
    const [messageApi, contextHolder] = message.useMessage();
    const refAudio = useRef<AudioRef>(null);
    const handlerParseVocab = (text: string) => {
        setParsedVocab(fnParseVocab(text));
    };
    const handlerVocabUpdateText = (value: string) => {
        setVocab({ ...vocab, definition: value });
    };
    const handlerVocabUpdateCate = (value: number) => {
        setVocab({ ...vocab, category: value });
    };
    const apiGetVocabList = async (listParams: ListParams) => {
        const res = await vocabList({
            page: listParams.page,
            pageSize: listParams.pageSize,
            keyword: listParams.keyword,
        });
        if (res.code === 1) {
            setList(res.data.list);
            setListParams(res.data.listParams);
        }
    };
    const handlerVocabUpdateImage = async (file: any) => {
        if (checkVocabDefinition(vocab.definition)) {
            if (/^(.+?)\.(png|jpg)$/g.test(file.name) && (file.type === "image/png" || file.type === "image/jpeg")) {
                try {
                    const part = vocab.definition.split(" | ");
                    const nameEN = part[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                    const nameCNHash = md5(part[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.png`;
                    const formData = new FormData();
                    formData.append("file", file, name);
                    const res = await vocabFileUploadImage({}, formData);
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
    const handlerSpeechUpdateEngine = (value: number) => {
        setSpeechEngine(value);
    };
    const handlerSpeechUpdateVoice = (value: number) => {
        setSpeechVoice(value);
    };
    const handlerSpeechUpdateSpeed = (value: number) => {
        setSpeechSpeed(value);
    };
    const handlerSpeechPlay = async () => {
        if (vocab.speech) {
            const audioSrc = `${Domain}/upload/temp/${vocab.speech}`;
            refAudio.current?.play(audioSrc, 1);
            window.open(audioSrc, "_blank");
        }
    };
    const handlerSpeechGenerate = async () => {
        if (vocab.definition && checkVocabDefinition(vocab.definition)) {
            try {
                const part = vocab.definition.split(" | ");
                const content = part[0].replaceAll("/", ", ");
                const filenameEN = part[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                const filenameCNHash = md5(part[2]).slice(25);
                const filename = `${filenameEN}_${filenameCNHash}`;
                const res = await speechTTS({ engine: speechEngine, content, filename, voice: speechVoice, speed: speechSpeed });
                if (res.code) {
                    setVocab({ ...vocab, speech: `${filename}.mp3` });
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
    const handlerSpeechUpload = async (file: any) => {
        if (checkVocabDefinition(vocab.definition)) {
            if (/^(.+?)\.(mp3)$/g.test(file.name) && file.type === "audio/mpeg") {
                try {
                    const nameEN = vocab.definition.split(" | ")[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                    const nameCNHash = md5(vocab.definition.split(" | ")[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.mp3`;
                    const formData = new FormData();
                    formData.append("file", file, name);
                    const res = await speechUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, speech: res.data.filename });
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
    const handlerSpeechUploadBase64 = async (base64: string) => {
        if (checkVocabDefinition(vocab.definition)) {
            const regGoogle = /\{\"translate\_tts\"\:\[\"(.+)\"\]\}/; // Google Translattion
            const match = base64.match(regGoogle);
            if (match && match[1]) {
                try {
                    const blob = fnBase64ToBlob(match[1], "audio/mpeg");
                    const nameEN = vocab.definition.split(" | ")[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                    const nameCNHash = md5(vocab.definition.split(" | ")[2]).slice(25);
                    const name = `${nameEN}_${nameCNHash}.mp3`;
                    const formData = new FormData();
                    formData.append("file", blob, name);
                    const res = await speechUpload({}, formData);
                    if (res.code === 1) {
                        setVocab({ ...vocab, speech: res.data.filename });
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
        if (vocab.id === 0) {
            if (checkVocabDefinition(vocab.definition) && vocab.speech) {
                const resFile = await vocabFileMove({
                    videoID,
                    image: vocab.image,
                    speech: vocab.speech,
                });
                const resVocab = await vocabCreate({
                    definition: vocab.definition,
                    image: vocab.image,
                    speech: vocab.speech,
                    category: vocab.category,
                });
                if (resFile.code === 1 && resVocab.code === 1) {
                    await apiGetVocabList(listParams);
                }
            }
        }
    };
    const handlerVocabUpdate = async () => {
        if (vocab.id !== 0) {
            if (checkVocabDefinition(vocab.definition) && vocab.speech) {
                const resFile = await vocabFileMove({
                    videoID,
                    image: vocab.image,
                    speech: vocab.speech,
                });
                const resVocab = await vocabUpdate({
                    id: vocab.id,
                    definition: vocab.definition,
                    image: vocab.image,
                    speech: vocab.speech,
                    category: vocab.category,
                });
                if (resFile.code === 1 && resVocab.code === 1) {
                    await apiGetVocabList(listParams);
                }
            }
        }
    };
    const handlerVocabRemove = async () => {
        const confirmed = window.confirm("Are you confirmed to delete?");
        if (confirmed) {
            if (vocab.id !== 0) {
                if (checkVocabDefinition(vocab.definition) && vocab.speech) {
                    const resFile = await vocabFileRemove({
                        videoID,
                        image: vocab.image,
                        speech: vocab.speech,
                    });
                    const resVocab = await vocabRemove({ id: vocab.id });
                    if (resFile.code === 1 && resVocab.code === 1) {
                        await apiGetVocabList(listParams);
                    }
                }
            }
        }
    };
    const handlerVocabActivate = (vocab: DataVocab) => {
        if (vocab) {
            setVocab({ ...defaultVocab, id: vocab.id, definition: vocab.definition, category: vocab.category ? vocab.category : 7 });
            refAudio.current?.play(`${Domain}/data/${videoID}/speech/${vocab.speech}?${Date.now()}`, 1);
        }
    };
    const handlerVocabInactivate = () => {
        setVocab(defaultVocab);
    };
    const handlerClipGenerate = async () => {
        const startTime = Number(clipTimeStart);
        const endTime = Number(clipTimeEnd);
        if (endTime > startTime) {
            const nameText = `${Date.now()}`;
            const name = `${md5(nameText).slice(25)}`;
            const res = await audioClip({ videoID, name, startTime, endTime });
            if (res.code === 1) {
                setClipTemp(`${name}.mp3`);
                refAudio.current?.play(`${Domain}/upload/temp/${name}.mp3`, 1);
            }
        }
    };
    const handlerClipOpen = () => {
        if (clipTemp) {
            window.open(`${Domain}/data/upload/temp/${clipTemp}`, "_blank");
        }
    };
    const handlerOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    useEffect(() => {
        apiGetVocabList(listParams);
        return () => {};
    }, []);
    return (
        <Drawer id="video-script-editor-vocab" title="Edit Vocab" width={800} size="large" onClose={handlerOnClose} open={open}>
            <div className="vocab-panel">
                <Input.TextArea autoSize value={parsedVocab} onChange={(e) => handlerParseVocab(e.target.value)} />
                <div className="panel-base">
                    <Input className="text" value={vocab.definition} onChange={(e) => handlerVocabUpdateText(e.target.value)} style={{ borderRadius: "0", color: "#000" }} />
                    <Select style={{ width: 100 }} value={vocab.category} onChange={handlerVocabUpdateCate} options={inputTypeOptions} />
                    <div className="image">{vocab.image && <img src={`${Domain}/data/temp/${vocab.image}`} />}</div>
                    <Upload beforeUpload={handlerVocabUpdateImage} showUploadList={false}>
                        <Button icon={<FileImageOutlined />} />
                    </Upload>
                </div>
                <div className="panel-audio">
                    <Select style={{ width: 120 }} value={speechEngine} onChange={handlerSpeechUpdateEngine} options={speechEngineOptions} />
                    <div className={`audio-meta${speechEngine === 2 ? " visible" : ""}`}>
                        <Select value={speechVoice} onChange={handlerSpeechUpdateVoice} options={speechCharacterOptions} />
                        <Select value={speechSpeed} onChange={handlerSpeechUpdateSpeed} options={speechSpeedOptions} />
                    </div>
                    <Input className="base64" value={``} onChange={(e) => handlerSpeechUploadBase64(e.target.value)} />
                    <Button className="pa-btn" onClick={handlerSpeechPlay} icon={<LinkOutlined />} />
                    <Button className="pa-btn" icon={<RedoOutlined />} onClick={handlerSpeechGenerate} />
                    <Upload className="pa-btn" beforeUpload={handlerSpeechUpload} showUploadList={false}>
                        <Button icon={<PlusSquareOutlined />} />
                    </Upload>
                </div>
                <div className="panel-clip">
                    <Input value={clipTimeStart} onChange={(e) => setClipTimeStart(e.target.value)} />
                    <MinusOutlined />
                    <Input value={clipTimeEnd} onChange={(e) => setClipTimeEnd(e.target.value)} />
                    <Button className="pc-btn" onClick={handlerClipOpen} icon={<LinkOutlined />} />
                    <Button className="pc-btn" icon={<ReloadOutlined />} onClick={handlerClipGenerate} />
                </div>
                <div className="submit">
                    <Button icon={<ReloadOutlined />} onClick={handlerVocabUpdate} />
                    <Button icon={<ClearOutlined />} onClick={handlerVocabInactivate} />
                    <Button icon={<MinusOutlined />} onClick={handlerVocabRemove} />
                    <Button icon={<PlusSquareOutlined />} onClick={handlerVocabCreate} />
                </div>
            </div>
            <div className="vocab-list">
                {list.length > 0 &&
                    list.map((value, key) => {
                        return (
                            <div key={value.id} className={vocab.id === value.id ? "item active" : "item"} onClick={() => handlerVocabActivate(value)}>
                                <span className="text">
                                    <i className="index">[{key + 1}] </i>
                                    {value.definition}
                                </span>
                                <span className="img">{value.image && <img src={`${Domain}/data/${videoID}/image/${value.image}`} />}</span>
                            </div>
                        );
                    })}
            </div>
            <div className="vocab-pagination">
                <Pagination defaultCurrent={1} total={listParams.pageSize * listParams.totalPages} />;
            </div>
            <Audio ref={refAudio} loop={false}></Audio>
            {contextHolder}
        </Drawer>
    );
};

export default EditorVocab;
