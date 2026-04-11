import React, { useState, useRef, useEffect, useCallback } from "react";
import { Input, Button, Progress } from "antd";
import { FastBackwardOutlined, FastForwardOutlined, ClearOutlined, EyeFilled } from "@ant-design/icons";
import { GrammarExamplePractice as DataGrammarExamplePractice } from "../../types/Data";
import debounce from "lodash.debounce";
import High from "./High";
import Audio, { AudioRef } from "../Public/Audio";

interface ExampleProps {
    displayType: number;
    list: DataGrammarExamplePractice[];
    matching: number;
    onChangeIndex?: (index: number) => void;
}

const Example: React.FC<ExampleProps> = ({ displayType = 0, list, matching, onChangeIndex }) => {
    const [inputValue, setInputValue] = useState("");
    const [maskClass, setMaskClass] = useState("mask");
    const [progressValue, setProgressValue] = useState<number>(0);
    const [isFocused, setIsFocused] = useState(false);
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ maskClass, matching, isFocused });
    const handlersPlayBackward = () => {
        const matching = refState.current.matching;
        const index = matching - 1 <= 0 ? 0 : matching - 1;
        if (onChangeIndex) {
            setInputValue("");
            onChangeIndex(index);
        }
    };
    const handlersPlayForward = () => {
        const matching = refState.current.matching;
        const index = matching + 1 === list.length ? matching : matching + 1;
        if (onChangeIndex) {
            setInputValue("");
            onChangeIndex(index);
        }
    };
    const handlersPanelActiveClear = () => {
        setInputValue("");
        if (onChangeIndex) {
            onChangeIndex(0);
        }
    };
    const handlersToggleVisible = () => {
        const maskClass = refState.current.maskClass;
        setMaskClass(maskClass.includes("invisible") ? "mask" : "mask invisible");
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value.replace(/\n/, ""));
        fnDebouncedTypeVocab(value.replace(/\n/, ""));
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            if (list.length > 0) {
                const exampleMatching = refState.current.matching;
                const example = list[exampleMatching];
                if (example) {
                    const answer = example.text[displayType === 0 ? 2 : 3];
                    if (answer) {
                        const answerText = answer
                            .replace(/[\,\.\?\!\-\'\"\s]/g, "")
                            .toLowerCase()
                            .trim();
                        const inputText = value
                            .toLowerCase()
                            .replace(/[\,\.\?\!\-\'\"\s]/g, "")
                            .toLowerCase()
                            .trim();
                        if (value === answer || inputText === answerText) {
                            refAudio.current?.play("/audio/paid.mp3", 1);
                            setMaskClass("mask invisible");
                        } else {
                            setMaskClass("mask");
                        }
                    }
                }
            }
        }, 100),
        [],
    );
    useEffect(() => {
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowRight") {
                if (!refState.current.isFocused) {
                    handlersPlayForward();
                }
            }
            if (event.code === "ArrowLeft") {
                if (!refState.current.isFocused) {
                    handlersPlayBackward();
                }
            }
            if (event.code === "Enter") {
                if (refState.current.isFocused) {
                    setMaskClass("mask");
                    handlersPlayForward();
                }
            }
            if (event.code === "ControlRight") {
                handlersToggleVisible();
            }
        };
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
            refAudio.current?.pause();
        };
    }, []);
    useEffect(() => {
        refState.current = { maskClass, matching, isFocused };
        setProgressValue(Math.ceil(((matching === 0 ? 0 : matching + 1) / list.length) * 100));
    }, [maskClass, matching, isFocused]);
    return (
        <>
            <section id="panel">
                <div className="buttons">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                    <Button icon={<EyeFilled />} onClick={handlersToggleVisible} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                </div>
                <div className="progress">
                    <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                </div>
            </section>
            <section id="display">
                {list.length > 0 && list[matching] && (
                    <>
                        <div className="question">
                            <High text={displayType === 0 ? list[matching].text[0] : list[matching].text[1]} />
                        </div>
                        <div className="answer">
                            <div>{displayType === 0 ? list[matching].text[2] : list[matching].text[3]}</div>
                            <div className={maskClass}></div>
                        </div>
                    </>
                )}
            </section>
            <section id="input">
                <Input.TextArea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} />
            </section>
            <Audio ref={refAudio} loop={false} />
        </>
    );
};

export default Example;
