import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Switch } from "antd";
import { Script as DataScript, Paragraph as DataParagraph, Sentence as DataSentence, Scene as DataScene } from "../../types/Data";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, BulbFilled, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateActiveSentence, updateActiveSentencePos, updateActiveVocab, updateActiveVocabPos, updatePlayMode } from "../../stores/reducers/project";
import { fnIsSRTTime, fnSRTTimeToFloat } from "../../utils/script";
import { ttsGen } from "../../api/requestAuth";
import "./Index.scss";
import Script from "./Script";

const textareaPlaceholder = `Input sentences or vocabs.&#10;EX: wear,wears,wore,worn,wearing`;
const Index = () => {
    console.log("[rendered] dictation/index");
    const dispatch = useDispatch();
    const script = useSelector((state: RootState) => state.script.data);
    const dataArticle = useSelector((state: RootState) => state.script.dataArticle);
    const videoURL = useSelector((state: RootState) => state.video.URL);
    const activeSentence = useSelector((state: RootState) => state.project.activeSentence);
    const activeSentencePos = useSelector((state: RootState) => state.project.activeSentencePos);
    const activeVocab = useSelector((state: RootState) => state.project.activeVocab);
    const activeVocabPos = useSelector((state: RootState) => state.project.activeVocabPos);
    const playMode = useSelector((state: RootState) => state.project.playMode);
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const [vocabs, setVocabs] = useState<string[]>([]);
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [playAudioButton, setPlayAudioButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const [dictationVocabsMode, setDictationVocabsMode] = useState<boolean>(true); // true-EN false-CN
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refActiveSentence = useRef({ activeSentence: activeSentence });
    const handlersPanelPlay = () => {
        if (refVideo.current && videoURL) {
            dispatch(updatePlayMode(0));
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current.play();
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayAgain = () => {
        if (refVideo.current && videoURL) {
            const activeSentence = refActiveSentence.current.activeSentence;
            const cur = sentences[activeSentence];
            if (cur !== undefined && fnIsSRTTime(cur.startTime)) {
                refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
                dispatch(updatePlayMode(0));
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayBackward = () => {
        if (refVideo.current && videoURL) {
            const activeSentence = refActiveSentence.current.activeSentence;
            const prevIndex = activeSentence <= 0 ? 0 : activeSentence - 1;
            const prev = sentences[prevIndex];
            if (prev !== undefined && fnIsSRTTime(prev.startTime)) {
                dispatch(updateActiveSentence(prevIndex));
                dispatch(updatePlayMode(0));
                refVideo.current.currentTime = fnSRTTimeToFloat(prev.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayForward = () => {
        if (refVideo.current && videoURL) {
            const activeSentence = refActiveSentence.current.activeSentence;
            const nextIndex = activeSentence === sentences.length - 1 ? activeSentence : activeSentence + 1;
            const next = sentences[nextIndex];
            if (next !== undefined && fnIsSRTTime(next.startTime)) {
                dispatch(updateActiveSentence(nextIndex));
                dispatch(updatePlayMode(0));
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersInputTips = () => {
        let answerLine = ``;
        let inputLine = ``;
        if (playMode === 0) {
            if (sentences.length > 0) {
                answerLine = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
            }
        } else if (playMode === 1) {
            if (vocabs.length > 0) {
                answerLine = vocabs[activeVocab].split(", ")[1].replace(/\//g, ",");
            }
        }
        for (let i = 0; i < answerLine.length; i++) {
            if (inputValue[i] === answerLine[i]) {
                inputLine += inputValue[i];
            } else {
                inputLine += "X";
                break;
            }
        }
        alert(`${answerLine}\r\n${inputLine}`);
    };
    const handlersPanelActiveClear = () => {
        if (refVideo.current && videoURL) {
            refVideo.current.currentTime = 0;
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        if (refAudio.current) {
            fnPauseAudio();
        }
        dispatch(updateActiveSentence(0));
        dispatch(updateActiveVocab(0));
        dispatch(updatePlayMode(0));
    };
    const handlersPanelAudioPlay = async () => {
        if (refVideo.current) {
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        if (refAudio.current) {
            if (refAudio.current.paused) {
                fnPlayAudio(activeVocab);
            } else {
                fnPauseAudio();
            }
        }
    };
    const handlersPanelAudioPlayBackward = () => {
        if (refVideo.current) {
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        if (refAudio.current) {
            const index = activeVocab - 1 <= 0 ? 0 : activeVocab - 1;
            dispatch(updateActiveVocab(index));
            fnPlayAudio(index);
        }
    };
    const handlersPanelAudioPlayForward = () => {
        if (refVideo.current) {
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
        }
        if (refAudio.current) {
            const index = activeVocab + 1 === vocabs.length ? 0 : activeVocab + 1;
            dispatch(updateActiveVocab(index));
            fnPlayAudio(index);
        }
    };
    const handlersPanelAudioPlayMode = (v: boolean) => {
        setDictationVocabsMode(v);
    };
    const handlersVideoEnded = () => {
        console.log("video ended");
        dispatch(updateActiveSentence(0));
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoPlay = async (e: any) => {
        dispatch(updatePlayMode(0));
        setPlayButton(<PauseCircleOutlined />);
        fnPauseAudio();
    };
    const handlersVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTimeUpdate = (e: any) => {
        const cur = sentences[activeSentence];
        if (cur !== undefined) {
            const endTime = fnSRTTimeToFloat(cur.endTime);
            if (e.target.currentTime >= endTime) {
                if (activeSentence <= sentences.length - 1) {
                    refVideo.current?.pause();
                    setPlayButton(<PlayCircleOutlined />);
                }
            }
        }
    };
    const handlersEventKeyboardOnDown = (event: KeyboardEvent) => {
        if (event.code === "ArrowLeft") {
            handlersPanelPlayBackward();
        }
        if (event.code === "ArrowRight") {
            handlersPanelPlayForward();
        }
        if (event.code === "F8") {
            handlersPanelPlayAgain();
        }
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (playMode === 0) {
            if (sentences.length > 0) {
                const answer = sentences[activeSentence].texts.map((v) => v.split("\n")[0]).join("\n");
                const answerText = answer
                    .replace(/[\,\.\?\!\-]/g, "")
                    .toLowerCase()
                    .trim();
                const inputText = value.toLowerCase();
                if (value === answer || inputText === answerText) {
                    setInputValue("");
                    dispatch(updateActiveSentence(activeSentence + 1));
                    refVideo.current?.play();
                    setPlayButton(<PauseCircleOutlined />);
                }
            }
        }
        if (playMode === 1) {
            if (vocabs.length > 0) {
                const valueTrans = value.includes(",") ? value.replaceAll(",", "/") : value;
                if (vocabs[activeVocab].split(", ")[1] === valueTrans) {
                    setInputValue("");
                    dispatch(updateActiveVocab(activeVocab + 1 === vocabs.length ? 0 : activeVocab + 1));
                    fnPlayAudio(activeVocab + 1 === vocabs.length ? 0 : activeVocab + 1);
                }
            }
        }
    };
    const handlersRenderedCallback = (scrollTopPoint: number, scrollTopVocab: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        const scrollTopVocabValue = scrollTop + scrollTopVocab;
        dispatch(updateActiveSentencePos(scrollTopPointValue));
        dispatch(updateActiveVocabPos(scrollTopVocabValue));
        if (playMode === 0) {
            refScrollbar.current?.scrollTop(scrollTopPointValue);
        } else {
            refScrollbar.current?.scrollTop(scrollTopVocabValue);
        }
    };
    const fnPlayAudio = async (index: number) => {
        if (vocabs && vocabs.length) {
            const vocabsArr = vocabs[index].split(", ");
            const content = dictationVocabsMode ? vocabsArr[1].replaceAll("/", ", ") : vocabsArr[0].split(".")[1];
            const type = dictationVocabsMode && / [A-Z]/.test(vocabsArr[2]) ? 3 : dictationVocabsMode ? 1 : 2;
            try {
                dispatch(updatePlayMode(1));
                setPlayAudioButton(<PauseCircleOutlined />);
                const res = await ttsGen({ content: content, type: type });
                if (res.code) {
                    if (refAudio.current) {
                        const audio = refAudio.current;
                        audio.src = "data:audio/wav;base64," + res.data;
                        audio.load();
                        audio.play();
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.log(error);
                }
            }
        }
    };
    const fnPauseAudio = () => {
        refAudio.current?.pause();
        setPlayAudioButton(<PlayCircleOutlined />);
    };
    const fnOnMounted = () => {
        if (!script.name || !videoURL || !refVideo.current) {
            console.log("Script or Video is required.");
        } else {
            const sentences: DataSentence[] = [];
            script.paragraphs.forEach((v: DataParagraph) => {
                sentences.push(...v.sentences);
            });
            refVideo.current.load();
            refVideo.current.currentTime = sentences[activeSentence] !== undefined && fnIsSRTTime(sentences[activeSentence].startTime) ? fnSRTTimeToFloat(sentences[activeSentence].startTime) : 0;
            if (playMode === 0) {
                refScrollbar.current?.scrollTop(activeSentencePos);
            } else {
                refScrollbar.current?.scrollTop(activeVocabPos);
            }
            setSentences(sentences);
            setVocabs(script.vocabs);
        }
    };
    useEffect(() => {
        console.log("[mounted] dictation/index");
        fnOnMounted();
        window.addEventListener("keydown", handlersEventKeyboardOnDown);
        return () => {
            console.log("[unmounted] dictation/index");
            window.removeEventListener("keydown", handlersEventKeyboardOnDown);
        };
    }, []);
    useEffect(() => {
        console.log("[effected by activeSentence] dictation/index");
        refActiveSentence.current = {
            activeSentence: activeSentence,
        };
    }, [activeSentence]);
    return (
        <Layout id="dictation-index" className="main-inner">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 132px" }}>
                <section id="dictation-panel">
                    <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} className="btn"></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} className="btn"></Button>
                    <Button icon={playButton} onClick={handlersPanelPlay} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} className="btn"></Button>
                    <Button icon={<BulbFilled />} onClick={handlersInputTips} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPanelAudioPlayBackward} className="btn"></Button>
                    <Button icon={playAudioButton} onClick={handlersPanelAudioPlay} className="btn"></Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlersPanelAudioPlayForward} className="btn"></Button>
                    <div className="btn" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Switch checked={dictationVocabsMode} onChange={handlersPanelAudioPlayMode} size="small" checkedChildren="英" unCheckedChildren="中" />
                    </div>
                </section>
                <Scrollbars ref={refScrollbar}>
                    <Script dataArticle={dataArticle} activeSentence={activeSentence} activeVocab={activeVocab} onRendered={handlersRenderedCallback} />
                </Scrollbars>
                <section id="input-area">
                    <Input.TextArea className="input-textarea" value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} autoSize placeholder={textareaPlaceholder} />
                </section>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
            <div className="main-inner-item-main" style={{ display: "flex" }}>
                <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                    <source src={videoURL} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
        </Layout>
    );
};

export default Index;
