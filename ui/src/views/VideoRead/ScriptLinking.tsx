import React, { useState, useRef } from "react";
import { Tooltip } from "antd";
import "./ScriptLinking.scss";

interface ScriptVocabsProps {
    text: string;
    linkings: string[];
}

const ScriptLinking: React.FC<ScriptVocabsProps> = ({ text, linkings }) => {
    if (!linkings) return <>{text}</>;
    const recursHalf = (text: string, linkings: string[]) => {
        const lks = [...linkings];
        const next = lks.pop();
        if (next) {
            let res: any[] = [];
            const linkingPart = next.split(" -> ");
            const linkingPhrase = new RegExp(`${linkingPart[0]}`, "");
            const linkingPhraseMatch = text.match(linkingPhrase);
            const halfs = [];
            if (linkingPhraseMatch && linkingPhraseMatch.index !== undefined) {
                const ha = text.slice(0, linkingPhraseMatch.index);
                const hav = ha && ha.length > 0 ? ha : "";
                const hb = text.slice(linkingPhraseMatch.index + linkingPart[0].length);
                const hbv = hb && hb.length > 0 ? hb : "";
                halfs.push(hav);
                halfs.push(hbv);
            } else {
                halfs.push(text);
            }
            halfs.forEach((half, k) => {
                res.push(...recursHalf(half, lks));
                if (halfs.length === 2 && k === 0) {
                    res.push(
                        <Tooltip className="hl" title={linkingPart[1]}>
                            {linkingPart[0]}
                        </Tooltip>,
                    );
                }
            });
            return res;
        } else {
            return [text];
        }
    };
    const parts: any[] = recursHalf(text, linkings);
    return (
        <>
            {parts.map((part, i) => (
                <React.Fragment key={i}>{part}</React.Fragment>
            ))}
        </>
    );
};

export default ScriptLinking;
