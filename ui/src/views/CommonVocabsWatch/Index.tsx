import React, { useState, useRef, useEffect } from "react";
import { Button, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { BulbFilled, ClearOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateVocabMatchWatch } from "../../stores/reducers/plan";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const wordMatchingVocab = useSelector((state: RootState) => state.plan.vocabMatchWatch);
    const refWordList = useRef<HTMLDivElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refAudioTips = useRef<HTMLAudioElement>(null);
    const refScrollbar = useRef<Scrollbars>(null);
    const handlersClickSelection = (text: string) => {
        const inputText = text.split(" | ")[0];
        const answerText = dataFormatted.vocabs[wordMatchingVocab].text.split(" | ")[0];
        if (inputText === answerText) {
            dispatch(updateVocabMatchWatch(wordMatchingVocab + 1 >= dataFormatted.vocabs.length ? wordMatchingVocab : wordMatchingVocab + 1));
            if (refAudio.current) {
                refAudio.current.play();
            }
            if (refWordList.current) {
                refWordList.current.querySelectorAll(".line").forEach((span: any, k) => {
                    if (wordMatchingVocab === k) {
                        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
                        const scrollTopVocabValue = scrollTop + span.getBoundingClientRect().top;
                        refScrollbar.current?.scrollTop(scrollTopVocabValue);
                    }
                });
            }
        }
    };
    const fnGetRandomNumbers = () => {
        let nums = [wordMatchingVocab];
        if (dataFormatted.vocabs.length > 0) {
            for (let i = 0; i < 9999; i++) {
                const randomNum = Math.floor(Math.random() * dataFormatted.vocabs.length);
                if (!nums.includes(randomNum)) {
                    nums.push(randomNum);
                }
                if (nums.length >= 4) {
                    break;
                }
            }
            const randomNumAnswer = Math.floor(Math.random() * 10) % 4;
            const a = nums.slice(0, randomNumAnswer);
            const b = nums.slice(randomNumAnswer, nums.length);
            nums = [...b, ...a];
        }
        return nums;
    };
    const handlersVocabTips = () => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[wordMatchingVocab];
            if (vocab && vocab.pronunciation) {
                if (refAudioTips.current) {
                    const audio = refAudioTips.current;
                    audio.src = vocab.pronunciation;
                    audio.play();
                }
                alert(dataFormatted.vocabs[wordMatchingVocab].text);
            }
        }
    };
    const handlersPlayClear = () => {
        dispatch(updateVocabMatchWatch(0));
        refScrollbar.current?.scrollTop(0);
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/common/settings");
        }
        return () => {};
    }, []);
    return (
        <Layout className="main-inner" id="word-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<BulbFilled />} onClick={handlersVocabTips} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                </section>
                <div id="selector">
                    <div className="line">
                        {dataFormatted.vocabs.length > 0 &&
                            fnGetRandomNumbers().map((key) => {
                                return (
                                    <span key={key} className="item" onClick={() => handlersClickSelection(dataFormatted.vocabs[key].text)}>
                                        {dataFormatted.vocabs[key].image ? <img src={dataFormatted.vocabs[key].image} /> : dataFormatted.vocabs[key].text.split(" | ")[2]}
                                    </span>
                                );
                            })}
                    </div>
                </div>
                <section style={{ display: "none" }}>
                    <audio ref={refAudioTips}></audio>
                    <audio ref={refAudio} src="/audio/paid.mp3"></audio>
                </section>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars ref={refScrollbar}>
                    <div id="word-list" ref={refWordList}>
                        {dataFormatted.vocabs.map((value, key) => {
                            return (
                                <div key={key} className={wordMatchingVocab >= key ? (wordMatchingVocab > key ? "line matched" : "line matching") : "line"}>
                                    <span>
                                        <i className="index">[{key}]</i>
                                        {value.text.split(" | ")[0]}
                                    </span>
                                    <span>{value.text.split(" | ")[1]}</span>
                                </div>
                            );
                        })}
                    </div>
                </Scrollbars>
            </div>
        </Layout>
    );
};
export default Index;
