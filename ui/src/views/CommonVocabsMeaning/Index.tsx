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
    const refAudioTips = useRef<HTMLAudioElement>(null);
    const refCloser = useRef({ matchingVocab });
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
            const matchingVocab = refCloser.current.matchingVocab;
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
    const fnGetSelectors = (index: number) => {
        const vocabs: Vocab[] = [];
        const list = dataFormatted.vocabs;
        if (list.length > 0) {
            const startIndex = index - 1 < 0 ? 0 : index - 1;
            const endIndex = index + 2;
            vocabs.push(...list.slice(startIndex, endIndex));
        }
        return vocabs;
    };
    const fnGetSelectorClass = (index: number) => {
        let className = "item";
        if (selectorVocabs.length === 3 && index === 1) {
            className += " active";
        } else {
            if (matchingVocab === 0 && index === 0) {
                className += " active";
            }
            if (matchingVocab !== 0 && index === 1) {
                className += " active";
            }
        }
        return className;
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/common/settings");
        }
        return () => {};
    }, []);
    useEffect(() => {
        refCloser.current = { matchingVocab };
        setSelectorVocabs(fnGetSelectors(matchingVocab));
        setProgressValue(Math.ceil(((matchingVocab === 0 ? 0 : matchingVocab + 1) / dataFormatted.vocabs.length) * 100));
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="meaning-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                </section>
                <div id="selector">
                    {dataFormatted.vocabs.length > 0 &&
                        selectorVocabs.map((vocab, index) => {
                            return (
                                <div key={index} className={fnGetSelectorClass(index)}>
                                    <div className="img">{vocab.image && <img src={vocab.image} />}</div>
                                    <div className="text">{index === 0 ? vocab.text : vocab.text.split(" | ")[2]}</div>
                                </div>
                            );
                        })}
                </div>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <Progress percent={progressValue} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                <Input.TextArea autoSize value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} placeholder="Please Type Vocabulary" />
                <section id="hidden-elems">
                    <audio ref={refAudioTips}></audio>
                    <audio ref={refAudio} src="/audio/paid.mp3"></audio>
                </section>
            </div>
        </Layout>
    );
};
export default Index;
