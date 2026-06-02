import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Button, Progress, Input } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, CopyOutlined, DashboardOutlined, EyeFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateVocabListenCur, updateVocabListenCurIndex } from "../../stores/reducers/status";
import { Vocabulary } from "../../types/Data";
import debounce from "lodash.debounce";
import { strip } from "../../utils/number";
import Audio, { AudioRef } from "../Public/Audio";
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const scriptVocabList = useSelector((state: RootState) => state.script.scriptVocabList);
    const curVocab = useSelector((state: RootState) => {
        if (scriptVocabList.length === 0) return null;
        return state.status.vocabListenCur === null ? scriptVocabList[0] : state.status.vocabListenCur;
    });
    const curVocabIndex = useSelector((state: RootState) => state.status.vocabListenCurIndex);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const [textareaValue, setTextareaValue] = useState("");
    const [maskClass, setMaskClass] = useState("mask");
    const [isFocused, setIsFocused] = useState(false);
    const refAudio = useRef<AudioRef>(null);
    const refAudioPay = useRef<AudioRef>(null);
    const refState = useRef({ curVocab, curVocabIndex, playSpeed, maskClass, isFocused });
    const handlerPlayBackward = () => {
        const playSpeed = refState.current.playSpeed;
        const curVocabIndex = refState.current.curVocabIndex;
        const lastVocab = scriptVocabList[curVocabIndex - 1];
        if (lastVocab !== undefined) {
            fnPlayTo(lastVocab, playSpeed);
        }
    };
    const handlerPlayForward = () => {
        const playSpeed = refState.current.playSpeed;
        const curVocabIndex = refState.current.curVocabIndex;
        const nextVocab = scriptVocabList[curVocabIndex + 1];
        if (nextVocab !== undefined) {
            fnPlayTo(nextVocab, playSpeed);
        }
    };
    const handlerInputCopy = () => {
        const vocab = refState.current.curVocab;
        if (vocab && vocab.definition) {
            const text = vocab.definition.split(" | ");
            if (text && text[0]) {
                navigator.clipboard.writeText(`${text[0]}`).then(() => {
                    console.log("copied.");
                });
            }
        }
    };
    const handlerPlaySpeedUp = () => {
        const curVocab = refState.current.curVocab;
        if (curVocab) {
            const playSpeed = refState.current.playSpeed;
            const valueComputed = strip(playSpeed + 0.2);
            const value = valueComputed > 3 ? 3 : valueComputed;
            setPlaySpeed(value);
            fnPlayTo(curVocab, playSpeed);
        }
    };
    const handlerPlaySpeedDown = () => {
        const curVocab = refState.current.curVocab;
        if (curVocab) {
            const playSpeed = refState.current.playSpeed;
            const valueComputed = strip(playSpeed - 0.2);
            const value = valueComputed === 0 ? 0.2 : valueComputed;
            setPlaySpeed(value);
            fnPlayTo(curVocab, playSpeed);
        }
    };
    const handlerPlayClear = () => {
        if (scriptVocabList.length > 0) {
            fnPlayTo(scriptVocabList[0], playSpeed);
        }
    };
    const handlerTypeVocab = (value: string) => {
        setTextareaValue(value);
        setMaskClass("mask");
        fnDebouncedTypeVocab(value);
    };
    const handlerToggleTips = () => {
        const maskClass = refState.current.maskClass;
        setMaskClass(maskClass.includes("invisible") ? "mask" : "mask invisible");
    };
    const fnPlayTo = (vocab: Vocabulary, speed: number) => {
        if (vocab) {
            setTextareaValue(vocab.definition.charAt(0));
            dispatch(updateVocabListenCur(vocab));
            dispatch(updateVocabListenCurIndex(scriptVocabList.findIndex(({ id }) => id === vocab.id)));
            refAudio.current?.play(`${Domain}/database/speech/${vocab.speech}`, speed);
        }
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            if (scriptVocabList.length > 0) {
                const curVocab = refState.current.curVocab;
                if (curVocab) {
                    const text = curVocab.definition.split(" | ")[0];
                    const textParts = text.split("/");
                    if (textParts[0] === value) {
                        setMaskClass("mask invisible");
                        refAudioPay.current?.play("/audio/paid.mp3", 1);
                    }
                }
            }
        }, 100),
        [],
    );
    useEffect(() => {
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "Enter") {
                if (refState.current.isFocused) {
                    event.preventDefault();
                    setMaskClass("mask");
                    handlerPlayForward();
                }
            }
            if (event.code === "ControlRight") {
                handlerToggleTips();
            }
            const active = document.activeElement;
            // prettier-ignore
            const isTyping = 
                active instanceof HTMLInputElement || 
                active instanceof HTMLTextAreaElement || 
                active?.getAttribute("contenteditable") === "true";
            if (isTyping) {
                return;
            }
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
            if (event.code === "ArrowUp") {
                handlerPlaySpeedUp();
            }
            if (event.code === "ArrowDown") {
                handlerPlaySpeedDown();
            }
        };
        window.addEventListener("keydown", onKeyDownHandler);
        if (curVocab) {
            fnPlayTo(curVocab, 1);
        }
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
        };
    }, []);
    useEffect(() => {
        refState.current = { curVocab, curVocabIndex, playSpeed, maskClass, isFocused };
    }, [curVocab, curVocabIndex, playSpeed, maskClass, isFocused]);
    return (
        <Layout className="main-inner" id="vocab-listen-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "0 0 252px" }}>
                <section id="progress">
                    <Progress percent={Math.ceil(((curVocabIndex + 1) / scriptVocabList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                </section>
                <section id="display">
                    {curVocab && (
                        <>
                            <div className="img">{curVocab.image && <img src={`${Domain}/database/image/${curVocab.image}`} />}</div>
                            <div className="text">{curVocab.definition}</div>
                            <div className={maskClass}></div>
                        </>
                    )}
                </section>
                <section id="input">
                    <div id="panel">
                        <Button icon={<FastBackwardOutlined />} onClick={handlerPlayBackward} className="btn" />
                        <Button icon={<CopyOutlined />} onClick={handlerInputCopy} className="btn" />
                        <Button icon={<ClearOutlined />} onClick={handlerPlayClear} className="btn" />
                        <Button icon={<EyeFilled />} onClick={handlerToggleTips} className="btn"></Button>
                        <Button icon={<DashboardOutlined />} className="btn">
                            {playSpeed}
                        </Button>
                        <Button icon={<FastForwardOutlined />} onClick={handlerPlayForward} className="btn" />
                    </div>
                    <Input.TextArea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} value={textareaValue} onChange={(e) => handlerTypeVocab(e.target.value)} />
                </section>
                <Audio ref={refAudio} loop={true} />
                <Audio ref={refAudioPay} loop={false} />
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
