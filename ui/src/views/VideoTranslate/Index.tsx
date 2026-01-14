import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { FastBackwardOutlined, FastForwardOutlined, BulbFilled, ClearOutlined, PrinterOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateVideoTranslateMatchingSentence, updateVideoTranslateMatchingSentencePos } from "../../stores/reducers/plan";
import Script from "../VideoRead/Script";
import ReactDOMServer from "react-dom/server";
import printJS from "print-js";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan);
    const dataFormatted = useSelector((state: RootState) => state.plan.data);
    const matchingSentence = useSelector((state: RootState) => state.plan.videoTranslateMatchingSentence);
    const [inputValue, setInputValue] = useState("");
    const refScrollbar = useRef<Scrollbars>(null);
    const refMatchingSentence = useRef({ matchingSentence: matchingSentence });
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersPlayBackward = () => {
        const index = matchingSentence - 1 <= 0 ? 0 : matchingSentence - 1;
        dispatch(updateVideoTranslateMatchingSentence(index));
    };
    const handlersPlayForward = () => {
        const index = matchingSentence + 1 > dataFormatted.sentences.length ? matchingSentence : matchingSentence + 1;
        dispatch(updateVideoTranslateMatchingSentence(index));
    };
    const handlersPanelActiveClear = () => {
        setInputValue("");
        dispatch(updateVideoTranslateMatchingSentence(0));
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (dataFormatted.sentences.length > 0) {
            const answer = dataFormatted.sentences[matchingSentence].texts.map((v) => v.split("\n")[0]).join("\n");
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
                setInputValue("");
                dispatch(updateVideoTranslateMatchingSentence(matchingSentence + 1));
                if (refAudio.current) {
                    refAudio.current.play();
                }
            }
        }
    };
    const handlersInputTips = () => {
        if (dataFormatted.sentences.length > 0) {
            if (dataFormatted.sentences[matchingSentence]) {
                let tips1 = ``;
                let tips2 = ``;
                const answer = dataFormatted.sentences[matchingSentence].texts.map((v) => v.split("\n")[0]).join("\n");
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
    const handlersRenderedCallback = (scrollTopPoint: number) => {
        const scrollTop = refScrollbar.current?.getScrollTop() || 0;
        const scrollTopPointValue = scrollTop + scrollTopPoint;
        dispatch(updateVideoTranslateMatchingSentencePos(scrollTopPointValue));
        refScrollbar.current?.scrollTop(scrollTopPointValue);
    };
    const handlersPrint = () => {
        if (plan.hash && plan.videoURL) {
            if (dataFormatted.title) {
                const style1 = `
					@media print {
						@page { margin: 1cm 0.4cm; }
						* { outline: none; }
						html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
						body { margin: 0; padding: 0; font-size: 12pt; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
						ol, ul, li { list-style: none; }
						article { width: 100%; }
						article h1 { text-align: center; font-size: 14pt; font-weight: 900; line-height: 22pt; color: #000; margin: 2pt; }
						article .scene { background: #fff; color: #000;  padding: 10px 0 0; margin: 10px 20px; }
						article .scene h2 { text-align: center; font-size: 12pt; font-weight: 300; font-style: italic; line-height: 22pt; color: #000; margin: 0 6pt; }
						article .scene p { margin: 2pt 0; padding: 0; color: #000; font-size: 10pt; line-height: 22pt; }
						article .scene p.pure { text-indent: 26pt; }
                        article .scene p.indent { text-indent: 26pt; }
						article .scene p:first-of-type  { border-top: 0; }
						article .scene p .point { padding: 0 2pt; }
						article .scene p .point:first-child { padding: 0; }
						article .scene p .role { font-style: normal; font-weight: 900; color: #000; }
						article .scene ul { margin: 0; padding: 2pt 0; color: #000; font-size: 10pt; line-height: 22pt; }
						article .scene ul .role { font-style: normal; font-weight: 900; color: #000; }
						article footer { height: 100%; }
						article footer #vocabs,
						article footer #grammars { color: #000; padding: 6pt 0 0; margin: 16pt; background: #fff; }
						article footer #vocabs .title,
						article footer #grammars .title { color: #000; margin: 0; line-height: 36pt; text-align: center; font-weight: 900; font-size: 12pt; }
						article footer #vocabs .item,
						article footer #grammars .item { margin: 0; padding: 2pt 0; border-top: 1px dotted #ccc; font-size: 10pt; line-height: 22pt; }
						article footer #vocabs .item { display: flex; justify-content: space-between; }                              
                        article footer #vocabs .item:nth-child(2),
						article footer #grammars .item:nth-child(2) { border-top: 0; }
                        article footer #vocabs .item .en { flex: 1; } 
                        article footer #vocabs .item .pr,  
                        article footer #vocabs .item .cn { flex: 0.5; } 
						article footer #vocabs .item .index,
						article footer #grammars .item .index { font-weight: 300; margin-right: 1pt; font-style: normal; };
					}
				`;
                const content = ReactDOMServer.renderToStaticMarkup(<Script dataFormatted={dataFormatted} encn={1} />);
                printJS({ printable: `${content}`, type: "raw-html", style: style1 });
            } else {
                alert(`Data not be set`);
            }
        } else {
            alert("Please create a plan.");
        }
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/common/settings");
        }
        if (plan.type !== 0 && plan.type !== 1) {
            alert("This is not a video plan.");
            navigate("/common/settings");
        }
        return () => {};
    }, []);
    useEffect(() => {
        refMatchingSentence.current = { matchingSentence };
    }, [matchingSentence]);
    return (
        <Layout id="translate-index" className="main-inner">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
                    <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
                    <Button icon={<BulbFilled />} onClick={handlersInputTips} className="btn"></Button>
                    <Button icon={<ClearOutlined />} onClick={handlersPanelActiveClear} className="btn"></Button>
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                </section>
                <Scrollbars>
                    <Input.TextArea value={inputValue} onChange={(e) => handlersTextInput(e.target.value)} autoSize placeholder="Please Translate to English" />
                </Scrollbars>
                <section style={{ display: "none" }}>
                    <audio ref={refAudio} src="/audio/paid.mp3"></audio>
                </section>
            </div>
            <div className="main-inner-item-main">
                <Scrollbars ref={refScrollbar}>
                    <Script dataFormatted={dataFormatted} encn={1} matchingSentence={matchingSentence} onRendered={handlersRenderedCallback} />
                </Scrollbars>
            </div>
        </Layout>
    );
};

export default Index;
