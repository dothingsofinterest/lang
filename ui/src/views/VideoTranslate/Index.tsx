import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Progress } from "antd";
import { FastBackwardOutlined, FastForwardOutlined, BulbFilled, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateVideoExampleMatching } from "../../stores/reducers/plan";
import debounce from "lodash.debounce";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const exampleMatching = useSelector((state: RootState) => state.plan.videoExampleMatching);
    const [inputValue, setInputValue] = useState("");
    const [progressValue, setProgressValue] = useState<number>(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refState = useRef({ exampleMatching });
    const handlersPlayBackward = () => {
        const exampleMatching = refState.current.exampleMatching;
        const index = exampleMatching - 1 <= 0 ? 0 : exampleMatching - 1;
        dispatch(updateVideoExampleMatching(index));
    };
    const handlersPlayForward = () => {
        const exampleMatching = refState.current.exampleMatching;
        const index = exampleMatching + 1 === dataFormatted.examples.length ? exampleMatching : exampleMatching + 1;
        dispatch(updateVideoExampleMatching(index));
    };
    const handlersPanelActiveClear = () => {
        setInputValue("");
        dispatch(updateVideoExampleMatching(0));
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        fnDebouncedTypeVocab(value);
    };
    const handlersInputTips = () => {
        if (dataFormatted.examples.length > 0) {
            const matchingSentence = refState.current.exampleMatching;
            if (dataFormatted.examples[matchingSentence]) {
                let tips1 = ``;
                let tips2 = ``;
                const answer = dataFormatted.examples[exampleMatching].text.split("\n")[1];
                const input = inputValue;
                const answerText = answer
                    .replace(/[\,\.\?\!\-\'\"\s]/g, "")
                    .toLowerCase()
                    .trim();
                const inputText = input
                    .toLowerCase()
                    .replace(/[\,\.\?\!\-\'\"\s]/g, "")
                    .toLowerCase()
                    .trim();
                for (let i = 0; i < answer.length; i++) {
                    if (answer[i] === input[i]) {
                        tips1 += answer[i];
                    } else {
                        tips1 += "X";
                        break;
                    }
                }
                for (let i = 0; i < answerText.length; i++) {
                    if (answerText[i] === inputText[i]) {
                        tips2 += answerText[i];
                    } else {
                        tips2 += "X";
                        break;
                    }
                }
                alert(`${answer}\r\n${tips1}\r\n---\r\n${answerText}\r\n${tips2}`);
            } else {
                alert(`Does not exist.`);
            }
        }
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            if (dataFormatted.examples.length > 0) {
                const exampleMatching = refState.current.exampleMatching;
                const answer = dataFormatted.examples[exampleMatching].text.split("\n")[1];
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
                    const index = exampleMatching + 1 === dataFormatted.examples.length ? exampleMatching : exampleMatching + 1;
                    setInputValue("");
                    dispatch(updateVideoExampleMatching(index));
                    if (refAudio.current) {
                        refAudio.current.play();
                    }
                }
            }
        }, 100),
        [],
    );
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please upload a video.");
            navigate("/common/settings");
        }
        if (plan.type !== 0 && plan.type !== 1) {
            alert("This is not a video plan.");
            navigate("/common/settings");
        }
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowDown") {
                handlersPlayBackward();
            }
            if (event.code === "ArrowUp") {
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
        refState.current = { exampleMatching };
        setProgressValue(Math.ceil(((exampleMatching === 0 ? 0 : exampleMatching + 1) / dataFormatted.examples.length) * 100));
    }, [exampleMatching]);
    return (
        <Layout id="translate-index" className="main-inner">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <section id="panel">
                    <div className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                        <Button icon={<BulbFilled />} onClick={handlersInputTips} className="btn"></Button>
                        <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                        <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                    </div>
                    <div className="progress">
                        <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </div>
                </section>
                <section id="display">
                    {dataFormatted.examples.length > 0 && (
                        <>
                            <div className="cate">{dataFormatted.examples[exampleMatching].cate}</div>
                            <div className="text">{dataFormatted.examples[exampleMatching].text.split("\n")[0]}</div>
                        </>
                    )}
                </section>
                <section id="input">
                    <Input.TextArea value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} />
                </section>
                <section id="hidden-elems">
                    <audio ref={refAudio} src="/audio/paid.mp3"></audio>
                </section>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};

export default Index;
