import React from "react";
import { Tooltip } from "antd";
import { Vocab as DataVocab } from "../../types/Data";
import "./Vocab.scss";

interface VocabProps {
    text: string;
    assetsPrefix: string;
    vocabList: DataVocab[];
    onClick?: (speech: string) => void;
}

const tipBgColor = "#c5a587";

const Vocab: React.FC<VocabProps> = ({ text, assetsPrefix, vocabList, onClick }) => {
    if (!vocabList) return <>{text}</>;
    const handlerPlay = (speech: string) => {
        if (onClick !== undefined) {
            onClick(`${assetsPrefix}${speech}?${Date.now()}`);
        }
    };
    const fnRecurHalf = (text: string, inputs: DataVocab[]) => {
        const theInputs = [...inputs];
        const next = theInputs.pop();
        if (next) {
            let res: any[] = [];
            const inputParts = next.definition.split(" | ");
            const inputReg = new RegExp(`(^| )${inputParts[0]}`, "i");
            const inputMatch = text.match(inputReg);
            const halfs = [];
            if (inputMatch && inputMatch.index !== undefined) {
                const index = inputMatch.index;
                const ha = text.slice(0, index);
                const hav = ha && ha.length > 0 ? ha : "";
                const hb = text.slice(index + inputMatch[0].length);
                const hbv = hb && hb.length > 0 ? hb : "";
                halfs.push(hav);
                halfs.push(hbv);
            } else {
                halfs.push(text);
            }
            halfs.forEach((half, k) => {
                res.push(...fnRecurHalf(half, theInputs));
                if (halfs.length === 2 && k === 0) {
                    res.push(
                        <Tooltip className="vocab-item" title={next.definition} color={tipBgColor}>
                            <span onClick={() => handlerPlay(next.speech)}>{inputMatch ? inputMatch[0] : inputParts[0]}</span>
                        </Tooltip>,
                    );
                }
            });
            return res;
        } else {
            return [text];
        }
    };
    const parts: any[] = fnRecurHalf(text, vocabList);
    return (
        <>
            {parts.map((part, i) => (
                <React.Fragment key={i}>{part}</React.Fragment>
            ))}
        </>
    );
};

export default Vocab;
