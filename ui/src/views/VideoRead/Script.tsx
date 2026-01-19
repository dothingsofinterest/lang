import React, { useState, useRef, useEffect } from "react";
import { PlanData } from "../../types/Data";
import ScriptLinking from "./ScriptLinking";
import ScriptFooter from "./ScriptFooter";
import "./Script.scss";

interface ScriptProps {
    dataFormatted: PlanData;
    encn?: number;
    matchingSentence?: number;
    showFooter?: boolean;
    onRendered?: (scrollTopPoint: number) => void;
}

const Script: React.FC<ScriptProps> = ({ dataFormatted, encn = 0, matchingSentence = 0, showFooter = false, onRendered }) => {
    const articleRef = useRef<HTMLDivElement>(null);
    const fnRender = () => {
        if (articleRef.current) {
            let scrollTopPoint = 0;
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
            if (onRendered !== undefined) {
                onRendered(scrollTopPoint);
            }
        }
    };
    useEffect(() => {
        fnRender();
        return () => {};
    }, []);
    useEffect(() => {
        fnRender();
    }, [matchingSentence]);
    return (
        <article ref={articleRef} id="script" className={encn === 0 ? "en" : "cn"}>
            <React.Fragment>
                {dataFormatted.title && <h1>{encn === 0 ? dataFormatted.title.split("-")[0] : dataFormatted.title.split("-")[1]}</h1>}
                {dataFormatted.scenes.map((scene, index) => {
                    return (
                        <section className="scene" key={index}>
                            {scene.name && <h2>{encn === 0 ? scene.name.split("-")[0] : scene.name.split("-")[1]}</h2>}
                            {scene.paragraphs.map((paragraph) => {
                                return paragraph.roles.length < 2 ? (
                                    <React.Fragment key={paragraph.key}>
                                        <p key={paragraph.key} className={paragraph.roles.length === 0 ? "indent" : undefined}>
                                            {paragraph.roles.length > 0 && <i className="role">{encn === 0 ? `${paragraph.roles[0].split("-")[0]}: ` : `${paragraph.roles[0].split("-")[1]}: `}</i>}
                                            {paragraph.sentences.map((v, k) => {
                                                return (
                                                    <span className="point" key={v.key}>
                                                        {v.texts.length > 0 && (encn === 0 ? v.linkings ? <ScriptLinking text={v.texts[0].split("\n")[0]} linkings={v.linkings} /> : v.texts[0].split("\n")[0] : v.texts[0].split("\n")[1])}
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
};

export default Script;
