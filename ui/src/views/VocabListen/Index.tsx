import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Button, Progress, Input } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, CopyOutlined, DashboardOutlined, EyeFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { updateVocabMatchListen } from "../../stores/reducers/status";
import { Vocab as DataVocab } from "../../types/Data";
import debounce from "lodash.debounce";
import { strip } from "../../utils/number";
import Audio, { AudioRef } from "../Public/Audio";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const inputListFilteredSelector = createSelector([(state: RootState) => state.data.scriptParsed.vocab], (inputs: DataVocab[]) => inputs.filter((v) => v.type === undefined || (v.type & 1) !== 0));
    const inputList = useSelector(inputListFilteredSelector);
    const matchingVocab = useSelector((state: RootState) => state.status.vocabMatchListen);
    const curVocab = inputList.find(({ id }) => id === matchingVocab);
    const curVocabIndex = inputList.findIndex(({ id }) => id === matchingVocab);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const [textareaValue, setTextareaValue] = useState("");
    const [maskClass, setMaskClass] = useState("mask");
    const [isFocused, setIsFocused] = useState(false);
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ matchingVocab, playSpeed, maskClass, isFocused });
    const handlersPlayBackward = () => {
        const curSentenceID = refState.current.matchingVocab;
        const playSpeed = refState.current.playSpeed;
        const curSentenceIndex = inputList.findIndex(({ id }) => id === curSentenceID);
        const lastSentence = inputList[curSentenceIndex - 1];
        if (lastSentence !== undefined) {
            fnPlayTo(lastSentence, playSpeed);
        }
    };
    const handlersPlayForward = () => {
        const curSentenceID = refState.current.matchingVocab;
        const playSpeed = refState.current.playSpeed;
        const curSentenceIndex = inputList.findIndex(({ id }) => id === curSentenceID);
        const lastSentence = inputList[curSentenceIndex + 1];
        if (lastSentence !== undefined) {
            fnPlayTo(lastSentence, playSpeed);
        }
    };
    const handlersInputCopy = () => {
        const curSentenceID = refState.current.matchingVocab;
        const vocab = inputList.find(({ id }) => id === curSentenceID);
        if (vocab && vocab.text) {
            const text = vocab.text.split(" | ");
            if (text && text[0]) {
                navigator.clipboard.writeText(`${text[0]}`).then(() => {
                    console.log("copied.");
                });
            }
        }
    };
    const handlerPlaySpeedUp = () => {
        const curSentenceID = refState.current.matchingVocab;
        const curSentence = inputList.find(({ id }) => id === curSentenceID);
        if (curSentence !== undefined) {
            const playSpeed = refState.current.playSpeed;
            const valueComputed = strip(playSpeed + 0.2);
            const value = valueComputed > 3 ? 3 : valueComputed;
            setPlaySpeed(value);
            fnPlayTo(curSentence, playSpeed);
        }
    };
    const handlerPlaySpeedDown = () => {
        const curSentenceID = refState.current.matchingVocab;
        const curSentence = inputList.find(({ id }) => id === curSentenceID);
        if (curSentence !== undefined) {
            const playSpeed = refState.current.playSpeed;
            const valueComputed = strip(playSpeed - 0.2);
            const value = valueComputed === 0 ? 0.2 : valueComputed;
            setPlaySpeed(value);
            fnPlayTo(curSentence, playSpeed);
        }
    };
    const handlersPlayClear = () => {
        if (inputList.length > 0) {
            const first = inputList[0];
            dispatch(updateVocabMatchListen(first.id));
            setPlaySpeed(1);
            fnPlayTo(first, playSpeed);
        }
    };
    const handlersTypeVocab = (value: string) => {
        setTextareaValue(value.replace(/\n/, ""));
        fnDebouncedTypeVocab(value.replace(/\n/, ""));
    };
    const handlerToggleTips = () => {
        const maskClass = refState.current.maskClass;
        setMaskClass(maskClass.includes("invisible") ? "mask" : "mask invisible");
    };
    const fnPlayTo = (vocab: DataVocab, speed: number) => {
        if (vocab) {
            dispatch(updateVocabMatchListen(vocab.id));
            setTextareaValue(vocab.text.charAt(0));
            refAudio.current?.play(vocab.pronunciation, speed);
        }
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            if (inputList.length > 0) {
                const curSentenceID = refState.current.matchingVocab;
                const curSentence = inputList.find(({ id }) => id === curSentenceID);
                if (curSentence) {
                    const text = curSentence.text.split(" | ")[0];
                    const textParts = text.split("/");
                    if (textParts[0] === value) {
                        setMaskClass("mask invisible");
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
            if (event.code === "Enter") {
                if (refState.current.isFocused) {
                    setMaskClass("mask");
                    handlersPlayForward();
                }
            }
            if (event.code === "ControlRight") {
                handlerToggleTips();
            }
            if (event.code === "ArrowUp") {
                handlerPlaySpeedUp();
            }
            if (event.code === "ArrowDown") {
                handlerPlaySpeedDown();
            }
        };
        if (inputList.length > 0) {
            const first = inputList[0];
            fnPlayTo(first, 1);
            dispatch(updateVocabMatchListen(matchingVocab ? matchingVocab : first.id));
        }
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
        };
    }, []);
    useEffect(() => {
        refState.current = { matchingVocab, playSpeed, maskClass, isFocused };
    }, [matchingVocab, playSpeed, maskClass, isFocused]);
    return (
        <Layout className="main-inner" id="vocab-listen-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <section id="panel">
                    <div className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn">
                            Click or Press Left
                        </Button>
                        <Button icon={<CopyOutlined />} onClick={handlersInputCopy} className="btn" />
                        <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                        <Button icon={<EyeFilled />} onClick={handlerToggleTips} className="btn"></Button>
                        <Button icon={<DashboardOutlined />} className="btn">
                            {playSpeed}
                        </Button>
                        <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn">
                            Click or Press Right
                        </Button>
                    </div>
                    <div className="progress">
                        <Progress percent={Math.ceil(((curVocabIndex === 0 ? 0 : curVocabIndex + 1) / inputList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </div>
                </section>
                <section id="display">
                    {curVocab && (
                        <>
                            <div className="img">{curVocab.image && <img src={curVocab.image} />}</div>
                            <div className="text">{curVocab.text}</div>
                            <div className={maskClass}></div>
                        </>
                    )}
                </section>
                <section id="input">
                    <Input.TextArea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} />
                </section>
                <Audio ref={refAudio} loop={true} />
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
