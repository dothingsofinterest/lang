import React, { useState, useRef } from "react";
import { Tooltip } from "antd";
import "./GrammarTips.scss";

interface GrammarTipsProps {
    content: string;
    grammar: string[];
}

const GrammarTips: React.FC<GrammarTipsProps> = ({ content, grammar }) => {
    if (!grammar) return <>{content}</>;
    const chunks: any[] = [];
    const paragraphs: string[] = content.split("\n");
    const fnFindGrammar = (anchor: string): string => {
        const found = grammar.find((g, k) => {
            const reg = new RegExp(`^\\[${anchor}\\]`);
            return reg.test(g);
        });
        return found ? found.split(`[${anchor}]`)[1] : ``;
    };
    paragraphs.forEach((paragraph) => {
        let paragraphRight = paragraph;
        const paragraphBuilt: any[] = [];
        const reg = new RegExp(/\[.+?\]/, "g");
        const grammarChunks = paragraph.match(reg);
        if (grammarChunks && grammarChunks.length > 0) {
            grammarChunks.forEach((v, k) => {
                const pureText = v.replace(/[\[\]]/g, "");
                const half = paragraphRight.split(v);
                if (half && half[0]) paragraphBuilt.push(half[0]);
                paragraphBuilt.push(
                    <Tooltip className="hl" title={fnFindGrammar(pureText)}>
                        {pureText}
                    </Tooltip>,
                );
                if (half && half[1]) {
                    if (k === grammarChunks.length - 1) {
                        paragraphBuilt.push(half[1]);
                    } else {
                        paragraphRight = half[1];
                    }
                }
            });
        } else {
            paragraphBuilt.push(paragraphRight);
        }
        chunks.push(paragraphBuilt);
    });
    return (
        <>
            {chunks.map((chunk, i) => (
                <React.Fragment key={i}>
                    <p>{chunk}</p>
                </React.Fragment>
            ))}
        </>
    );
};

export default GrammarTips;
