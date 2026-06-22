import React, { useState, useRef, useEffect } from "react";
import { Vocabulary } from "../../types/Data";
import { Input, Button, Select, Upload, Drawer } from "antd";
// prettier-ignore
import { 
    PlusSquareOutlined, 
    ReloadOutlined, 
    RedoOutlined, 
    PlusCircleOutlined, 
    DownloadOutlined,
    MinusOutlined, 
    ClearOutlined, 
    LinkOutlined, 
    FileImageOutlined 
} from "@ant-design/icons";
import { fnParseVocab } from "../../utils/script";
import { fnBase64ToBlob } from "../../utils/util";
import { updateScriptVocabList } from "../../stores/reducers/script";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import { RootState } from "../../stores";
// prettier-ignore
import { 
    vocabCreate, 
    vocabUpdate, 
    vocabRemove, 
    vocabList, 
    speechTTS, 
    speechUpload, 
    vocabFileMove, 
    vocabFileRemove, 
    vocabFileUploadImage, 
    scriptVocabList, 
    scriptVocabCreate, 
    scriptVocabRemove,
    vocabFileExportSpeech
} from "../../api/requestAuth";
import {} from "../../api/requestAuth";
import Audio, { AudioRef } from "../Public/Audio";
import { useSelector, useDispatch } from "react-redux";
import { Pagination } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import "./Index.scss";

interface Props {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (list: Vocabulary[]) => void;
}

interface ListQuery {
    page: number;
    pageSize: number;
    keyword?: string;
}

const checkVocabDefinition = (text: string) => /^(.+) \| (.+) \| (.+)$/.test(text);

const AssetsPrefix = `${Domain}/database`;
const UploadPrefix = `${Domain}/upload/temp`;

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
    { value: 2, label: "Youdao" },
    { value: 3, label: "pyttsx3" },
];

const defaultVocab = {
    id: 0,
    definition: "",
    image: "",
    speech: "",
    category: 7,
};

const defaultListQuery = {
    page: 1,
    pageSize: 10,
};

