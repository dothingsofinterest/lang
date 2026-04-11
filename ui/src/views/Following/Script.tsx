import React, { useRef, useEffect } from "react";
import { ScriptParsed } from "../../types/Data";
import ScriptFooter from "./ScriptFooter";
import Vocab from "./Vocab";
import Audio, { AudioRef } from "../Public/Audio";
import "./Script.scss";

interface ScriptProps {
    scriptParsed: ScriptParsed;
    curSentenceID?: number;
    showFooter?: boolean;
    onRendered?: (scrollTopPoint: number) => void;
}

const Script: React.FC<ScriptProps> = ({ scriptParsed, curSentenceID = 0, showFooter = false, onRendered }) => {
    const vocabSorted = [...scriptParsed.vocab].sort((a, b) => a.text.split(" | ")[0].length - b.text.split(" | ")[0].length);
    const refArticle = useRef<HTMLDivElement>(null);
    const refSentences = useRef<HTMLElement[]>([]);
    const refAudio = useRef<AudioRef>(null);
    const handlerPlayAudio = (pronunciation: string) => {
        const audio = refAudio.current;
        if (audio && pronunciation) {
            audio.pause();
            audio.play(pronunciation, 1);
        }
    };
    const handleClickArticle = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(".point")) {
            return;
        }
        refAudio.current?.pause();
    };
    const fnScroll = () => {
        if (refArticle.current) {
            const pointHTML = refSentences.current[curSentenceID];
            if (pointHTML) {
                if (onRendered !== undefined) {
                    onRendered(pointHTML.getBoundingClientRect().top - 150);
                }
            }
        }
    };
    useEffect(() => {
        fnScroll();
        return () => {
            if (refAudio.current) {
                refAudio.current.pause();
            }
        };
    }, []);
    useEffect(() => {
        fnScroll();
    }, [curSentenceID]);
    return (
        <article ref={refArticle} onClick={handleClickArticle} id="script">
            <React.Fragment>
                {scriptParsed.title && <h1>{scriptParsed.title}</h1>}
                {scriptParsed.scenes.map((scene, index) => {
                    return (
                        <section className="scene" key={index}>
                            {scene.name && <h2>{scene.name}</h2>}
                            {scene.paragraphs.map((paragraph) => {
                                return paragraph.roles.length < 2 ? (
                                    <React.Fragment key={paragraph.id}>
                                        <p key={paragraph.id} className={paragraph.roles.length === 0 ? "indent" : undefined}>
                                            {paragraph.roles.length > 0 && <i className="role">{paragraph.roles[0]}: </i>}
                                            {paragraph.sentences.map((sentence) => {
                                                return (
                                                    <span ref={(el) => el && (refSentences.current[sentence.id] = el)} className={`point${curSentenceID === sentence.id ? " matching" : ""}`} key={sentence.id}>
                                                        {sentence.texts.length > 0 && <Vocab text={sentence.texts[0].split("\n")[0]} vocabList={vocabSorted} onClick={handlerPlayAudio} />}
                                                    </span>
                                                );
                                            })}
                                        </p>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment key={paragraph.id}>
                                        {paragraph.sentences.map((sentence) => {
                                            return (
                                                <React.Fragment key={sentence.id}>
                                                    <ul ref={(el) => el && (refSentences.current[sentence.id] = el)} className={`point${curSentenceID === sentence.id ? " matching" : ""}`} key={sentence.id}>
                                                        {sentence.texts.map((partOfSentence: any, n: number) => {
                                                            return (
                                                                <li key={n}>
                                                                    <i className="role">{paragraph.roles[n]}: </i>
                                                                    <span>{<Vocab text={partOfSentence} vocabList={vocabSorted} onClick={handlerPlayAudio} />}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </React.Fragment>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </section>
                    );
                })}
            </React.Fragment>
            <footer className="footer">{showFooter && <ScriptFooter vocabList={scriptParsed.vocab} grammarList={scriptParsed.grammar} />}</footer>
            <Audio ref={refAudio} loop={true} />
        </article>
    );
};

export default Script;
