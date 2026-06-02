import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, Modal } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RedoOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined, ClearOutlined, HighlightOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateReadCurSentence, updateReadVideoCurrentTime, updateReadScrollPos } from "../../stores/reducers/status";
import { Domain } from "../../settings.js";
import { strip } from "../../utils/number";
import Audio, { AudioRef } from "../Public/Audio";
import Vocab from "./Vocab";
import "./Index.scss";
import { useParams } from "react-router-dom";
// prettier-ignore
import { 
    scriptRead, 
    scriptVocabList,
    scriptSentenceList,
    scriptSentenceUpdate
} from "../../api/requestAuth";

const tokenize = (text: string) => {
    return (
        text
            // 拆分缩写
            .replace(/([a-zA-Z])('re|'ve|'ll|'d|'s|'m|'t)\b/g, "$1 $2")
            // 将标点和符号独立成 token
            .replace(/([:.,!?;"()[\]{}])/g, " $1 ")
            // 多空格压缩
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
    );
};

const defaultEditSentence = {
    scriptId: 0,
    paragraphId: 0,
    sentenceId: 0,
    startTime: 0,
    endTime: 0,
    text: "",
    textArr: [],
    piece: [],
};

const Index = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [script, setScript] = useState<any>({});
    const [sentenceList, setSentenceList] = useState<any[]>([]);
    const [vocabList, setVocabList] = useState<any[]>([]);
    const vocabListSorted = [...vocabList].sort((a, b) => a.definition.split(" | ")[0].length - b.definition.split(" | ")[0].length);
    const curSentence = useSelector((state: RootState) => (state.status.readCurSentence === null ? sentenceList[0] : state.status.readCurSentence));
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editSentence, setEditSentence] = useState<any>(defaultEditSentence);
    const refScrollbar = useRef<Scrollbars>(null);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refSentenceMap = useRef(new Map<number, HTMLElement>());
    const refAudio = useRef<AudioRef>(null);
    const refState = useRef({ sentenceList, vocabList, curSentence, playSpeed });
    const handlerPanelPlay = () => {
        if (refVideo.current) {
            const isPaused = refVideo.current.paused;
            if (isPaused) {
                const playSpeed = refState.current.playSpeed;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
            } else {
                refVideo.current.pause();
            }
            setPlayButton(isPaused ? <PauseCircleOutlined /> : <PlayCircleOutlined />);
        }
    };
    const handlerPanelPlayAgain = () => {
        if (refVideo.current) {
            const playSpeed = refState.current.playSpeed;
            const curSentence = refState.current.curSentence;
            if (curSentence && curSentence.startTime) {
                refVideo.current.currentTime = curSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlerPanelPlayBackward = () => {
        if (refVideo.current) {
            const playSpeed = refState.current.playSpeed;
            const sentenceList = refState.current.sentenceList;
            const curSentence = refState.current.curSentence;
            const curSentenceIndex = sentenceList.findIndex(({ id }) => id === curSentence.id);
            const prevSentence = sentenceList[curSentenceIndex - 1];
            if (prevSentence && prevSentence.startTime) {
                refVideo.current.currentTime = prevSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
                dispatch(updateReadCurSentence(prevSentence));
            }
        }
    };
    const handlerPanelPlayForward = () => {
        if (refVideo.current) {
            const playSpeed = refState.current.playSpeed;
            const sentenceList = refState.current.sentenceList;
            const curSentence = refState.current.curSentence;
            const curSentenceIndex = sentenceList.findIndex(({ id }) => id === curSentence.id);
            const nextSentence = sentenceList[curSentenceIndex + 1];
            if (nextSentence && nextSentence.startTime) {
                refVideo.current.currentTime = nextSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
                setPlayButton(<PauseCircleOutlined />);
                dispatch(updateReadCurSentence(nextSentence));
            }
        }
    };
    const handlerPanelPlaySpeedUp = () => {
        if (refVideo.current) {
            const playSpeed = strip(refState.current.playSpeed + 0.2);
            const playSpeedMax = playSpeed > 2 ? 2 : playSpeed;
            const curSentence = refState.current.curSentence;
            if (curSentence && curSentence.startTime) {
                refVideo.current.currentTime = curSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeedMax;
                refVideo.current.play();
                setPlaySpeed(playSpeedMax);
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlerPanelPlaySpeedDown = () => {
        if (refVideo.current) {
            const playSpeed = strip(refState.current.playSpeed - 0.2);
            const playSpeedMin = playSpeed === 0 ? 0.2 : playSpeed;
            const curSentence = refState.current.curSentence;
            if (curSentence && curSentence.startTime) {
                refVideo.current.currentTime = curSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeedMin;
                refVideo.current.play();
                setPlaySpeed(playSpeedMin);
                setPlayButton(<PauseCircleOutlined />);
            }
        }
    };
    const handlerPanelPlayClear = () => {
        if (refVideo.current) {
            refVideo.current.currentTime = 0;
            refVideo.current.pause();
            setPlayButton(<PlayCircleOutlined />);
            dispatch(updateReadCurSentence(sentenceList[0]));
            dispatch(updateReadVideoCurrentTime(0));
        }
    };
    const handlerPanelSentenceOpen = () => {
        setEditSentence({
            scriptId: curSentence.scriptId,
            paragraphId: curSentence.paragraphId,
            sentenceId: curSentence.id,
            startTime: curSentence.startTime,
            endTime: curSentence.endTime,
            text: curSentence.text,
            textArr: curSentence.text ? tokenize(curSentence.text) : [],
            piece: curSentence.piece ? curSentence.piece.split("|").map((v: string) => Number(v)) : [],
        });
        setIsModalOpen(true);
    };

    const handlerVideoEnded = () => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlerVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlerVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlerVideoTimeUpdate = (e: any) => {
        const curSentence = refState.current.curSentence;
        if (curSentence) {
            if (e.target.currentTime >= curSentence.endTime / 1000) {
                refVideo.current?.pause();
                setPlayButton(<PlayCircleOutlined />);
            }
        }
    };
    const handlerPlayAudio = (speech: string) => {
        const audio = refAudio.current;
        if (audio && speech) {
            audio.pause();
            audio.play(speech, 1);
        }
    };
    const handleClickArticle = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(".point")) {
            return;
        }
        refAudio.current?.pause();
    };
    const handlerSentenceUpdatePiece = (index: number) => {
        const piece = editSentence.piece;
        if (piece.includes(index)) {
            setEditSentence({
                ...editSentence,
                piece: piece.filter((v: number) => v !== index).sort((a: number, b: number) => a - b),
            });
        } else {
            piece.push(index);
            setEditSentence({
                ...editSentence,
                piece: piece.sort((a: number, b: number) => a - b),
            });
        }
    };
    const handlerSentenceClose = () => {
        setEditSentence(defaultEditSentence);
        setIsModalOpen(false);
    };
    const handlerSentenceSubmit = async () => {
        if (editSentence.scriptId && editSentence.paragraphId && editSentence.sentenceId) {
            scriptSentenceUpdate({
                scriptId: editSentence.scriptId,
                paragraphId: editSentence.paragraphId,
                sentenceId: editSentence.sentenceId,
                startTime: editSentence.startTime,
                endTime: editSentence.endTime,
                text: editSentence.text,
                piece: editSentence.piece.join("|"),
            }).then((res) => {
                if (res.code === 1) {
                    setIsModalOpen(false);
                    scriptSentenceList({ scriptId: id }).then((res) => {
                        if (res.code === 1) {
                            const listNew: any[] = res.data;
                            setSentenceList(res.data);
                            dispatch(updateReadCurSentence(listNew.find(({ id }) => id === editSentence.sentenceId)));
                        }
                    });
                } else {
                    alert("Failed to update");
                }
            });
        }
    };
    const fnScroll = (sentence: any) => {
        if (sentence) {
            const dom = refSentenceMap.current.get(sentence.id);
            if (dom) {
                const scrollTop = refScrollbar.current?.getScrollTop() || 0;
                const scrollTopPointValue = scrollTop + dom.getBoundingClientRect().top - 200;
                dispatch(updateReadScrollPos(scrollTopPointValue));
                refScrollbar.current?.scrollTop(scrollTopPointValue);
            }
        }
    };
    useEffect(() => {
        const videoElem = refVideo.current;
        const keyboardEvenHandler = (event: KeyboardEvent) => {
            const active = document.activeElement;
            // prettier-ignore
            const isTyping = 
                active instanceof HTMLInputElement || 
                active instanceof HTMLTextAreaElement || 
                active?.getAttribute("contenteditable") === "true";
            if (isTyping) {
                return;
            }
            if (event.code === "Numpad0") {
                event.preventDefault();
                handlerPanelPlayAgain();
            }
            if (event.code === "ArrowLeft") {
                event.preventDefault();
                handlerPanelPlayBackward();
            }
            if (event.code === "ArrowRight") {
                event.preventDefault();
                handlerPanelPlayForward();
            }
            if (event.code === "ControlRight") {
                event.preventDefault();
                handlerPanelPlay();
            }
            if (event.code === "ArrowUp") {
                event.preventDefault();
                handlerPanelPlaySpeedUp();
            }
            if (event.code === "ArrowDown") {
                event.preventDefault();
                handlerPanelPlaySpeedDown();
            }
        };

        scriptRead({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                setScript(res.data);
            }
        });
        scriptSentenceList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                setSentenceList(res.data);
            }
        });
        scriptVocabList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                setVocabList(res.data);
            }
        });
        window.addEventListener("keydown", keyboardEvenHandler);
        return () => {
            window.removeEventListener("keydown", keyboardEvenHandler);
            if (videoElem) {
                videoElem.pause();
                videoElem.removeAttribute("src");
                videoElem.load();
            }
        };
    }, []);
    useEffect(() => {
        refState.current = { sentenceList, vocabList, curSentence, playSpeed };
        fnScroll(curSentence);
    }, [sentenceList, vocabList, curSentence, playSpeed]);
    return (
        <Layout id="read-index" className="main-inner">
            <div className="main-inner-item-aside">
                <video style={{ width: "100%" }} id="video" onPlay={handlerVideoPlay} onPause={handlerVideoPause} onEnded={handlerVideoEnded} onTimeUpdate={handlerVideoTimeUpdate} ref={refVideo}>
                    <source src={`${Domain}/database/${id}/video.mp4`} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<RedoOutlined />} onClick={handlerPanelPlayAgain} className="btn"></Button>
                    <Button icon={<FastBackwardOutlined />} onClick={handlerPanelPlayBackward} className="btn"></Button>
                    <Button icon={playButton} onClick={handlerPanelPlay} className="btn">
                        {playSpeed}
                    </Button>
                    <Button icon={<FastForwardOutlined />} onClick={handlerPanelPlayForward} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlerPanelPlayClear} className="btn"></Button>
                    <Button icon={<HighlightOutlined />} onClick={handlerPanelSentenceOpen} className="btn"></Button>
                </section>
                <Scrollbars ref={refScrollbar}>
                    <article onClick={handleClickArticle} id="script" onFocus={() => alert(1)} onBlur={() => alert(2)}>
                        <React.Fragment>
                            {script.title && <h1>{script.title}</h1>}
                            {script.scenes &&
                                script.scenes.map((scene: any, index: any) => {
                                    return (
                                        <section className="scene" key={index}>
                                            {scene.name && <h2>{scene.name}</h2>}
                                            {scene.paragraphs.map((paragraph: any) => {
                                                return (
                                                    <React.Fragment key={paragraph.id}>
                                                        <p key={paragraph.id} className={!paragraph.role ? "indent" : undefined}>
                                                            {paragraph.role && <i className="role">{paragraph.role}: </i>}
                                                            {paragraph.sentences.map((sentence: any) => {
                                                                return (
                                                                    // prettier-ignore
                                                                    <span
                                                                        ref={(el) => { el && (refSentenceMap.current.set(sentence.id, el)) }} 
                                                                        className={`point${curSentence && curSentence.id === sentence.id ? " matching" : ""}`} 
                                                                        key={sentence.id}>
                                                                            {<Vocab text={sentence.text} vocabList={vocabListSorted} onClick={handlerPlayAudio} />}&nbsp;
                                                                    </span>
                                                                );
                                                            })}
                                                        </p>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </section>
                                    );
                                })}
                        </React.Fragment>
                    </article>
                </Scrollbars>
                <Audio ref={refAudio} loop={true} />
                {/* prettier-ignore */}
                <Modal
                    open={isModalOpen} 
                    onOk={handlerSentenceSubmit} 
                    onCancel={handlerSentenceClose}>
                        <div className="chunks">
                            {editSentence && editSentence.textArr.map((value: string, k: number) => {
                                return (
                                    // prettier-ignore
                                    <span
                                        key={`${k}${value}`}
                                        className={editSentence.piece.includes(k) ? "piece" : "" }
                                        onClick={() => { handlerSentenceUpdatePiece(k) }} >
                                        {value}
                                    </span>
                                );
                            })}
                        </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default Index;
