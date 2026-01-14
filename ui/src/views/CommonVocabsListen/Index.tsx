import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateVocabMatchListen } from "../../stores/reducers/plan";
import { fnShuffle } from "../../utils/util";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingVocab = useSelector((state: RootState) => state.plan.vocabMatchListen);
    const [matchingVocabChunks, setMatchingVocabChunks] = useState<string[]>([]);
    const [selectorVocabs, setSelectorVocabs] = useState<number[]>([]);
    const [selectorVocabsActvie, setSelectorVocabsActvie] = useState<number | null>(null);
    const [chunkAnswer, setChunkAnswer] = useState<number[]>([]);
    const [chunkAnswerAccomplished, setChunkAnswerAccomplished] = useState<boolean>(false);
    const refScrollbar = useRef<Scrollbars>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refMatchingVocab = useRef({ matchingVocab });
    const refWordList = useRef<HTMLDivElement>(null);
    const refSelector = useRef<HTMLDivElement>(null);
    const handlersClickSelector = (text: string, index: number) => {
        setSelectorVocabsActvie(index);
        if (dataFormatted.vocabs.length > 0) {
            const inputText = text.split(" | ")[0];
            const answerText = dataFormatted.vocabs[matchingVocab].text.split(" | ")[0];
            if (inputText === answerText) {
                const matchingVocabNext = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
                dispatch(updateVocabMatchListen(matchingVocabNext));
                setSelectorVocabsActvie(null);
                setChunkAnswer([]);
                fnPlayAudio(matchingVocabNext);
                if (refWordList.current) {
                    refWordList.current.querySelectorAll(".line").forEach((span: any, k) => {
                        if (matchingVocab === k) {
                            const scrollTop = refScrollbar.current?.getScrollTop() || 0;
                            const scrollTopVocabValue = scrollTop + span.getBoundingClientRect().top;
                            refScrollbar.current?.scrollTop(scrollTopVocabValue);
                        }
                    });
                }
            }
        }
    };
    const handlersClickChunk = (index: number) => {
        if (!chunkAnswer.includes(index)) {
            fnUpdateChunkAnswer([...chunkAnswer, index]);
        }
    };
    const handlersClickAnswer = (index: number) => {
        const chunkAnswerNew = chunkAnswer.filter((v) => v !== index);
        fnUpdateChunkAnswer(chunkAnswerNew);
    };
    const handlersPlayBackward = () => {
        const matchingVocab = refMatchingVocab.current.matchingVocab;
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateVocabMatchListen(index));
        fnPlayAudio(index);
        fnClearChunk();
    };
    const handlersPlayForward = () => {
        const matchingVocab = refMatchingVocab.current.matchingVocab;
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchListen(index));
        fnPlayAudio(index);
        fnClearChunk();
    };
    const handlersPlayClear = () => {
        dispatch(updateVocabMatchListen(0));
        fnPlayAudio(0);
        fnClearChunk();
        refScrollbar.current?.scrollTop(0);
    };
    const fnPlayAudio = async (index: number) => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = vocab.pronunciation;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    const fnClearChunk = async () => {
        setChunkAnswerAccomplished(false);
        setChunkAnswer([]);
    };
    const fnGetRandomNumbers = (index: number, capacity = 4) => {
        let nums = [index];
        if (dataFormatted.vocabs.length > 0) {
            while (nums.length < capacity) {
                const exceptIndices: number[] = [];
                dataFormatted.vocabs.forEach((v, i) => {
                    if (!nums.includes(i)) {
                        exceptIndices.push(i);
                    }
                });
                const randomNum = Math.floor(Math.random() * exceptIndices.length);
                nums.push(exceptIndices[randomNum] === undefined ? 0 : exceptIndices[randomNum]);
            }
            const randomNum = Math.floor(Math.random() * 10) % capacity;
            const a = nums.slice(0, randomNum);
            const b = nums.slice(randomNum, nums.length);
            nums = [...b, ...a];
        }
        return nums;
    };
    const fnGetAssembleElements = (index: number, chunk = 3) => {
        const resElems: string[] = [];
        const text = dataFormatted.vocabs[index].text.split(" | ")[0];
        const slashes = text.match(/\//g);
        if (slashes?.length) {
            for (let i = 0; i < slashes?.length; i++) {
                resElems.push("/");
            }
        }
        text.split("/").forEach((phrase: string) => {
            const spaces = phrase.match(/\s/g);
            if (spaces?.length) {
                for (let i = 0; i < spaces?.length; i++) {
                    resElems.push(" ");
                }
            }
            phrase.split(" ").forEach((vocab) => {
                const chunkLen = chunk >= vocab.length ? vocab.length : chunk;
                const selectLen = Math.ceil(vocab.length / chunkLen);
                for (let i = 0; i < selectLen; i++) {
                    const a = vocab.slice(i * chunk, (i + 1) * chunk);
                    resElems.push(a);
                }
            });
        });
        return fnShuffle(resElems);
    };
    const fnUpdateChunkAnswer = (chunks: number[]) => {
        const answerText = dataFormatted.vocabs[matchingVocab].text.split(" | ")[0];
        let inputSpell = ``;
        chunks.forEach((answer) => {
            inputSpell += matchingVocabChunks[answer];
        });
        setChunkAnswer(chunks);
        setChunkAnswerAccomplished(inputSpell === answerText);
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/common/settings");
        }
        fnPlayAudio(matchingVocab);
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowLeft") {
                handlersPlayBackward();
            }
            if (event.code === "ArrowRight") {
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
        refMatchingVocab.current = { matchingVocab };
        setSelectorVocabs(fnGetRandomNumbers(matchingVocab));
        setMatchingVocabChunks(fnGetAssembleElements(matchingVocab));
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="listen-index">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn">
                        Click or Press Left
                    </Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn">
                        Click or Press Right
                    </Button>
                </section>
                <Scrollbars>
                    <div id="selector" ref={refSelector}>
                        {dataFormatted.vocabs.length > 0 &&
                            selectorVocabs.map((key, index) => {
                                return (
                                    <div key={index} className={`item${index === selectorVocabsActvie ? " active" : ""}`} onClick={() => handlersClickSelector(dataFormatted.vocabs[key].text, index)}>
                                        {dataFormatted.vocabs[key].image && <img src={dataFormatted.vocabs[key].image} />}
                                        <i className="cn">{dataFormatted.vocabs[key].text.split(" | ")[2]}</i>
                                    </div>
                                );
                            })}
                    </div>
                    <div id="assemble">
                        <div className={`answer${chunkAnswerAccomplished ? " succeeded" : ""}`}>
                            {chunkAnswer.map((v, k) => {
                                return (
                                    <div key={k} className="chunk" onClick={() => handlersClickAnswer(v)}>
                                        {matchingVocabChunks[v]}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="chunks">
                            {matchingVocabChunks.map((v, k) => {
                                return (
                                    <div key={k} className={`chunk${chunkAnswer.includes(k) ? " selected" : ""}`} onClick={() => handlersClickChunk(k)}>
                                        {v}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <section id="hidden-elems">
                        <audio ref={refAudio} loop></audio>
                    </section>
                </Scrollbars>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars ref={refScrollbar}>
                    <div id="word-list" ref={refWordList}>
                        {dataFormatted.vocabs.map((value, key) => {
                            return (
                                <div key={key} className={matchingVocab >= key ? (matchingVocab > key ? "line matched" : "line matching") : "line"}>
                                    <i className="index">[{key}]</i>
                                    {value.text}
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
