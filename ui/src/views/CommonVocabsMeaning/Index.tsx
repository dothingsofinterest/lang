import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { BulbFilled, ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { Scrollbars } from "react-custom-scrollbars-2";
import { updateVocabMatchMeaning } from "../../stores/reducers/plan";
import debounce from "lodash.debounce";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingVocab = useSelector((state: RootState) => state.plan.vocabMatchMeaning);
    const [textareaValue, setTextareaValue] = useState("");
    const refShowcase = useRef<HTMLDivElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refAudioTips = useRef<HTMLAudioElement>(null);
    const refScrollbar = useRef<Scrollbars>(null);
    const refCloser = useRef({ matchingVocab });
    const handlersTypeVocab = (value: string) => {
        setTextareaValue(value);
        fnDebouncedTypeVocab(value);
    };
    const handlersPlayBackward = () => {
        const index = matchingVocab - 1 <= 0 ? 0 : matchingVocab - 1;
        dispatch(updateVocabMatchMeaning(index));
        fnUpdateScroll();
    };
    const handlersPlayForward = () => {
        const index = matchingVocab + 1 >= dataFormatted.vocabs.length ? matchingVocab : matchingVocab + 1;
        dispatch(updateVocabMatchMeaning(index));
        fnUpdateScroll();
    };
    const handlersVocabTips = () => {
        if (dataFormatted.vocabs.length > 0) {
            const vocab = dataFormatted.vocabs[matchingVocab];
            if (vocab && vocab.pronunciation) {
                if (refAudioTips.current) {
                    const audio = refAudioTips.current;
                    audio.src = vocab.pronunciation;
                    audio.play();
                }
                alert(dataFormatted.vocabs[matchingVocab].text);
            }
        }
    };
    const handlersPlayClear = () => {
        setTextareaValue("");
        dispatch(updateVocabMatchMeaning(0));
        fnUpdateScroll();
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            const matchingVocab = refCloser.current.matchingVocab;
            if (dataFormatted.vocabs.length > 0) {
                if (dataFormatted.vocabs[matchingVocab].text.split(" | ")[0] === value) {
                    setTextareaValue("");
                    dispatch(updateVocabMatchMeaning(matchingVocab + 1 >= dataFormatted.vocabs.length ? 0 : matchingVocab + 1));
                    if (refAudio.current) {
                        refAudio.current.play();
                    }
                    fnUpdateScroll();
                }
            }
        }, 100),
        [],
    );
    const fnUpdateScroll = () => {
        if (refShowcase.current) {
            refShowcase.current.querySelectorAll(".item").forEach((span: any, k) => {
                if (refCloser.current.matchingVocab === k) {
                    const scrollTop = refScrollbar.current?.getScrollTop() || 0;
                    const scrollTopVocabValue = scrollTop + span.getBoundingClientRect().top - 70;
                    refScrollbar.current?.scrollTop(scrollTopVocabValue);
                }
            });
        }
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
    }, [matchingVocab]);
    return (
        <Layout className="main-inner" id="meaning-index">
            <div className="main-inner-item-aside">
                <Scrollbars>
                    <Input.TextArea autoSize value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} placeholder="Please Type Vocabulary" />
                    <section id="hidden-elems">
                        <audio ref={refAudioTips}></audio>
                        <audio ref={refAudio} src="/audio/paid.mp3"></audio>
                    </section>
                </Scrollbars>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<BulbFilled />} onClick={handlersVocabTips} className="btn" />
                    <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                </section>
                <Scrollbars ref={refScrollbar}>
                    <div id="showcase" ref={refShowcase}>
                        {dataFormatted.vocabs.map((value, key) => {
                            return (
                                <div key={key} className={matchingVocab >= key ? (matchingVocab > key ? "item matched" : "item matching") : "item"}>
                                    {value.image && <img src={value.image} />}
                                    <i className="cn">{value.text.split(" | ")[2]}</i>
                                    <i className="text">{value.text}</i>
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
