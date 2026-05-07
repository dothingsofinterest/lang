import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Progress } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, EyeFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateVocabMeaningCur, updateVocabMeaningCurIndex } from "../../stores/reducers/status";
import debounce from "lodash.debounce";
import Audio, { AudioRef } from "../Public/Audio";
import { Domain } from "../../settings.js";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const scriptVocabList = useSelector((state: RootState) => state.script.scriptVocabList);
    const curVocab = useSelector((state: RootState) => {
        if (scriptVocabList.length === 0) return null;
        return state.status.vocabMeaningCur === null ? scriptVocabList[0] : state.status.vocabMeaningCur;
    });
    const curVocabIndex = useSelector((state: RootState) => state.status.vocabMeaningCurIndex);
    const [textareaValue, setTextareaValue] = useState("");
    const [maskClass, setMaskClass] = useState("mask");
    const [isFocused, setIsFocused] = useState(false);
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ curVocab, curVocabIndex, maskClass, isFocused });
    const handlerTypeVocab = (value: string) => {
        setTextareaValue(value);
        setMaskClass("mask");
        fnDebouncedTypeVocab(value);
    };
    const handlerPlayBackward = () => {
        const curVocabIndex = refState.current.curVocabIndex;
        const lastVocab = scriptVocabList[curVocabIndex - 1];
        if (lastVocab !== undefined) {
            fnPlayTo(lastVocab);
        }
    };
    const handlerPlayForward = () => {
        const curVocabIndex = refState.current.curVocabIndex;
        const nextVocab = scriptVocabList[curVocabIndex + 1];
        if (nextVocab !== undefined) {
            fnPlayTo(nextVocab);
        }
    };
    const handlerToggleTips = () => {
        setMaskClass(refState.current.maskClass === "mask" ? "unmask" : "mask");
    };
    const handlersPlayClear = () => {
        if (scriptVocabList.length > 0) {
            fnPlayTo(scriptVocabList[0]);
        }
    };
    const fnPlayTo = (vocab: any) => {
        if (vocab) {
            setTextareaValue(vocab.definition.charAt(0));
            dispatch(updateVocabMeaningCur(vocab));
            dispatch(updateVocabMeaningCurIndex(scriptVocabList.findIndex(({ id }) => id === vocab.id)));
        }
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            const curVocab = refState.current.curVocab;
            if (curVocab) {
                const definition = curVocab.definition.split(" | ")[0];
                const definitionParts = definition.split("/");
                if (definitionParts[0] === value) {
                    setMaskClass("unmask");
                    refAudio.current?.play("/audio/paid.mp3", 1);
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
            if (event.code === "ControlRight") {
                handlerToggleTips();
            }
        };
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
        };
    }, []);
    useEffect(() => {
        refState.current = { curVocab, curVocabIndex, maskClass, isFocused };
    }, [curVocab, curVocabIndex, , maskClass, isFocused]);
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
                        <Progress percent={Math.ceil(((curVocabIndex + 1) / scriptVocabList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </section>
                </section>
                <section id="display">
                    {curVocab && (
                        <>
                            <div className="img">{curVocab.image && <img src={`${Domain}/database/image/${curVocab.image}`} />}</div>
                            <div className={`text ${maskClass}`}>{maskClass === "mask" ? curVocab.definition.split(" | ")[2] : curVocab.definition}</div>
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
