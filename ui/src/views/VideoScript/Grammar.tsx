import React, { useState, useEffect } from "react";
import { Input } from "antd";
import { updateScriptGrammars } from "../../stores/reducers/plan";
import { useDispatch } from "react-redux";
import "./Grammar.scss";

interface GrammarProps {
    grammars: string[];
}

const Grammar: React.FC<GrammarProps> = ({ grammars }) => {
    const dispatch = useDispatch();
    const handlersUpdateGrammars = (value: string) => {
        if (value.trim() !== grammars.join("\n---\n")) {
            dispatch(updateScriptGrammars({ text: value.trim() }));
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <div id="script-grammar">
            <Input.TextArea autoSize defaultValue={grammars && grammars.join("\n---\n")} onBlur={(e) => handlersUpdateGrammars(e.target.value)} style={{ minHeight: "500px", borderRadius: "0", color: "#000" }} placeholder="Each piece of grammar should be separated by ---" />
        </div>
    );
};

export default Grammar;
