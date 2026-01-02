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
        <Drawer id="common-editor-grammars-index" title="Edit Grammars" width={1200} placement="right" onClose={handlersOnClose} open={open}>
            {onSubmit && <Input.TextArea autoSize defaultValue={grammars && grammars.join("\n---\n")} onBlur={(e) => handlersUpdateGrammars(e.target.value)} placeholder="Each piece of grammar should be separated by ---" />}
            {!onSubmit && (
                <div className="list">
                    {grammars.map((value, key) => {
                        return (
                            <div key={key} className="item">
                                {value.split("\n").map((v, k) =>
                                    k === 0 ? (
                                        <span key={k}>
                                            <i className="index">[{key + 1}]</i>
                                            {v}
                                        </span>
                                    ) : (
                                        <p key={k}>{v}</p>
                                    ),
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Drawer>
    );
};

export default CommonEditorGrammars;
