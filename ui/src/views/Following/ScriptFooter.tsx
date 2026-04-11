import React, { useState, useRef } from "react";
import { Vocab as DataVocab, Grammar as DataGrammar } from "../../types/Data";
import "./ScriptFooter.scss";

interface ScriptVocabProps {
    vocabList: DataVocab[];
    grammarList: DataGrammar[];
}

const ScriptFooter: React.FC<ScriptVocabProps> = ({ vocabList, grammarList }) => {
    return (
        <React.Fragment>
            {vocabList.length > 0 && (
                <div id="script-vocab">
                    <div className="title">Vocab</div>
                    {vocabList.map((value, key) => {
                        return (
                            <p key={key} className="item">
                                <span className="en">
                                    <i className="index">[{key + 1}]</i>
                                    {value.text.split(" | ")[0]}
                                </span>
                                <span className="pr">{value.text.split(" | ")[1]}</span>
                                <span className="cn">{value.text.split(" | ")[2]}</span>
                            </p>
                        );
                    })}
                </div>
            )}
            {grammarList.length > 0 && (
                <div id="script-grammar">
                    <div className="title">Grammar</div>
                    {grammarList.map((value, key) => {
                        return (
                            <p key={key} className="item">
                                <i className="index">[{key + 1}]</i> {value.name}
                            </p>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
};

export default ScriptFooter;
