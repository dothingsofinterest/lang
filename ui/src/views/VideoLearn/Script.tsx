import React, { useState, useRef, useEffect } from "react";
import { FormattedData } from "../../types/Data";
import ScriptFooter from "./ScriptFooter";
import "./Script.scss";

interface ScriptProps {
    dataFormatted: FormattedData;
    encn?: number;
    matchingSentence?: number;
    matchingVocab?: number;
    showFooter?: boolean;
    onRendered?: (scrollTopPoint: number, scrollTopVocab: number) => void;
}

const Script: React.FC<ScriptProps> = React.memo(({ dataFormatted, encn = 0, matchingSentence = 0, matchingVocab = 0, showFooter = true, onRendered }) => {
    const articleRef = useRef<HTMLDivElement>(null);
    const fnRender = () => {
        if (articleRef.current) {
            let scrollTopPoint = 0;
            let scrollTopVocab = 0;
            articleRef.current.querySelectorAll(".point").forEach((span: any, k) => {
                if (k < matchingSentence) {
                    span.className = "point matched";
                } else if (matchingSentence === k) {
                    span.className = "point matching";
                } else {
                    span.className = "point";
                }
                if (matchingSentence === k) scrollTopPoint = span.getBoundingClientRect().top - 150;
            });
            const vocabsArea = articleRef.current.querySelector("#vocabs");
            if (vocabsArea) {
                vocabsArea.querySelectorAll(".item").forEach((span: any, k) => {
                    if (k < matchingVocab) {
                        span.className = "item matched";
                    } else if (matchingVocab === k) {
                        span.className = "item matching";
                    } else {
                        span.className = "item";
                    }
                    if (matchingVocab === k) scrollTopVocab = span.getBoundingClientRect().top - 150;
                });
            }
            if (onRendered !== undefined) {
                onRendered(scrollTopPoint, scrollTopVocab);
            }
        }
    };
    useEffect(() => {
        fnRender();
        return () => {};
    }, []);
    useEffect(() => {
        fnRender();
    }, [matchingSentence, matchingVocab]);
    return (
        <article ref={articleRef} id="script">
            <React.Fragment>
                {dataFormatted.title && <h1>{dataFormatted.title.split("/")[0]}</h1>}
                {dataFormatted.scenes.map((scene, index) => {
                    return (
                        <section className="scene" key={index}>
                            {scene.name && <h2>{encn === 0 ? scene.name.split("-")[0] : scene.name.split("-")[1]}</h2>}
                            {scene.paragraphs.map((paragraph) => {
                                return paragraph.roles.length < 2 ? (
                                    <React.Fragment key={paragraph.key}>
                                        <p key={paragraph.key} className={paragraph.roles.length === 0 ? "indent" : undefined}>
                                            {paragraph.roles.length > 0 && <i className="role">{encn === 0 ? `${paragraph.roles[0].split("-")[0]}: ` : `${paragraph.roles[0].split("-")[1]}: `}</i>}
                                            {paragraph.sentences.map((v) => {
                                                return (
                                                    <span className="point" key={v.key}>
                                                        {encn === 0 ? v.texts.length > 0 && v.texts[0].split("\n")[0] : v.texts.length > 0 && v.texts[0].split("\n")[1]}
                                                    </span>
                                                );
                                            })}
                                        </p>
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment key={paragraph.key}>
                                        {paragraph.sentences.map((sentence) => {
                                            return (
                                                <React.Fragment key={sentence.key}>
                                                    <ul className="point" key={sentence.key}>
                                                        {sentence.texts.map((partOfSentence: any, n: number) => {
                                                            return (
                                                                <li key={n}>
                                                                    <i className="role">{encn === 0 ? `${paragraph.roles[n].split("-")[0]}: ` : `${paragraph.roles[n].split("-")[1]}: `}</i>
                                                                    <span>{encn === 0 ? partOfSentence.split("\n")[0] : partOfSentence.split("\n")[1]}</span>
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
            <footer className="footer">{showFooter && <ScriptFooter vocabs={dataFormatted.vocabs} grammars={dataFormatted.grammars} />}</footer>
        </article>
    );
});

export default Script;
