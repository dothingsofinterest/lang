import React from "react";
import { Vocab } from "../../types/Data";
import "./ScriptFooter.scss";

interface ScriptVocabsProps {
    vocabs: Vocab[];
    grammars: string[];
}
const ScriptFooter: React.FC<ScriptVocabsProps> = React.memo(({ vocabs, grammars }) => {
    return (
        <React.Fragment>
            {vocabs.length > 0 && (
                <div id="vocabs">
                    <div className="title">Vocabs</div>
                    {vocabs.map((value, key) => {
                        return (
                            <p key={key} className="item">
                                <i className="index">[{key + 1}] </i>
                                {value.text}
                            </p>
                        );
                    })}
                </div>
            )}
            {grammars.length > 0 && (
                <div id="grammars">
                    <div className="title">Grammars</div>
                    {grammars.map((value, key) => {
                        return (
                            <div key={key} className="item">
                                <span className="index">[{key + 1}] </span>
                                {value.split("\n").map((v, k) => (k === 0 ? <span key={k}>{v}</span> : <p key={k}>{v}</p>))}
                            </div>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
});

export default ScriptFooter;
