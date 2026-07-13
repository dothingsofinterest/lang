import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
import { Input } from "antd";
import "./Index.scss";
import type { InputRef } from "antd";

const tokenize = (text: string) => {
    return (
        text
            // 拆分缩写
            .replace(/([a-zA-Z])('re|'ve|'ll|'d|'s|'m|'t)\b/g, "$1 $2")
            // 将标点和符号独立成 token
            .replace(/([:.,!?;"()[\]{}])/g, " $1 ")
            // 多空格压缩
            .replace(/\s+/g, " ")
            .trim()
    );
};

const manipulate = (sentence: any) => {
    if (!sentence) return [];
    const sentenceTemp = { ...sentence };
    sentenceTemp.text = sentenceTemp.text ? tokenize(sentenceTemp.text).split(" ") : [];
    sentenceTemp.piece = sentenceTemp.text.map((_: any, k: number) => k);
    return sentenceTemp;
};

interface WritableProps {
    id: number;
    sentence: any;
    showAnswer?: boolean;
    active?: boolean;
    onComplete?: (id: number) => void;
}

export interface WritableRef {
    focusOnFirst: () => void;
}

// prettier-ignore
const Writable = React.forwardRef<WritableRef, WritableProps>(({ 
    id, 
    sentence, 
    showAnswer = false, 
    active = false, 
    onComplete 
}, ref) => {
    if (!sentence) return <></>;
    const data = manipulate(sentence);
    const [pieceStack, setPieceStack] = useState<number[]>(data.piece); 
    const refState = useRef({ pieceStack });
    const refInputsMap = useRef(new Map<number, InputRef>());
    const handlerOnType = (inputText: string, index: number) => {
        const text = data.text;
        if (inputText === text[index]) {
            const pieceStack = [...refState.current.pieceStack];
            const pieceStackNew = pieceStack.filter((v) => v !== index);
            const curPieceIndex = pieceStack.findIndex((v) => v === index);
            const nextPieceValue = pieceStack[curPieceIndex + 1];
            setPieceStack([...pieceStackNew]);
            refInputsMap.current.get(index)?.blur();
            refInputsMap.current.get(nextPieceValue)?.focus();
            if (nextPieceValue === undefined) {
                if (onComplete) {
                    onComplete(id);
                }
            }
        }
    };
    const handlerOnClick = (index: number) => {
        const pieceStack = [...refState.current.pieceStack];
        const exist = pieceStack.includes(index);
        if (!exist) {
            pieceStack.push(index);
            const pieceStackSorted = pieceStack.sort((a: number, b: number) => a - b);
            setPieceStack([...pieceStackSorted]);
        }
    };
    const handlerFocusOnFirst = () => {
        const index = refState.current.pieceStack[0];
        if (index !== undefined) {
            refInputsMap.current.get(index)?.focus();
        }
    };
    useImperativeHandle(ref, () => ({
        focusOnFirst: handlerFocusOnFirst,
    }));
    useEffect(() => {
        refState.current = { pieceStack };
    }, [pieceStack]);
    return (
        <>
            {data &&
                data.text.map((piece: string, k: number) => {
                    return data.piece.includes(k) && (
                        // prettier-ignore
                        <>
                            <Input 
                                key={`a${k}`} 
                                defaultValue={``}
                                className={showAnswer? "invisible": "visible"}
                                ref={(el) => el && (refInputsMap.current.set(k, el))} 
                                onBlur={(e) => handlerOnType(e.target.value, k)}
                                onChange={(e) => handlerOnType(e.target.value, k)} 
                                onClick={(_) => handlerOnClick(k)}
                                style={{ width: `${piece.length + 2}ch`, background: !pieceStack.includes(k) || active === true ? "#8b8b8b": "#fff"}}
                            />
                            <Input 
                                key={`b${k}`} 
                                value={piece}
                                className={showAnswer? "visible": "invisible"}
                                disabled={true}
                                style={{ width: `${piece.length + 2}ch` }}
                            />
                        </>
                    );
                })}
        </>
    );
});
export default Writable;
