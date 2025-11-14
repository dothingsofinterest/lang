import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateListenMatchingVocab } from "../../stores/reducers/plan";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] listen/index");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.script.dataFormatted);
    const matchingVocab = useSelector((state: RootState) => state.plan.listenMatchingVocab);
    const [textareaValue, setTextareaValue] = useState("");
    const refScrollbar = useRef<Scrollbars>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersTypeVocab = (value: string) => {
        setTextareaValue(value);
        if (dataFormatted.vocabs.length > 0) {
            if (dataFormatted.vocabs[matchingVocab].text.split(", ")[1] === value) {
                const matchingVocabNext = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
                setTextareaValue("");
                dispatch(updateListenMatchingVocab(matchingVocabNext));
                fnPlayAudio(matchingVocabNext);
            }
        }
    };
    const handlersPlayBackward = () => {
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateListenMatchingVocab(index));
        fnPlayAudio(index);
    };
    const handlersPlayForward = () => {
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateListenMatchingVocab(index));
        fnPlayAudio(index);
    };
    const handlersPlayClear = () => {
        setTextareaValue("");
        dispatch(updateListenMatchingVocab(0));
        fnPlayAudio(0);
    };
    const fnPlayAudio = async (index: number) => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = vocab.pronunciation;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    useEffect(() => {
        if (!plan.videoHash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/settings");
        }
        console.log("[mounted] listen/index");
        fnPlayAudio(matchingVocab);
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
                <Scrollbars ref={refScrollbar}>
                    <div id="word-list">
                        {dataFormatted.vocabs.map((value, key) => {
                            return (
                                <div key={key} className={matchingVocab >= key ? (matchingVocab > key ? "line matched" : "line matching") : "line"}>
                                    {value.text.split(", ")[1]}
                                </div>
                            );
                        })}
                    </div>
                </Scrollbars>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
        </Layout>
    );
};
export default Index;
