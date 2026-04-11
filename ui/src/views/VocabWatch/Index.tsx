import React, { useState, useRef, useEffect } from "react";
import { Button, Layout, Progress } from "antd";
import { RootState } from "../../stores";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, SoundFilled } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { updateVocabMatchWatch } from "../../stores/reducers/status";
import { fnRandom, fnShuffle } from "../../utils/util";
import { Vocab as DataVocab } from "../../types/Data";
import Audio, { AudioRef } from "../Public/Audio";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const inputListFilteredSelector = createSelector([(state: RootState) => state.data.scriptParsed.vocab], (inputs: DataVocab[]) => inputs.filter((v) => v.type === undefined || (v.type & 2) !== 0));
    const inputList = useSelector(inputListFilteredSelector);
    const matchingVocab = useSelector((state: RootState) => state.status.vocabMatchWatch);
    const [selectorVocab, setSelectorVocab] = useState<number[]>([]);
    const [selectorVocabActvie, setSelectorVocabActvie] = useState<number | null>(null);
    const [progressValue, setProgressValue] = useState<number>(0);
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ matchingVocab });
    const handlersClickSelector = (text: string, index: number) => {
        const vocab = inputList[matchingVocab];
        if (vocab) {
            const inputText = text.split(" | ")[0];
            const answerText = vocab.text.split(" | ")[0];
            if (inputText === answerText) {
                dispatch(updateVocabMatchWatch(matchingVocab + 1 >= inputList.length ? matchingVocab : matchingVocab + 1));
                refAudio.current?.play("/audio/paid.mp3", 1);
            } else {
                setSelectorVocabActvie(index);
            }
        }
    };
    const handlersPlayAudio = () => {
        if (inputList.length > 0) {
            const vocab = inputList[matchingVocab];
            if (vocab && vocab.pronunciation) {
                refAudio.current?.play(vocab.pronunciation, 1);
            }
        }
    };
    const handlersPlayBackward = () => {
        const matchingVocab = refState.current.matchingVocab;
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateVocabMatchWatch(index));
    };
    const handlersPlayForward = () => {
        const matchingVocab = refState.current.matchingVocab;
        const index = matchingVocab + 1 >= inputList.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchWatch(index));
    };
    const handlersPlayClear = () => {
        dispatch(updateVocabMatchWatch(0));
    };
    const fnGetRandomNumbers = (index: number) => {
        const results: number[] = [index];
        const vocabLen = inputList.length;
        if (vocabLen > 0) {
            for (let i = 0; i < 3; i++) {
                const randomIndex = fnRandom(0, vocabLen - 1, results);
                results.push(randomIndex);
            }
        }
        return fnShuffle(results);
    };
    useEffect(() => {
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "PageUp") {
                handlersPlayBackward();
            }
            if (event.code === "PageDown") {
                handlersPlayForward();
            }
        };
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
        };
    }, []);
    useEffect(() => {
        setSelectorVocab(fnGetRandomNumbers(matchingVocab));
        setProgressValue(Math.ceil(((matchingVocab === 0 ? 0 : matchingVocab + 1) / inputList.length) * 100));
        refState.current = { matchingVocab };
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="vocab-watch-index">
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
                    {inputList.length > 0 && (
                        <>
                            <div className="text">{inputList[matchingVocab].text.split(" | ")[0]}</div>
                            <div className="selector">
                                {inputList.length > 0 &&
                                    selectorVocab.map((key) => {
                                        return (
                                            <div key={key} className={`item${key === selectorVocabActvie ? " active" : ""}`} onClick={() => handlersClickSelector(inputList[key].text, key)}>
                                                {inputList[key].image && <img src={inputList[key].image} />}
                                                <i className="cn">{inputList[key].text.split(" | ")[2]}</i>
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    )}
                </section>
                <Audio ref={refAudio} loop={false} />
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
