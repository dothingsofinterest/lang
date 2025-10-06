import React, { useState, useRef, useEffect } from "react";
import { ScriptArticle } from "../../types/Data";
import ScriptArticleScene from "./ScriptArticleScene";
import ScriptVocabs from "./ScriptVocabs";
import ScriptNotes from "./ScriptNotes";
import "./Script.scss";

interface ScriptProps {
    dataArticle: ScriptArticle;
    activeSentence: number;
    activeVocab: number;
    boxID?: string;
    onRendered?: (scrollTopPoint: number, scrollTopVocab: number) => void;
}
const Script: React.FC<ScriptProps> = React.memo(({ dataArticle, activeSentence, activeVocab, boxID = "article", onRendered }) => {
    console.log("[rendered] dictation/script");
    const articleRef = useRef<HTMLDivElement>(null);
    const fnRender = () => {
        if (articleRef.current) {
            let scrollTopPoint = 0;
            let scrollTopVocab = 0;
            const spans = articleRef.current.querySelectorAll(".point");
            spans.forEach((span: any, k) => {
                if (k < activeSentence) {
                    span.className = "point activated";
                } else if (activeSentence === k) {
                    span.className = "point active";
                } else {
                    span.className = "point";
                }
                if (activeSentence === k) scrollTopPoint = span.getBoundingClientRect().top - 150;
            });
            const vocabItems = articleRef.current.querySelectorAll(".vocab-item");
            vocabItems.forEach((span: any, k) => {
                if (k < activeVocab) {
                    span.className = "vocab-item activated";
                } else if (activeVocab === k) {
                    span.className = "vocab-item active";
                } else {
                    span.className = "vocab-item";
                }
                if (activeVocab === k) scrollTopVocab = span.getBoundingClientRect().top - 150;
            });
            if (onRendered !== undefined) {
                onRendered(scrollTopPoint, scrollTopVocab);
            }
        }
    };
    useEffect(() => {
        console.log("[mounted] dictation/script");
        fnRender();
        return () => {
            console.log("[unmounted] dictation/script");
        };
    }, []);
    useEffect(() => {
        console.log("[effected by activeSentence, activeVocab] dictation/script");
        fnRender();
    }, [activeSentence, activeVocab]);
    return (
        <article id={boxID} ref={articleRef}>
            {dataArticle.name && <h1>{dataArticle.name.split("/")[0]}</h1>}
            {<ScriptArticleScene data={dataArticle.scenes} />}
            <footer>
                <ScriptVocabs data={dataArticle.vocabs} />
                <ScriptNotes data={dataArticle.notes} />
            </footer>
        </article>
    );
});

export default Script;
