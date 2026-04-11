import React, { useState, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { CheckSquareOutlined, ClearOutlined } from "@ant-design/icons";
import { Sentence as DataSentence, Paragraph as DataParagraph } from "../../types/Data";
import "./EditorLines.scss";

interface EditorLinesProps {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (lines: DataParagraph[]) => void;
}

const defaultSentence = {
    id: 1,
    startTime: "",
    endTime: "",
    texts: [],
};

const defaultParagraph = {
    id: 1,
    scene: ``,
    roles: [],
    sentences: [defaultSentence],
};

const EditorLines: React.FC<EditorLinesProps> = ({ open, onClose, onSubmit }) => {
    const [sentences, setSentences] = useState<DataSentence[]>([]);
    const handlerParseSentences = (text: string) => {
        const linesSentences = text.replace(/^\d+:\d+\r?\n?/gm, "");
        const sentences = linesSentences.split("\n").map((v, k) => ({ ...defaultSentence, id: k + 1, texts: [v] }));
        setSentences(sentences);
    };
    const handlerClear = () => {
        setSentences([defaultSentence]);
    };
    const handlerSubmit = () => {
        const confirmed = window.confirm("Are you confirmed to do this?");
        if (confirmed) {
            if (onSubmit !== undefined) {
                onSubmit([{ ...defaultParagraph, sentences: sentences }]);
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
        <Drawer id="video-script-editor-lines" title="Import Lines" width={800} onClose={handlersOnClose} open={open}>
            <section id="paste">
                <Input.TextArea autoSize value={``} onChange={(e) => handlerParseSentences(e.target.value)} />
            </section>
            <section id="paragraph">
                {sentences.length > 0 &&
                    sentences.map((sentence) => {
                        return (
                            <p key={sentence.id} className="item">
                                {sentence.texts[0]}
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
