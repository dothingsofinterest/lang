import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Progress } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, EyeFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { updateVocabMatchMeaning } from "../../stores/reducers/status";
import debounce from "lodash.debounce";
import { Vocab as DataVocab } from "../../types/Data";
import Audio, { AudioRef } from "../Public/Audio";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const inputListFilteredSelector = createSelector([(state: RootState) => state.data.scriptParsed.vocab], (inputs: DataVocab[]) => inputs.filter((v) => v.type === undefined || (v.type & 4) !== 0));
    const inputList = useSelector(inputListFilteredSelector);
    const matchingVocab = useSelector((state: RootState) => state.status.vocabMatchMeaning);
    const [textareaValue, setTextareaValue] = useState("");
    const [progressValue, setProgressValue] = useState<number>(0);
    const [maskClass, setMaskClass] = useState("mask");
    const [isFocused, setIsFocused] = useState(false);
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ matchingVocab, maskClass, isFocused });
    const handlersTypeVocab = (value: string) => {
        const pureValue = value.replace(/\n/, "");
        setTextareaValue(pureValue);
        fnDebouncedTypeVocab(pureValue);
    };
    const handlersPlayBackward = () => {
        if (inputList.length > 0) {
            const matchingVocab = refState.current.matchingVocab;
            const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
            if (inputList[index]) {
                dispatch(updateVocabMatchMeaning(index));
                setTextareaValue(inputList[index].text.charAt(0));
            }
        }
    };
    const handlersPlayForward = () => {
        if (inputList.length > 0) {
            const matchingVocab = refState.current.matchingVocab;
            const index = matchingVocab + 1 >= inputList.length ? matchingVocab : matchingVocab + 1;
            if (inputList[index]) {
                dispatch(updateVocabMatchMeaning(index));
                setTextareaValue(inputList[index].text.charAt(0));
            }
        }
    };
    const handlersPlayClear = () => {
        setTextareaValue("");
        dispatch(updateVocabMatchMeaning(0));
    };
    const handlerToggleTips = () => {
        setMaskClass(refState.current.maskClass === "mask" ? "unmask" : "mask");
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            const matchingVocab = refState.current.matchingVocab;
            if (inputList.length > 0) {
                const vocab = inputList[matchingVocab];
                if (vocab) {
                    const text = vocab.text.split(" | ")[0];
                    const textParts = text.split("/");
                    if (textParts[0] === value) {
                        setMaskClass("unmask");
                        refAudio.current?.play("/audio/paid.mp3", 1);
                    } else {
                        setMaskClass("mask");
                    }
                }
            }
        }, 100),
        [],
    );
    useEffect(() => {
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowLeft") {
                if (!refState.current.isFocused) {
                    handlersPlayBackward();
                }
            }
            if (event.code === "ArrowRight") {
                if (!refState.current.isFocused) {
                    handlersPlayForward();
                }
            }
            if (event.code === "ControlRight") {
                handlerToggleTips();
            }
            if (event.code === "Enter") {
                if (refState.current.isFocused) {
                    setMaskClass("mask");
                    handlersPlayForward();
                }
            }
        };
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
        };
    }, []);
    useEffect(() => {
        refState.current = { matchingVocab, maskClass, isFocused };
        setProgressValue(Math.ceil(((matchingVocab === 0 ? 0 : matchingVocab + 1) / inputList.length) * 100));
    }, [matchingVocab, maskClass, isFocused]);
    return (
        <Layout className="main-inner" id="vocab-meaning-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <section id="panel">
                    <section className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                        <Button icon={<EyeFilled />} onClick={handlerToggleTips} className="btn"></Button>
                        <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                        <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                    </section>
                    <section className="progress">
                        <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </section>
                </section>
                <section id="display">
                    {inputList.length > 0 && (
                        <>
                            <div className="img">{inputList[matchingVocab].image && <img src={inputList[matchingVocab].image} />}</div>
                            <div className={`text ${maskClass}`}>{maskClass === "mask" ? inputList[matchingVocab].text.split(" | ")[2] : inputList[matchingVocab].text}</div>
                        </>
                    )}
                </section>
                <section id="input">
                    <Input.TextArea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} />
                </section>
                <section id="audio">
                    <Audio ref={refAudio} loop={false} />
                </section>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
