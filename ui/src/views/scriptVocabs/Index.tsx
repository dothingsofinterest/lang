import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, Radio } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, UploadOutlined, PrinterOutlined, DownloadOutlined, LogoutOutlined, AudioFilled, ClearOutlined } from "@ant-design/icons";
import { Script as DataScript, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { updateScriptVocabs, updateScriptVocabsByDelete } from "../../stores/reducers/project";
import store, { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import Script from "../learn/Script";
import { fnParseVocabs, fnFloatToSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import { uploadVocabImg } from "../../api/requestAuth";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] scriptVocabs/index");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const project = useSelector((state: RootState) => state.project);
    const script = useSelector((state: RootState) => state.project.script.data);
    const projectName = useSelector((state: RootState) => state.project.name);
    const refScrollbar = useRef<Scrollbars>(null);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const [parsedVocabs, setParsedVocabs] = useState("");
    const [vocab, setVocab] = useState<{ text: string; image: string[] }>({ text: "", image: [] });
    const [vocabActive, setVocabActive] = useState(0);
    const handlersParseVocabs = (text: string) => {
        setParsedVocabs(fnParseVocabs(text));
    };
    const handlersUpdateVocab = (value: string) => {
        setVocab({ ...vocab, text: value });
    };
    const handlersUpdateVocabImg0 = async (file: any) => {
        await fnUploadVocabImg(file);
        return false;
    };
    const handlersUpdateVocabImg1 = async (file: any) => {
        await fnUploadVocabImg(file, 1);
        return false;
    };
    const handlersUpdateVocabImg2 = async (file: any) => {
        await fnUploadVocabImg(file, 2);
        return false;
    };
    const handlersUpdateVocabImg3 = async (file: any) => {
        await fnUploadVocabImg(file, 3);
        return false;
    };
    const handlersRemoveVocab = () => {
        const confirmed = window.confirm("Do you confirm to delete?");
        if (confirmed) {
            dispatch(updateScriptVocabsByDelete({ pKey: vocabActive }));
            setVocabActive(0);
        }
    };
    const handlersAddVocab = () => {
        if (vocab.text) {
            dispatch(updateScriptVocabs(vocab));
            setVocab({ text: "", image: [] });
            setParsedVocabs("");
        }
    };
    const handlersClickVocab = (index: number) => {
        setVocabActive(index);
    };
    const fnUploadVocabImg = async (file: any, index = 0) => {
        if (vocab.text) {
            if (/^(.+?)\.(png|jpg)$/g.test(file.name) && (file.type === "image/png" || file.type === "image/jpeg")) {
                try {
                    const namePrefix = vocab.text.slice(0, 1);
                    const nameMain = vocab.text.split(", ")[1].split("/")[0].replace(/\s+/g, "_");
                    const nameSuffix = index === 0 ? "" : `_fake${index}`;
                    const name = `${namePrefix}_${nameMain}${nameSuffix}`;
                    const formData = new FormData();
                    formData.append("img", file);
                    const res = await uploadVocabImg({ project: projectName, vocab: name }, formData);
                    if (res.code === 1) {
                        for (let i = 0; i < 4; i++) {
                            if (index === i) {
                                vocab.image[index] = res.data.filename;
                            } else {
                                if (vocab.image[i] === undefined) {
                                    vocab.image[i] = "";
                                }
                            }
                        }
                        setVocab({ ...vocab, image: vocab.image });
                    }
                    console.log("vocab", vocab);
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
    useEffect(() => {
        if (!project.name || !project.videoURL || !project.videoCompressedURL) {
            alert("Please create a project.");
            navigate("/settings");
        }
        console.log("[mounted] scriptVocabs/index");
        return () => {
            console.log("[unmounted] scriptVocabs/index");
        };
    }, []);
    return (
        <Layout className="main-inner" id="script-vocabs-index">
            <div className="main-inner-item-aside">
                <Scrollbars>
                    <div className="panel">
                        <Input.TextArea autoSize value={parsedVocabs} onChange={(e) => handlersParseVocabs(e.target.value)} style={{ minHeight: "100px", borderRadius: "0", color: "#000" }} placeholder="Paste Vocabs" />
                        <Input value={vocab.text} onChange={(e) => handlersUpdateVocab(e.target.value)} style={{ borderRadius: "0", color: "#000" }} placeholder="n.读音；发音, pronunciation/pronunciations, /prəˌnʌnsiˈeɪʃn/" />
                        <div id="upload-list">
                            <Upload beforeUpload={handlersUpdateVocabImg0} showUploadList={false}>
                                <img className="upload-btn" src={!vocab.image[0] ? `${Domain}/uploads/uploadicon.png` : `${Domain}/uploads/${projectName}/images/${vocab.image[0]}?${Date.now()}`} />
                            </Upload>
                            <Upload beforeUpload={handlersUpdateVocabImg1} showUploadList={false}>
                                <img className="upload-btn" src={!vocab.image[1] ? `${Domain}/uploads/uploadicon.png` : `${Domain}/uploads/${projectName}/images/${vocab.image[1]}?${Date.now()}`} />
                            </Upload>
                            <Upload beforeUpload={handlersUpdateVocabImg2} showUploadList={false}>
                                <img className="upload-btn" src={!vocab.image[2] ? `${Domain}/uploads/uploadicon.png` : `${Domain}/uploads/${projectName}/images/${vocab.image[2]}?${Date.now()}`} />
                            </Upload>
                            <Upload beforeUpload={handlersUpdateVocabImg3} showUploadList={false}>
                                <img className="upload-btn" src={!vocab.image[3] ? `${Domain}/uploads/uploadicon.png` : `${Domain}/uploads/${projectName}/images/${vocab.image[3]}?${Date.now()}`} />
                            </Upload>
                        </div>
                        <Button icon={<MinusSquareOutlined />} onClick={handlersRemoveVocab} style={{ width: "100%", borderRadius: "0", backgroundColor: "#ccc" }} />
                        <Button icon={<PlusSquareOutlined />} onClick={handlersAddVocab} style={{ width: "100%", borderRadius: "0", backgroundColor: "#ccc" }} />
                        <div></div>
                    </div>
                </Scrollbars>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars>
                    {dataFormatted.vocabs.length > 0 && (
                        <div id="vocabs-preview">
                            {dataFormatted.vocabs.map((value, key) => {
                                return (
                                    <div key={key} className={vocabActive === key ? "item active" : "item"} onClick={() => handlersClickVocab(key)}>
                                        <span className="text">
                                            <i className="index">[{key + 1}] </i>
                                            {value.text}
                                        </span>
                                        <span className="img">
                                            {value.image.map((img) => (
                                                <img src={`${Domain}/uploads/${projectName}/images/${img}?${Date.now()}`} />
                                            ))}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Scrollbars>
            </div>
        </Layout>
    );
};
export default Index;
