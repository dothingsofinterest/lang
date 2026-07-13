import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateListenCurSentence } from "../../stores/reducers/status";
import { strip } from "../../utils/number";
// prettier-ignore
import { 
    EyeInvisibleOutlined, 
    EyeOutlined,
    PlayCircleOutlined
} from "@ant-design/icons";
import Writable from "./Writable";
import "./Writable";
import "./Index.scss";
import { Domain } from "../../settings.js";
import Audio, { AudioRef } from "../Public/Audio";
// prettier-ignore
import { 
    scriptRead, 
    scriptSentenceList, 
} from "../../api/requestAuth";
import { useParams } from "react-router-dom";

const Index = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [script, setScript] = useState<any>({});
    const [showAnswer, setShowAnswer] = useState<boolean>(false);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const curSentenceId = useSelector((state: RootState) => state.status.listenCurSentenceId);
    const refScrollbar = useRef<Scrollbars>(null);
    const refSentenceList = useRef<any[]>([]);
    const refSentenceMap = useRef(new Map<number, any>());
    const refSentenceCurId = useRef<number>(curSentenceId);
    const refPlaySpeed = useRef<number>(playSpeed);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudioPay = useRef<AudioRef>(null);
    const handlerPanelPlay = () => {
        if (refVideo.current) {
            const isPaused = refVideo.current.paused;
            if (isPaused) {
                const playSpeed = refPlaySpeed.current;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
            } else {
                refVideo.current.pause();
            }
        }
    };
    const handlerPanelPlayAgain = () => {
        if (refVideo.current) {
            const playSpeed = refPlaySpeed.current;
            const sentenceList = refSentenceList.current;
            const sentenceCurId = refSentenceCurId.current;
            const sentenceCur = sentenceList.find(({ id }) => id === sentenceCurId);
            const theSentence = sentenceCur ? sentenceCur : sentenceList[0];
            if (theSentence && theSentence.startTime) {
                refVideo.current.currentTime = theSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeed;
                refVideo.current.play();
            }
        }
    };
    const handlerVideoTimeUpdate = (e: any) => {
        const sentenceList = refSentenceList.current;
        const sentenceCurId = refSentenceCurId.current;
        const sentenceCur = sentenceList.find(({ id }) => id === sentenceCurId);
        const theSentence = sentenceCur ? sentenceCur : sentenceList[0];
        if (theSentence) {
            if (e.target.currentTime >= theSentence.endTime / 1000) {
                refVideo.current?.pause();
            }
        }
    };
    const handlerOnComplete = (sentenceId: number) => {
        refAudioPay.current?.play("/audio/paid.mp3", 1);
        const index = refSentenceList.current.findIndex(({ id }) => id === sentenceId);
        const nextSentence = refSentenceList.current[index + 1];
        if (nextSentence) {
            refSentenceCurId.current = nextSentence.id;
            const nextDom = refSentenceMap.current.get(nextSentence.id);
            if (nextDom) {
                nextDom.focusOnFirst();
            }
        }
    };
    const handlerPanelPlaySpeedUp = () => {
        if (refVideo.current) {
            const playSpeed = strip(refPlaySpeed.current + 0.2);
            const playSpeedMax = playSpeed > 2 ? 2 : playSpeed;
            const sentenceList = refSentenceList.current;
            const sentenceCurId = refSentenceCurId.current;
            const sentenceCur = sentenceList.find(({ id }) => id === sentenceCurId);
            const theSentence = sentenceCur ? sentenceCur : sentenceList[0];
            if (theSentence && theSentence.startTime) {
                refVideo.current.currentTime = theSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeedMax;
                refVideo.current.play();
                setPlaySpeed(playSpeedMax);
            }
        }
    };
    const handlerPanelPlaySpeedDown = () => {
        if (refVideo.current) {
            const playSpeed = strip(refPlaySpeed.current - 0.2);
            const playSpeedMin = playSpeed === 0 ? 0.2 : playSpeed;
            const sentenceList = refSentenceList.current;
            const sentenceCurId = refSentenceCurId.current;
            const sentenceCur = sentenceList.find(({ id }) => id === sentenceCurId);
            const theSentence = sentenceCur ? sentenceCur : sentenceList[0];
            if (theSentence && theSentence.startTime) {
                refVideo.current.currentTime = theSentence.startTime / 1000;
                refVideo.current.playbackRate = playSpeedMin;
                refVideo.current.play();
                setPlaySpeed(playSpeedMin);
            }
        }
    };
    useEffect(() => {
        scriptRead({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                setScript(res.data);
            }
        });
        scriptSentenceList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                refSentenceList.current = res.data;
            }
        });
        const videoElem = refVideo.current;
        const keyboardEvenHandler = (event: KeyboardEvent) => {
            if (event.code === "Enter") {
                event.preventDefault();
                handlerPanelPlayAgain();
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
        window.addEventListener("keydown", keyboardEvenHandler);
        return () => {
            window.removeEventListener("keydown", keyboardEvenHandler);
            if (videoElem) {
                videoElem.pause();
                videoElem.removeAttribute("src");
                videoElem.load();
                dispatch(updateListenCurSentence(refSentenceCurId.current));
            }
        };
    }, []);
    useEffect(() => {
        refPlaySpeed.current = playSpeed;
    }, [playSpeed]);
    return (
        <Layout id="listen-index" className="main-inner">
            <div className="main-inner-item-aside">
                <video style={{ width: "100%" }} id="video" onTimeUpdate={handlerVideoTimeUpdate} ref={refVideo}>
                    <source src={`${Domain}/database/${id}/video.mp4`} type="video/mp4" /> Your browser does not support video tag.
                </video>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={showAnswer ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={(_) => setShowAnswer(!showAnswer)} className="btn" />
                    <Button icon={<PlayCircleOutlined />} onClick={handlerPanelPlay} className="btn">
                        {playSpeed}
                    </Button>
                </section>
                <Scrollbars ref={refScrollbar}>
                    <article id="script">
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
                                                            {paragraph.sentences.map((sentence: any) =>
                                                                // prettier-ignore
                                                                <Writable 
                                                                    key={sentence.id}
                                                                    id={sentence.id} 
                                                                    ref={(el) => { el && (refSentenceMap.current.set(sentence.id, el)) }} 
                                                                    sentence={sentence} 
                                                                    showAnswer={showAnswer} 
                                                                    active={sentence.id === refSentenceCurId.current? true: false}
                                                                    onComplete={handlerOnComplete} />,
                                                            )}
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
            </div>
            <div className="main-inner-item-aside">
                <Audio ref={refAudioPay} loop={false} />
            </div>
        </Layout>
    );
};

export default Index;
