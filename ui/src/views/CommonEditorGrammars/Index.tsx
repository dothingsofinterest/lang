import React, { useState, useEffect } from "react";
import { Input, Drawer } from "antd";
import "./Index.scss";

interface CommonEditorGrammarsProps {
    grammars: string[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (grammarsArr: string[]) => void;
}

const CommonEditorGrammars: React.FC<CommonEditorGrammarsProps> = ({ grammars, open, onClose, onSubmit }) => {
    const handlersUpdateGrammars = (value: string) => {
        const valueTrimed = value.trim();
        if (valueTrimed !== grammars.join("\n---\n")) {
            if (onSubmit) {
                onSubmit(valueTrimed ? valueTrimed.split("\n---\n") : []);
            }
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="common-editor-grammars-index" title="Edit Grammars" size="large" placement="right" onClose={handlersOnClose} open={open}>
            <Input.TextArea autoSize defaultValue={grammars && grammars.join("\n---\n")} onBlur={(e) => handlersUpdateGrammars(e.target.value)} placeholder="Each piece of grammar should be separated by ---" />
        </Drawer>
    );
};

export default CommonEditorGrammars;
