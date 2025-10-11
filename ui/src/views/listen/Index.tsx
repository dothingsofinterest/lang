import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ttsGen } from "../../api/requestAuth";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] listen/index");
    const navigate = useNavigate();
    const project = useSelector((state: RootState) => state.project);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const [activeVocab, setActiveVocab] = useState(0);
    const [textareaValue, setTextareaValue] = useState("");
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersTypeVocab = (value: string) => {
        setTextareaValue(value);
        if (dataFormatted.vocabs.length > 0) {
            if (dataFormatted.vocabs[activeVocab].text.split(", ")[1] === value) {
                const activeVocabNext = activeVocab + 1 >= dataFormatted.vocabs.length ? activeVocab : activeVocab + 1;
                setTextareaValue("");
                setActiveVocab(activeVocabNext);
                fnPlayAudio(activeVocabNext);
            }
        }
    };
    const handlersPlayBackward = () => {
        const index = activeVocab - 1 <= 0 ? 0 : activeVocab - 1;
        setActiveVocab(index);
        fnPlayAudio(index);
    };
    const handlersPlayForward = () => {
        const index = activeVocab + 1 >= dataFormatted.vocabs.length ? activeVocab : activeVocab + 1;
        setActiveVocab(index);
        fnPlayAudio(index);
    };
    const handlersPlayClear = () => {
        setTextareaValue("");
        setActiveVocab(0);
        fnPlayAudio(0);
    };
    const fnPlayAudio = async (index: number) => {
        if (dataFormatted.vocabs.length > 0) {
            const vocabsArr = dataFormatted.vocabs[index].text.split(", ");
            const content = vocabsArr[1].replaceAll("/", ", ");
            const type = / [A-Z]/.test(vocabsArr[2]) ? 3 : 1;
            try {
                const res = await ttsGen({ content: content, type: type });
                if (res.code) {
                    if (refAudio.current) {
                        const audio = refAudio.current;
                        audio.src = "data:audio/wav;base64," + res.data;
                        audio.load();
                        audio.play();
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.log(error);
                }
            }
        }
    };
    useEffect(() => {
        if (!project.name || !project.videoURL || !project.videoCompressedURL) {
            alert("Please create a project.");
            navigate("/settings");
        }
        fnPlayAudio(0);
        console.log("[mounted] listen/index");
        return () => {
            console.log("[unmounted] listen/index");
            if (refAudio.current) {
                refAudio.current.pause();
                refAudio.current.currentTime = 0;
                refAudio.current.src = "";
            }
        };
    }, []);
    return (
        <Layout className="main-inner" id="listen-index">
            <div className="main-inner-item-aside">
                <Scrollbars>
                    <Input.TextArea autoSize value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} placeholder="Please Type Vocabulary" />
                </Scrollbars>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                </section>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
        </Layout>
    );
};
export default Index;
