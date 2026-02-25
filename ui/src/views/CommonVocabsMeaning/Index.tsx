import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateVocabMatchMeaning } from "../../stores/reducers/plan";
import debounce from "lodash.debounce";
import { Vocab } from "../../types/Data";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingVocab = useSelector((state: RootState) => state.plan.vocabMatchMeaning);
    const [textareaValue, setTextareaValue] = useState("");
    const [selectorVocabs, setSelectorVocabs] = useState<Vocab[]>([]);
    const [progressValue, setProgressValue] = useState<number>(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refState = useRef({ matchingVocab });
    const handlersTypeVocab = (value: string) => {
        setTextareaValue(value);
        fnDebouncedTypeVocab(value);
    };
    const handlersPlayBackward = () => {
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateVocabMatchMeaning(index));
        setTextareaValue(dataFormatted.vocabs[index].text.charAt(0));
    };
    const handlersPlayForward = () => {
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchMeaning(index));
        setTextareaValue(dataFormatted.vocabs[index].text.charAt(0));
    };
    const handlersPlayClear = () => {
        setTextareaValue("");
        dispatch(updateVocabMatchMeaning(0));
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            const matchingVocab = refState.current.matchingVocab;
            if (dataFormatted.vocabs.length > 0) {
                const vocab = dataFormatted.vocabs[matchingVocab];
                if (vocab) {
                    const text = vocab.text.split(" | ")[0];
                    const textParts = text.split("/");
                    if (textParts[0] === value) {
                        const nextIndex = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
                        setTextareaValue(dataFormatted.vocabs[nextIndex].text.charAt(0));
                        dispatch(updateVocabMatchMeaning(nextIndex));
                        if (refAudio.current) {
                            refAudio.current.play();
                        }
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
        return () => {};
    }, []);
    useEffect(() => {
        refState.current = { matchingVocab };
        setProgressValue(Math.ceil(((matchingVocab === 0 ? 0 : matchingVocab + 1) / dataFormatted.vocabs.length) * 100));
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="meaning-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <section id="panel">
                    <section className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                        <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                        <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                    </section>
                    <section className="progress">
                        <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </section>
                </section>
                <section id="display">
                    {dataFormatted.vocabs.length > 0 && (
                        <>
                            <div className="img">{dataFormatted.vocabs[matchingVocab].image && <img src={dataFormatted.vocabs[matchingVocab].image} />}</div>
                            <div className="text">{dataFormatted.vocabs[matchingVocab].text.split(" | ")[2]}</div>
                        </>
                    )}
                </section>
                <section id="input">
                    <Input.TextArea value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} />
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
