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
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const scriptParsed = useSelector((state: RootState) => state.data.scriptParsed);
    const inputListFilteredSelector = createSelector([(state: RootState) => state.data.scriptParsed.vocab], (inputs: DataVocab[]) => inputs.filter((v) => v.type === undefined || (v.type & 4) !== 0));
    const inputList = useSelector(inputListFilteredSelector);
    const matchingVocab = useSelector((state: RootState) => state.status.vocabMatchMeaning);
    const [curVocab, setCurVocab] = useState<DataVocab | undefined>(() => (matchingVocab === 0 ? inputList[0] : inputList.find(({ id }) => id === matchingVocab)));
    const [curVocabIndex, setCurVocabIndex] = useState<number>(() => (matchingVocab === 0 ? 0 : inputList.findIndex(({ id }) => id === matchingVocab)));
    const [textareaValue, setTextareaValue] = useState("");
    const [maskClass, setMaskClass] = useState("mask");
    const [isFocused, setIsFocused] = useState(false);
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ matchingVocab, maskClass, isFocused });
    const handlerTypeVocab = (value: string) => {
        setTextareaValue(value);
        setMaskClass("mask");
        fnDebouncedTypeVocab(value);
    };
    const handlerPlayBackward = () => {
        const curVocabID = refState.current.matchingVocab;
        if (curVocabID > 0) {
            const curVocabIndex = inputList.findIndex(({ id }) => id === curVocabID);
            const lastVocab = inputList[curVocabIndex - 1];
            if (lastVocab !== undefined) {
                fnPlayTo(lastVocab);
            }
        }
    };
    const handlerPlayForward = () => {
        const curVocabID = refState.current.matchingVocab;
        const curVocabIndex = curVocabID === 0 ? 0 : inputList.findIndex(({ id }) => id === curVocabID);
        const nextVocab = inputList[curVocabIndex + 1];
        if (nextVocab !== undefined) {
            fnPlayTo(nextVocab);
        }
    };
    const handlerToggleTips = () => {
        setMaskClass(refState.current.maskClass === "mask" ? "unmask" : "mask");
    };
    const handlersPlayClear = () => {
        if (inputList.length > 0) {
            fnPlayTo(inputList[0]);
        }
    };
    const fnPlayTo = (vocab: DataVocab) => {
        if (vocab) {
            setTextareaValue(vocab.text.charAt(0));
            setCurVocab(vocab);
            setCurVocabIndex(inputList.findIndex(({ id }) => id === vocab.id));
            dispatch(updateVocabMatchMeaning(vocab.id));
        }
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            const curVocabID = refState.current.matchingVocab;
            const curVocab = curVocabID === 0 ? inputList[0] : inputList.find(({ id }) => id === curVocabID);
            if (curVocab) {
                const text = curVocab.text.split(" | ")[0];
                const textParts = text.split("/");
                if (textParts[0] === value) {
                    setMaskClass("unmask");
                    refAudio.current?.play("/audio/paid.mp3", 1);
                }
            }
        }, 100),
        [],
    );
    useEffect(() => {
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowLeft") {
                if (!refState.current.isFocused) {
                    handlerPlayBackward();
                }
            }
            if (event.code === "ArrowRight") {
                if (!refState.current.isFocused) {
                    handlerPlayForward();
                }
            }
            if (event.code === "ControlRight") {
                handlerToggleTips();
            }
            if (event.code === "Enter") {
                if (refState.current.isFocused) {
                    event.preventDefault();
                    setMaskClass("mask");
                    handlerPlayForward();
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
    }, [matchingVocab, maskClass, isFocused]);
    return (
        <Layout className="main-inner" id="vocab-meaning-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <section id="panel">
                    <section className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlerPlayBackward} className="btn" />
                        <Button icon={<EyeFilled />} onClick={handlerToggleTips} className="btn"></Button>
                        <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                        <Button icon={<FastForwardOutlined />} onClick={handlerPlayForward} className="btn" />
                    </section>
                    <section className="progress">
                        <Progress percent={Math.ceil(((curVocabIndex + 1) / inputList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </section>
                </section>
                <section id="display">
                    {curVocab && (
                        <>
                            <div className="img">{curVocab.image && <img src={`${Domain}/data/${scriptParsed.hash}/vocab_images/${curVocab.image}`} />}</div>
                            <div className={`text ${maskClass}`}>{maskClass === "mask" ? curVocab.text.split(" | ")[2] : curVocab.text}</div>
                        </>
                    )}
                </section>
                <section id="input">
                    <Input.TextArea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} value={textareaValue} onChange={(e) => handlerTypeVocab(e.target.value)} />
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
