import React, { useState, useRef, useEffect } from "react";
import { Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { Vocab as DataVocab } from "../../types/Data";
import { fnShuffle } from "../../utils/util";
import { RootState } from "../../stores";
import { useSelector } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    console.log("[rendered] word/index");
    const navigate = useNavigate();
    const project = useSelector((state: RootState) => state.project);
    const projectName = useSelector((state: RootState) => state.project.name);
    const refScrollbar = useRef<Scrollbars>(null);
    const dataFormatted = useSelector((state: RootState) => state.project.script.dataFormatted);
    const refShowcase = useRef<HTMLDivElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refVocabsFiltered = useRef<DataVocab[]>(dataFormatted.vocabs.filter((v) => v.image.length > 0));
    const [vocabActive, setVocabActive] = useState(0);
    const handlersClickSelection = (fileName: string) => {
        if (!/_fake/.test(fileName)) {
            setVocabActive(vocabActive + 1 >= refVocabsFiltered.current.length ? 0 : vocabActive + 1);
            if (refAudio.current) {
                refAudio.current.play();
            }
        }
    };
    useEffect(() => {
        if (!project.name || !project.videoURL || !project.videoCompressedURL) {
            alert("Please create a project.");
            navigate("/settings");
        }
        console.log("[mounted] word/index");
        return () => {
            console.log("[unmounted] word/index");
        };
    }, []);
    return (
        <Layout className="main-inner" id="word-index">
            <div className="main-inner-item-aside">
                <Scrollbars ref={refScrollbar}>
                    <div id="word-list" ref={refShowcase}>
                        {refVocabsFiltered.current.map((value, key) => {
                            return (
                                <div key={key} className={vocabActive - 1 >= key ? "line matched" : "line"}>
                                    {value.text.split(", ")[1]}
                                </div>
                            );
                        })}
                    </div>
                </Scrollbars>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars>
                    <div id="selector" ref={refShowcase}>
                        <div className="line">
                            {refVocabsFiltered.current.length > 0 &&
                                fnShuffle(refVocabsFiltered.current[vocabActive].image).map((v: string) => {
                                    return (
                                        <span className="item">
                                            <img src={`${Domain}/uploads/${projectName}/images/${v}?${Date.now()}`} onClick={() => handlersClickSelection(v)} />
                                        </span>
                                    );
                                })}
                        </div>
                    </div>
                    <section id="hidden-elems">
                        <audio
                            ref={refAudio}
                            src="data:audio/wav;base64,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qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAxIChiZXRhIDIpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uSZECP8AAAaQcAAAgAAA0g4AABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg=="
                        ></audio>
                    </section>
                </Scrollbars>
            </div>
        </Layout>
    );
};
export default Index;
