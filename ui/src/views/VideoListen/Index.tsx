import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, BulbFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateListenMatchingVocab } from "../../stores/reducers/plan";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.script.dataFormatted);
    const matchingVocab = useSelector((state: RootState) => state.plan.listenMatchingVocab);
    const refScrollbar = useRef<Scrollbars>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refMatchingVocab = useRef({ matchingVocab });
    const refWordList = useRef<HTMLDivElement>(null);
    const handlersClickSelection = (text: string) => {
        if (dataFormatted.vocabs.length > 0) {
            const inputText = text.split(" | ")[0];
            const answerText = dataFormatted.vocabs[matchingVocab].text.split(" | ")[0];
            if (inputText === answerText) {
                const matchingVocabNext = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
                dispatch(updateListenMatchingVocab(matchingVocabNext));
                fnPlayAudio(matchingVocabNext);
                if (refWordList.current) {
                    refWordList.current.querySelectorAll(".line").forEach((span: any, k) => {
                        if (matchingVocab === k) {
                            const scrollTop = refScrollbar.current?.getScrollTop() || 0;
                            const scrollTopVocabValue = scrollTop + span.getBoundingClientRect().top;
                            refScrollbar.current?.scrollTop(scrollTopVocabValue);
                        }
                    });
                }
            }
        }
    };
    const handlersPlayBackward = () => {
        const matchingVocab = refMatchingVocab.current.matchingVocab;
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateListenMatchingVocab(index));
        fnPlayAudio(index);
    };
    const handlersPlayForward = () => {
        const matchingVocab = refMatchingVocab.current.matchingVocab;
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateListenMatchingVocab(index));
        fnPlayAudio(index);
    };
    const handlersPlayClear = () => {
        dispatch(updateListenMatchingVocab(0));
        fnPlayAudio(0);
        refScrollbar.current?.scrollTop(0);
    };
    const handlersVocabTips = () => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[matchingVocab];
            if (vocab && vocab.text) {
                alert(vocab.text);
            }
        }
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
    const fnGetRandomNumbers = () => {
        let nums = [matchingVocab];
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
    useEffect(() => {
        if (!plan.videoHash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/video/settings");
        }
        fnPlayAudio(matchingVocab);
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowLeft") {
                handlersPlayBackward();
            }
            if (event.code === "ArrowRight") {
                handlersPlayForward();
            }
        };
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
            if (refAudio.current) {
                refAudio.current.pause();
                refAudio.current.currentTime = 0;
                refAudio.current.src = "";
            }
        };
    }, []);
    useEffect(() => {
        refMatchingVocab.current = { matchingVocab };
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="listen-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn">
                        Click or Press Left
                    </Button>
                    <Button icon={<BulbFilled />} onClick={handlersVocabTips} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn">
                        Click or Press Right
                    </Button>
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
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars ref={refScrollbar}>
                    <div id="word-list" ref={refWordList}>
                        {dataFormatted.vocabs.map((value, key) => {
                            return (
                                <div key={key} className={matchingVocab >= key ? (matchingVocab > key ? "line matched" : "line matching") : "line"}>
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
