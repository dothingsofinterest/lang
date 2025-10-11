import React, { useState, useRef, useEffect } from "react";
import { FormattedData } from "../../types/Data";
import ScriptFooter from "./ScriptFooter";
import "./Script.scss";

interface ScriptProps {
    dataFormatted: FormattedData;
    activeSentence: number;
    activeVocab: number;
    showFooter?: boolean;
    onRendered?: (scrollTopPoint: number, scrollTopVocab: number) => void;
}

const Script: React.FC<ScriptProps> = React.memo(({ dataFormatted, activeSentence, activeVocab, showFooter = true, onRendered }) => {
    console.log("[rendered] learn/script");
    const articleRef = useRef<HTMLDivElement>(null);
    const fnRender = () => {
        if (articleRef.current) {
            let scrollTopPoint = 0;
            let scrollTopVocab = 0;
            articleRef.current.querySelectorAll(".point").forEach((span: any, k) => {
                if (k < activeSentence) {
                    span.className = "point activated";
                } else if (activeSentence === k) {
                    span.className = "point active";
                } else {
                    span.className = "point";
                }
                if (activeSentence === k) scrollTopPoint = span.getBoundingClientRect().top - 150;
            });
            const vocabsArea = articleRef.current.querySelector("#vocabs");
            if (vocabsArea) {
                vocabsArea.querySelectorAll(".item").forEach((span: any, k) => {
                    if (k < activeVocab) {
                        span.className = "item activated";
                    } else if (activeVocab === k) {
                        span.className = "item active";
                    } else {
                        span.className = "item";
                    }
                    if (activeVocab === k) scrollTopVocab = span.getBoundingClientRect().top - 150;
                });
            }
            if (onRendered !== undefined) {
                onRendered(scrollTopPoint, scrollTopVocab);
            }
        }
    };
    useEffect(() => {
        console.log("[mounted] learn/script");
        fnRender();
        return () => {
            console.log("[unmounted] learn/script");
        };
    }, []);
    useEffect(() => {
        console.log("[effected by activeSentence, activeVocab] learn/script");
        fnRender();
    }, [activeSentence, activeVocab]);
    return (
        <article ref={articleRef} id="script">
            <React.Fragment>
                {dataFormatted.title && <h1>{dataFormatted.title.split("/")[0]}</h1>}
                {dataFormatted.scenes.map((scene, index) => {
                    return (
                        <section className="scene" key={index}>
                            {scene.name && <h2>{scene.name}</h2>}
                            {scene.paragraphs.map((paragraph) => {
                                return paragraph.roles.length < 2 ? (
                                    <p key={paragraph.key} className={paragraph.roles.length === 0 ? "pure" : undefined}>
                                        {paragraph.roles.length > 0 && <i className="role">{paragraph.roles[0].split("-")[0]}: </i>}
                                        {paragraph.sentences.map((v) => {
                                            return (
                                                <React.Fragment key={v.key}>
                                                    <span className="point">{v.texts.length > 0 && v.texts[0].split("\n")[0]}</span>
                                                </React.Fragment>
                                            );
                                        })}
                                    </p>
                                ) : (
                                    <React.Fragment key={paragraph.key}>
                                        {paragraph.sentences.map((sentence) => {
                                            return (
                                                <ul className="point" key={sentence.key}>
                                                    {sentence.texts.map((partOfSentence: any, n: number) => {
                                                        return (
                                                            <li key={n}>
                                                                <i className="role">{paragraph.roles[n].split("-")[0]}: </i>
                                                                <span>{partOfSentence.split("\n")[0]}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
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
