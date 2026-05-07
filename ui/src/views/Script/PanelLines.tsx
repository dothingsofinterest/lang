import React, { useState, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { CheckSquareOutlined, ClearOutlined } from "@ant-design/icons";
import { ScriptSentence } from "../../types/Data";
import "./PanelLines.scss";

interface EditorLinesProps {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (lines: any[]) => void;
}

const defaultSentence = {
    startTime: 0,
    endTime: 0,
    text: "",
};

const EditorLines: React.FC<EditorLinesProps> = ({ open, onClose, onSubmit }) => {
    const [sentences, setSentences] = useState<ScriptSentence[]>([]);
    const handlerParseSentences = (text: string) => {
        const sentences = text.split("\n").map((v, k) => {
            const time = v.match(/^\d+:\d+/);
            const text = v.replace(/^\d+:\d+\r?\n?/gm, "");
            return { startTime: 0, endTime: 0, text };
        });
        setSentences(sentences);
    };
    const handlerClear = () => {
        setSentences([defaultSentence]);
    };
    const handlerSubmit = () => {
        const confirmed = window.confirm("Are you confirmed to do this?");
        if (confirmed) {
            if (onSubmit !== undefined) {
                onSubmit(sentences);
            }
            if (onClose !== undefined) {
                onClose();
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
        <Drawer id="script-panel-lines" title="Import Lines" width={800} onClose={handlersOnClose} open={open}>
            <section id="paste">
                <Input.TextArea autoSize value={``} onChange={(e) => handlerParseSentences(e.target.value)} />
            </section>
            <section id="paragraph">
                {sentences.length > 0 &&
                    sentences.map((sentence, k) => {
                        return (
                            <p key={k} className="item">
                                {sentence.text}
                            </p>
                        );
                    })}
            </section>
            <section id="submit">
                <Button icon={<CheckSquareOutlined />} onClick={handlerSubmit} />
                <Button icon={<ClearOutlined />} onClick={handlerClear} />
            </section>
        </Drawer>
    );
};

export default EditorLines;
