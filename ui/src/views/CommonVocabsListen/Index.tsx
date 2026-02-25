import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, Progress } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateVocabMatchListen } from "../../stores/reducers/plan";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingVocab = useSelector((state: RootState) => state.plan.vocabMatchListen);
    const [playSpeed, setPlaySpeed] = useState<number>(1);
    const [progressValue, setProgressValue] = useState<number>(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refState = useRef({ matchingVocab, playSpeed });
    const handlersPlayBackward = () => {
        const matchingVocab = refState.current.matchingVocab;
        const playSpeed = refState.current.playSpeed;
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateVocabMatchListen(index));
        fnPlayAudio(index, playSpeed);
    };
    const handlersPlayForward = () => {
        const matchingVocab = refState.current.matchingVocab;
        const playSpeed = refState.current.playSpeed;
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchListen(index));
        fnPlayAudio(index, playSpeed);
    };
    const handlersPlaySpeedUp = () => {
        if (refAudio.current) {
            const matchingVocab = refState.current.matchingVocab;
            const playSpeed = refState.current.playSpeed;
            const valueComputed = playSpeed + 0.5;
            const value = valueComputed > 3 ? 3 : valueComputed;
            setPlaySpeed(value);
            fnPlayAudio(matchingVocab, value);
        }
    };
    const handlersPlaySpeedDown = () => {
        if (refAudio.current) {
            const matchingVocab = refState.current.matchingVocab;
            const playSpeed = refState.current.playSpeed;
            const valueComputed = playSpeed - 0.5;
            const value = valueComputed === 0 ? 0.5 : valueComputed;
            setPlaySpeed(value);
            fnPlayAudio(matchingVocab, value);
        }
    };
    const handlersPlayClear = () => {
        dispatch(updateVocabMatchListen(0));
        setPlaySpeed(1);
        fnPlayAudio(0, 1);
    };
    const fnPlayAudio = async (index: number, speed: number = 1) => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = vocab.pronunciation;
                    audio.playbackRate = speed;
                    audio.play();
                }
            }
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
            if (event.code === "ArrowUp") {
                handlersPlaySpeedUp();
            }
            if (event.code === "ArrowDown") {
                handlersPlaySpeedDown();
            }
        };
        fnPlayAudio(matchingVocab);
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
        refState.current = { matchingVocab, playSpeed };
        setProgressValue(Math.ceil(((matchingVocab === 0 ? 0 : matchingVocab + 1) / dataFormatted.vocabs.length) * 100));
    }, [matchingVocab, playSpeed]);
    return (
        <Layout className="main-inner" id="listen-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 0" }}>
                <section id="panel">
                    <div className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn">
                            Click or Press Left
                        </Button>
                        <Button icon={<CaretUpOutlined />} onClick={handlersPlaySpeedUp} className="btn" />
                        <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                        <Button icon={<CaretDownOutlined />} onClick={handlersPlaySpeedDown} className="btn">
                            {playSpeed}
                        </Button>
                        <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn">
                            Click or Press Right
                        </Button>
                    </div>
                    <div className="progress">
                        <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </div>
                </section>
                <section id="display">
                    {dataFormatted.vocabs.length > 0 && (
                        <>
                            <div className="img">{dataFormatted.vocabs[matchingVocab].image && <img src={dataFormatted.vocabs[matchingVocab].image} />}</div>
                            <div className="text">{dataFormatted.vocabs[matchingVocab].text}</div>
                        </>
                    )}
                </section>
                <section id="hidden-elems">
                    <audio ref={refAudio} loop></audio>
                </section>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