const Index: React.FC<Props> = ({ open, onClose, onSubmit }) => {
    const dispatch = useDispatch();
    const scriptId = useSelector((state: RootState) => state.script.scriptId);
    const scriptVocabularyList = useSelector((state: RootState) => state.script.scriptVocabList);
    const [list, setList] = useState<Vocabulary[]>([]);
    const [listQuery, setListQuery] = useState<ListQuery>(defaultListQuery);
    const [dataTotal, setDataTotal] = useState<number>(0);
    const [parsedVocab, setParsedVocab] = useState("");
    const [vocab, setVocab] = useState<Vocabulary>(defaultVocab);
    const [speechEngine, setSpeechEngine] = useState(0);
    const [speechVoice, setSpeechVoice] = useState(0);
    const [speechSpeed, setSpeechSpeed] = useState(150);
    const [keyword, setKeyword] = useState("");
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
                    alert(`${e.message}`);
                }
            } else {
                alert(`Please upload a png or jpg image.`);
            }
        } else {
            alert(`Vocab text format incorrect.`);
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
            const audioSrc = `${UploadPrefix}/${vocab.speech}`;
            refAudio.current?.play(audioSrc, 1);
            window.open(audioSrc, "_blank");
        }
    };
    const handlerSpeechGenerate = async () => {
        if (vocab.definition && checkVocabDefinition(vocab.definition)) {
            try {
                const part = vocab.definition.split(" | ");
                const content = part[0].replaceAll("/", ", ");
                // const filenameEN = part[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                const filenameEN = part[0].replaceAll(/[^a-zA-Z0-9\-]+/g, "_");
                const filenameCNHash = md5(part[2]).slice(25);
                const filename = `${filenameEN}_${filenameCNHash}`;
                const res = await speechTTS({ engine: speechEngine, content, filename, voice: speechVoice, speed: speechSpeed });
                if (res.code) {
                    setVocab({ ...vocab, speech: `${filename}.mp3` });
                    refAudio.current?.play(`${UploadPrefix}/${filename}.mp3?${Date.now()}`, 1);
                }
            } catch (e: any) {
                alert(`${e.message}`);
            }
        } else {
            alert(`Vocab text format incorrect.`);
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
                        refAudio.current?.play(`${UploadPrefix}/${res.data.filename}?${Date.now()}`, 1);
                    }
                } catch (e: any) {
                    alert(`${e.message}`);
                }
            } else {
                alert(`Please upload a mp3 format audio.`);
            }
        } else {
            alert(`Vocab text format incorrect.`);
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
                        refAudio.current?.play(`${UploadPrefix}/${res.data.filename}?${Date.now()}`, 1);
                    }
                } catch (e: any) {
                    alert(`${e.message}`);
                }
            } else {
                alert(`Please input base64 string.`);
            }
        } else {
            alert(`Vocab text format incorrect.`);
        }
    };
    const handlerVocabCreate = async () => {
        if (vocab.id === 0) {
            if (checkVocabDefinition(vocab.definition) && vocab.speech) {
                vocabFileMove({ image: vocab.image, speech: vocab.speech }).then((res) => {
                    if (res.code === 1) {
                        vocabCreate({
                            definition: vocab.definition,
                            image: res.data.image,
                            speech: res.data.speech,
                            category: vocab.category,
                        }).then((res) => {
                            if (res.code === 1) {
                                setVocab(defaultVocab);
                                setParsedVocab("");
                                apiGetList(listQuery);
                            } else {
                                alert("Failed");
                            }
                        });
                    }
                });
            }
        }
    };
    const handlerVocabUpdate = async () => {
        if (vocab.id !== 0) {
            if (checkVocabDefinition(vocab.definition)) {
                vocabFileMove({
                    image: vocab.image,
                    speech: vocab.speech,
                }).then(async (res) => {
                    const theVocab = list.find(({ id }) => id === vocab.id);
                    vocabUpdate({
                        id: vocab.id,
                        definition: vocab.definition,
                        image: res.data.image ? res.data.image : theVocab?.image,
                        speech: res.data.speech ? res.data.speech : theVocab?.speech,
                        category: vocab.category,
                    }).then((res) => {
                        if (res.code === 1) {
                            setVocab(defaultVocab);
                            setParsedVocab("");
                            apiGetList(listQuery);
                            scriptVocabList({ scriptId }).then((res) => {
                                if (res.code === 1) {
                                    dispatch(updateScriptVocabList(res.data));
                                }
                            });
                        }
                    });
                });
            }
        }
    };
    const handlerVocabRemove = async () => {
        const confirmed = window.confirm("Are you confirmed to delete?");
        if (confirmed) {
            const theVocab = list.find(({ id }) => id === vocab.id);
            if (theVocab) {
                vocabFileRemove({ image: theVocab.image, speech: theVocab.speech }).then((_) => {
                    vocabRemove({ id: theVocab.id }).then((res) => {
                        if (res.code === 1) {
                            setVocab(defaultVocab);
                            setParsedVocab("");
                            apiGetList(listQuery);
                            scriptVocabList({ scriptId }).then((res) => {
                                if (res.code === 1) {
                                    dispatch(updateScriptVocabList(res.data));
                                }
                            });
                        }
                    });
                });
            }
        }
    };
    const handlerVocabActivate = (vocab: Vocabulary) => {
        if (vocab) {
            refAudio.current?.play(`${AssetsPrefix}/speech/${vocab.speech}?${Date.now()}`, 1);
            setVocab({
                ...defaultVocab,
                id: vocab.id,
                definition: vocab.definition,
                category: vocab.category,
            });
        }
    };
    const handlerVocabInactivate = () => {
        setVocab(defaultVocab);
    };
    const handlerVocabExportAudio = async () => {
        try {
            const handle = await await (window as any).showSaveFilePicker({
                suggestedName: `all.mp3`,
                types: [{ description: "all.mp3", accept: { "audio/mpeg": [".mp3"] } }],
            });
            const writable = await handle.createWritable();
            const resBlob = await vocabFileExportSpeech({});
            const blob = new Blob([resBlob], { type: "audio/mpeg" });
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error("save error: ", error);
        }
    };
    const handlerOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    const handlerVocabSearch = (keyword: string) => {
        const listQueryNew = { ...listQuery, page: 1, keyword };
        setKeyword(keyword);
        setListQuery(listQueryNew);
        apiGetList(listQueryNew);
    };
    const handlerPageChange = (page: number, pageSize: number) => {
        apiGetList({ ...listQuery, page, pageSize });
    };
    const handlerVocabAddToScript = async () => {
        if (scriptId && vocab.id) {
            scriptVocabCreate({ scriptId, vocabId: vocab.id }).then((res) => {
                if (res.code === 1) {
                    setVocab(defaultVocab);
                    scriptVocabList({ scriptId }).then((res) => {
                        if (res.code === 1) {
                            dispatch(updateScriptVocabList(res.data));
                        }
                    });
                } else {
                    alert("Failed");
                }
            });
        }
    };
    const handlerVocabRemoveFromScript = async (id: number) => {
        if (scriptId && id) {
            const confirmed = window.confirm("Are you confirmed to do this?");
            if (confirmed) {
                scriptVocabRemove({ scriptId, vocabId: id }).then((res) => {
                    if (res.code === 1) {
                        scriptVocabList({ scriptId }).then((res) => {
                            if (res.code === 1) {
                                dispatch(updateScriptVocabList(res.data));
                            }
                        });
                    } else {
                        alert("Failed");
                    }
                });
            }
        }
    };
    const apiGetList = async (listQuery: ListQuery) => {
        const res = await vocabList(listQuery);
        if (res.code === 1) {
            setList(res.data.list);
            setListQuery({
                keyword: res.data.listParams.keyword,
                page: res.data.listParams.page,
                pageSize: res.data.listParams.pageSize,
            });
            setDataTotal(res.data.listParams.totalPages * res.data.listParams.pageSize);
        }
    };
    useEffect(() => {
        apiGetList(listQuery);
    }, [listQuery.keyword, listQuery.page, listQuery.pageSize]);
    return (
        <Drawer id="vocabulary-index" title="Vocabulary" width={800} size="large" onClose={handlerOnClose} open={open}>
            <div className="panel">
                <Input.TextArea autoSize value={parsedVocab} onChange={(e) => handlerParseVocab(e.target.value)} />
                <div className="panel-base">
                    <Input className="text" value={vocab.definition} onChange={(e) => handlerVocabUpdateText(e.target.value)} style={{ borderRadius: "0", color: "#000" }} />
                    <Select style={{ width: 100 }} value={vocab.category} onChange={handlerVocabUpdateCate} options={inputTypeOptions} />
                    <div className="image">{vocab.image && <img src={`${UploadPrefix}/${vocab.image}`} />}</div>
                    <Upload beforeUpload={handlerVocabUpdateImage} showUploadList={false}>
                        <Button icon={<FileImageOutlined />} />
                    </Upload>
                </div>
                <div className="panel-audio">
                    <Select style={{ width: 120 }} value={speechEngine} onChange={handlerSpeechUpdateEngine} options={speechEngineOptions} />
                    <div className={`audio-meta${speechEngine === 3 ? " visible" : ""}`}>
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
                <div className="submit">
                    <Button icon={<ReloadOutlined />} onClick={handlerVocabUpdate} />
                    <Button icon={<ClearOutlined />} onClick={handlerVocabInactivate} />
                    <Button icon={<MinusOutlined />} onClick={handlerVocabRemove} />
                    <Button icon={<PlusSquareOutlined />} onClick={handlerVocabCreate} />
                </div>
            </div>
            <div className="table">
                <div className="search">
                    <Input value={keyword} onChange={(e) => handlerVocabSearch(e.target.value)} allowClear />
                    <Button className="sbtn" onClick={handlerVocabAddToScript} icon={<PlusCircleOutlined />}></Button>
                    <Button className="sbtn" onClick={handlerVocabExportAudio} icon={<DownloadOutlined />}></Button>
                </div>
                <Scrollbars style={{ height: "210px" }}>
                    <div className="list">
                        {list.length > 0 &&
                            list.map((value, key) => {
                                return (
                                    <div key={value.id} className={vocab.id === value.id ? "item active" : "item"} onClick={() => handlerVocabActivate(value)}>
                                        <span className="text">
                                            {value.definition}
                                            {value.script_ids?.split(",").map((v) => {
                                                return (
                                                    <a href={`/#/read/${v}`} target="_blank">
                                                        {`【${v}】`}
                                                    </a>
                                                );
                                            })}
                                        </span>
                                        <span className="img">
                                            {value.image && (
                                                <a href={`${AssetsPrefix}/image/${value.image}`} target="_blank">
                                                    <img src={`${AssetsPrefix}/image/${value.image}`} />
                                                </a>
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </Scrollbars>
                <div className="pagination">
                    <Pagination current={listQuery.page} pageSize={listQuery.pageSize} total={dataTotal} onChange={handlerPageChange} />
                </div>
            </div>
            <div className="tag">
                {scriptVocabularyList.map((value, key) => {
                    return (
                        <Button key={key} onClick={() => handlerVocabRemoveFromScript(value.id)}>
                            {value.definition.split(" | ")[0]}
                            {value.image && <img src={`${AssetsPrefix}/image/${value.image}`} />}
                        </Button>
                    );
                })}
            </div>
            <Audio ref={refAudio} loop={false}></Audio>
        </Drawer>
    );
};

export default Index;
