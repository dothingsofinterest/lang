import React, { useState, useRef, useEffect } from "react";
import { Button, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateVocabMatchWatch } from "../../stores/reducers/plan";
import { fnRandom, fnShuffle } from "../../utils/util";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingVocab = useSelector((state: RootState) => state.plan.vocabMatchWatch);
    const [selectorVocabs, setSelectorVocabs] = useState<number[]>([]);
    const [selectorVocabsActvie, setSelectorVocabsActvie] = useState<number | null>(null);
    const refWordList = useRef<HTMLDivElement>(null);
    const refWordListArr = useRef<NodeListOf<HTMLDivElement> | null | undefined>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refAudioTips = useRef<HTMLAudioElement>(null);
    const refScrollbar = useRef<Scrollbars>(null);
    const handlersClickSelector = (text: string, index: number) => {
        const vocab = dataFormatted.vocabs[matchingVocab];
        if (vocab) {
            const inputText = text.split(" | ")[0];
            const answerText = vocab.text.split(" | ")[0];
            if (inputText === answerText) {
                fnScrollList(matchingVocab);
                dispatch(updateVocabMatchWatch(matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1));
                if (refAudio.current) {
                    refAudio.current.play();
                }
            } else {
                setSelectorVocabsActvie(index);
            }
        }
    };
    const handlersWordOnClick = (index: number) => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refAudioTips.current) {
                    const audio = refAudioTips.current;
                    audio.src = vocab.pronunciation;
                    audio.play();
                }
            }
        }
    };
    const handlersPlayBackward = () => {
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateVocabMatchWatch(index));
        fnScrollList(index - 1);
    };
    const handlersPlayForward = () => {
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchWatch(index));
        fnScrollList(index - 1);
    };
    const handlersPlayClear = () => {
        dispatch(updateVocabMatchWatch(0));
        refScrollbar.current?.scrollTop(0);
    };
    const fnGetRandomNumbers = (index: number) => {
        const results: number[] = [index];
        const vocabsLen = dataFormatted.vocabs.length;
        if (vocabsLen > 0) {
            for (let i = 0; i < 3; i++) {
                const randomIndex = fnRandom(0, vocabsLen - 1, results);
                results.push(randomIndex);
            }
        }
        return fnShuffle(results);
    };
    const fnScrollList = (index: number) => {
        const list = refWordListArr.current;
        if (list && list[index]) {
            const scrollTop = refScrollbar.current?.getScrollTop() || 0;
            const scrollTopVocabValue = scrollTop + list[index].getBoundingClientRect().top;
            refScrollbar.current?.scrollTop(scrollTopVocabValue);
        }
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please upload a video.");
            navigate("/common/settings");
        }
        refWordListArr.current = refWordList.current?.querySelectorAll(".line");
        return () => {};
    }, []);
    useEffect(() => {
        setSelectorVocabs(fnGetRandomNumbers(matchingVocab));
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="word-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                </section>
                <div id="selector">
                    {dataFormatted.vocabs.length > 0 &&
                        selectorVocabs.map((key) => {
                            return (
                                <div key={key} className={`item${key === selectorVocabsActvie ? " active" : ""}`} onClick={() => handlersClickSelector(dataFormatted.vocabs[key].text, key)}>
                                    {dataFormatted.vocabs[key].image && <img src={dataFormatted.vocabs[key].image} />}
                                    <i className="cn">{dataFormatted.vocabs[key].text.split(" | ")[2]}</i>
                                </div>
                            );
                        })}
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
                                <div key={key} className={matchingVocab >= key ? (matchingVocab > key ? "line matched" : "line matching") : "line"} onClick={() => handlersWordOnClick(key)}>
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
