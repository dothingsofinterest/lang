import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, FileWordOutlined, GoogleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { vocabImagePronunciationMove, vocabImagePronunciationRemove } from "../../api/requestAuth";
import { updateDiaryTitle, updateDiaryDate, updateDiaryContent, updateDiaryVocabs, updateDiaryGrammars, updateDiaryVocabsByDelete } from "../../stores/reducers/plan";
import { Vocab as DataVocab } from "../../types/Data";
import VocabsEditor from "../CommonEditorVocabs/Index";
import EditorGrammars from "../CommonEditorGrammars/Index";
import printJS from "print-js";
import ReactDOMServer from "react-dom/server";
import "./Index.scss";

const Index = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const plan = useSelector((state: RootState) => state.plan);
    const [vocabsEditor, setVocabsEditor] = useState(false);
    const [grammarsEditor, setGrammarsEditor] = useState(false);
    const refDiary = useRef<HTMLDivElement>(null);
    const refPlan = useRef({ plan });
    const handlersTitle = (value: string) => {
        dispatch(updateDiaryTitle(value));
    };
    const handlersDate = (value: string) => {
        dispatch(updateDiaryDate(value));
    };
    const handlersContent = (value: string) => {
        dispatch(updateDiaryContent(value));
    };
    const handlersVocabsEditorOpen = () => {
        setVocabsEditor(true);
    };
    const handlersVocabsEditorClose = () => {
        setVocabsEditor(false);
    };
    const handlersVocabsEditorSubmit = async (vocab: DataVocab) => {
        if (vocab.text && vocab.pronunciation) {
            const res = await vocabImagePronunciationMove({ plan: plan.hash, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
            if (res.code === 1) {
                dispatch(updateDiaryVocabs(vocab));
            }
        }
    };
    const handlersVocabsEditorRemove = async (index: number) => {
        dispatch(updateDiaryVocabsByDelete(index));
        const vocab = plan.diary.vocabs[index];
        if (vocab && (vocab.image || vocab.pronunciation)) {
            await vocabImagePronunciationRemove({ plan: plan.hash, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
        }
    };
    const handlersGrammarsEditorOpen = () => {
        setGrammarsEditor(true);
    };
    const handlersGrammarsEditorClose = () => {
        setGrammarsEditor(false);
    };
    const handlersGrammarsEditorSubmit = async (grammars: string[]) => {
        dispatch(updateDiaryGrammars(grammars));
    };
    const handlersPrint = () => {
        if (plan.data.title && plan.data.date) {
            const style = `
					@media print {
						@page { margin: 1cm 0.4cm; }
						* { outline: none; }
						html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
						body { margin: 0; padding: 0; font-size: 12pt; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
						ol, ul, li { list-style: none; }
                        #diary h1 { color: #000; text-align: center; font-size: 14pt; font-weight: 900; line-height: 30pt; }
                        #diary h2 { color: #000; text-align: center; font-size: 12pt; font-weight: 300; line-height: 28pt; }
                        #diary .block { padding: 6pt 12pt; margin: 8pt 0 0; border-top: 0.5pt dotted #666; }
                        #diary .block:first-of-type { margin-top: 0; border-top: 0;}
                        #diary .block p { color: #000; margin: 0; padding: 0; line-height: 28pt; font-size: 12pt; word-wrap: break-word; }
                        #diary .block p .hl { color: gray; font-style: italic; font-weight: 900; }
                        #diary .block.tips p:first-of-type { border-top: 0; }
					}
				`;
            const content = ReactDOMServer.renderToStaticMarkup(
                <article id="diary">
                    {plan.data.title && <h1>{plan.data.title}</h1>}
                    {plan.data.date && <h2>{plan.data.date}</h2>}
                    <div className="block" dangerouslySetInnerHTML={{ __html: plan.data.content }}></div>
                    <div className="block" dangerouslySetInnerHTML={{ __html: plan.data.content }}></div>
                    <div className="block tips" dangerouslySetInnerHTML={{ __html: plan.data.content }}></div>
                </article>,
            );
            printJS({ printable: `${content}`, type: "raw-html", style: style });
        } else {
            alert("Please write title and date.");
        }
    };
    useEffect(() => {
        if (!plan.hash || !plan.videoURL) {
            alert("Please create a plan.");
            navigate("/common/settings");
        }
        if (plan.type !== 0 && plan.type !== 2) {
            alert("This is not a diary plan.");
            navigate("/common/settings");
        }
        const elemDiary = refDiary.current;
        if (!elemDiary) return;
        const elemTip = elemDiary.querySelector(".tip") as HTMLElement;
        function handlerClick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("hl")) {
                const text = target.innerText;
                navigator.clipboard.writeText(`【${text}】`).then(() => {
                    console.log("copied.");
                });
            }
        }
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("hl")) {
                const text = target.innerHTML;
                for (let i = 0; i < refPlan.current.plan.diary.grammars.length; i++) {
                    const reg = new RegExp(`^【${text}】`);
                    if (reg.test(refPlan.current.plan.diary.grammars[i])) {
                        if (elemTip) {
                            elemTip.innerHTML = refPlan.current.plan.diary.grammars[i]
                                .split("\n")
                                .map((v, k) => `<p key=${k}>${v}</p>`)
                                .join("");
                            elemTip.style.display = "block";
                        }
                        break;
                    }
                }
            }
        };
        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("hl")) {
                if (elemTip) {
                    elemTip.style.display = "none";
                }
            }
        };
        elemDiary.addEventListener("click", handlerClick);
        elemDiary.addEventListener("mouseover", handleMouseOver);
        elemDiary.addEventListener("mouseout", handleMouseOut);
        return () => {
            elemDiary.removeEventListener("click", handlerClick);
            elemDiary.removeEventListener("mouseover", handleMouseOver);
            elemDiary.removeEventListener("mouseout", handleMouseOut);
        };
    }, []);
    useEffect(() => {
        refPlan.current = { plan };
    }, [plan]);
    return (
        <Layout id="diary-edit-index" className="main-inner">
            <div className="main-inner-item-aside">
                <Scrollbars>
                    <article id="diary" ref={refDiary}>
                        {plan.data.title && <h1>{plan.data.title}</h1>}
                        {plan.data.date && <h2>{plan.data.date}</h2>}
                        <div className="main" dangerouslySetInnerHTML={{ __html: plan.data.content }}></div>
                        <div className="tip"></div>
                    </article>
                </Scrollbars>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "100px 0 0" }}>
                <section id="panel">
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                    <Button icon={<FileWordOutlined />} onClick={handlersVocabsEditorOpen} className="btn">
                        Vocabs
                    </Button>
                    <Button icon={<GoogleOutlined />} onClick={handlersGrammarsEditorOpen} className="btn">
                        Grammars
                    </Button>
                </section>
                <section id="meta">
                    <Input value={plan.diary.title} onChange={(e) => handlersTitle(e.target.value)} placeholder="Title" />
                    <Input value={plan.diary.date} onChange={(e) => handlersDate(e.target.value)} placeholder="on December 2, 2025, at 10:05 p.m." />
                </section>
                <Scrollbars>
                    <Input.TextArea value={plan.diary.content} onChange={(e) => handlersContent(e.target.value)} placeholder="Just write what you are thinking about at this moment." />
                </Scrollbars>
                <VocabsEditor vocabs={plan.data.vocabs} open={vocabsEditor} onClose={handlersVocabsEditorClose} onSubmit={handlersVocabsEditorSubmit} onRemove={handlersVocabsEditorRemove} />
                <EditorGrammars grammars={plan.diary.grammars} open={grammarsEditor} onClose={handlersGrammarsEditorClose} onSubmit={handlersGrammarsEditorSubmit} />
            </div>
        </Layout>
    );
};

export default Index;
