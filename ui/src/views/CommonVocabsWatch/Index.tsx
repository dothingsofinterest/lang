import React, { useState, useRef, useEffect } from "react";
import { Button, Layout, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, SoundFilled } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
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
    const [progressValue, setProgressValue] = useState<number>(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refAudioTips = useRef<HTMLAudioElement>(null);
    const handlersClickSelector = (text: string, index: number) => {
        const vocab = dataFormatted.vocabs[matchingVocab];
        if (vocab) {
            const inputText = text.split(" | ")[0];
            const answerText = vocab.text.split(" | ")[0];
            if (inputText === answerText) {
                dispatch(updateVocabMatchWatch(matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1));
                if (refAudio.current) {
                    refAudio.current.play();
                }
            } else {
                setSelectorVocabsActvie(index);
            }
        }
    };
    const handlersPlayAudio = () => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[matchingVocab];
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
    };
    const handlersPlayForward = () => {
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchWatch(index));
    };
    const handlersPlayClear = () => {
        dispatch(updateVocabMatchWatch(0));
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
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please upload a video.");
            navigate("/common/settings");
        }
        return () => {};
    }, []);
    useEffect(() => {
        setSelectorVocabs(fnGetRandomNumbers(matchingVocab));
        setProgressValue(Math.ceil(((matchingVocab === 0 ? 0 : matchingVocab + 1) / dataFormatted.vocabs.length) * 100));
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="word-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 0" }}>
                <section id="panel">
                    <div className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                        <Button icon={<SoundFilled />} onClick={handlersPlayAudio} className="btn" />
                        <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                        <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                    </div>
                    <div className="progress">
                        <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </div>
                </section>
                <section id="display">
                    {dataFormatted.vocabs.length > 0 && (
                        <>
                            <div className="text">{dataFormatted.vocabs[matchingVocab].text.split(" | ")[0]}</div>
                            <div className="selector">
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
                        </>
                    )}
                </section>
                <section style={{ display: "none" }}>
                    <audio ref={refAudioTips}></audio>
                    <audio ref={refAudio} src="/audio/paid.mp3"></audio>
                </section>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
