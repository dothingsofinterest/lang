import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, Input } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateVideoAudioClipsMatching } from "../../stores/reducers/plan";
import HighLightText from "./HighlightText";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingAudioClip = useSelector((state: RootState) => state.plan.videoAudioClipsMatching);
    const [inputValue, setInputValue] = useState("");
    const refScrollbar = useRef<Scrollbars>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refList = useRef<HTMLDivElement>(null);
    const refListArr = useRef<NodeListOf<HTMLDivElement> | null | undefined>(null);
    const refState = useRef({ matchingAudioClip });
    const handlersPlayBackward = () => {
        const matchingAudioClip = refState.current.matchingAudioClip;
        const index = matchingAudioClip - 1 <= 0 ? 0 : matchingAudioClip - 1;
        dispatch(updateVideoAudioClipsMatching(index));
        fnScrollList(index - 1);
        fnPlayAudio(index);
    };
    const handlersPlayForward = () => {
        const matchingAudioClip = refState.current.matchingAudioClip;
        const index = matchingAudioClip + 1 >= dataFormatted.audioClips.length ? matchingAudioClip : matchingAudioClip + 1;
        dispatch(updateVideoAudioClipsMatching(index));
        fnScrollList(index - 1);
        fnPlayAudio(index);
    };
    const handlersPlayClear = () => {
        dispatch(updateVideoAudioClipsMatching(0));
        fnPlayAudio(0);
        refScrollbar.current?.scrollTop(0);
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        const list = dataFormatted.audioClips;
        const audioClipsLen = list.length;
        if (audioClipsLen > 0) {
            const theAudioClip = list[matchingAudioClip];
            if (theAudioClip) {
                const answer = list[matchingAudioClip].text.split(" | ")[0];
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
                    const index = matchingAudioClip + 1 >= audioClipsLen ? 0 : matchingAudioClip + 1;
                    fnPlayAudio(index);
                    fnScrollList(index - 1);
                    setInputValue("");
                    dispatch(updateVideoAudioClipsMatching(index));
                }
            }
        }
    };
    const fnPlayAudio = async (index: number) => {
        if (dataFormatted.audioClips.length > 0) {
            const audioClip = dataFormatted.audioClips[index];
            if (audioClip && audioClip.audio) {
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = audioClip.audio;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    const fnScrollList = (index: number) => {
        const list = refListArr.current;
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
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowLeft") {
                handlersPlayBackward();
            }
            if (event.code === "ArrowRight") {
                handlersPlayForward();
            }
        };
        fnPlayAudio(matchingAudioClip);
        refListArr.current = refList.current?.querySelectorAll(".line");
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
        refState.current = { ...refState.current, matchingAudioClip };
    }, [matchingAudioClip]);
    return (
        <Layout className="main-inner" id="listen-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                </section>
                <Scrollbars>
                    <Input.TextArea value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} autoSize />
                </Scrollbars>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars ref={refScrollbar}>
                    <div id="list" ref={refList}>
                        {dataFormatted.audioClips.map((value, key) => {
                            return (
                                <div key={key} className={matchingAudioClip >= key ? (matchingAudioClip > key ? "line matched" : "line matching") : "line"}>
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
