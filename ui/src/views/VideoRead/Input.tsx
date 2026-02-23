import React from "react";
import { Tooltip } from "antd";
import { Vocab } from "../../types/Data";
import "./Input.scss";

interface InputProps {
    input: string;
    inputs: Vocab[];
    onClick?: (pronunciation: string) => void;
}

const Input: React.FC<InputProps> = ({ input, inputs, onClick }) => {
    if (!inputs) return <>{input}</>;
    const handlersPlay = (pronunciation: string) => {
        if (onClick !== undefined) {
            onClick(pronunciation);
        }
    };
    const fnRecurHalf = (text: string, inputs: Vocab[]) => {
        const theInputs = [...inputs];
        const next = theInputs.pop();
        if (next) {
            let res: any[] = [];
            const inputParts = next.text.split(" | ");
            const inputReg = new RegExp(`${inputParts[0]}`, "");
            const inputMatch = text.match(inputReg);
            const halfs = [];
            if (inputMatch && inputMatch.index !== undefined) {
                const ha = text.slice(0, inputMatch.index);
                const hav = ha && ha.length > 0 ? ha : "";
                const hb = text.slice(inputMatch.index + inputParts[0].length);
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
                        <Tooltip className="input-item" title={next.text}>
                            <span onClick={() => handlersPlay(next.pronunciation)}>{inputParts[0]}</span>
                        </Tooltip>,
                    );
                }
            });
            return res;
        } else {
            return [text];
        }
    };
    const parts: any[] = fnRecurHalf(input, inputs);
    return (
        <>
            {parts.map((part, i) => (
                <React.Fragment key={i}>{part}</React.Fragment>
            ))}
        </>
    );
};

export default Input;
