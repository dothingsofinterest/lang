import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer, Select } from "antd";
import { PlusSquareOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { Example as DataExample, Scene as DataScene } from "../../types/Data";
import { fnRandom } from "../../utils/util";
import "./EditorExample.scss";

interface EditorExampleProps {
    examples: DataExample[];
    cates: DataScene[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (examples: DataExample[]) => void;
}

const EditorExample: React.FC<EditorExampleProps> = ({ examples, cates, open, onClose, onSubmit }) => {
    const handlersTempExampleCreate = () => {
        const excluded = examples.map((example) => example.id);
        const id = fnRandom(0, 65535, excluded);
        const newExamples = [...examples];
        newExamples.unshift({ id, cate: "", text: "" });
        if (onSubmit !== undefined) {
            onSubmit(newExamples);
        }
    };
    const handlersExampleRemove = (index: number) => {
        const confirmed = window.confirm("Are you confirmed to do this?");
        if (confirmed) {
            const newExamples = examples.filter((_, exampleIndex) => exampleIndex !== index);
            if (onSubmit !== undefined) {
                onSubmit(newExamples);
            }
        }
    };
    const handlersExampleUp = (index: number) => {
        const newExamples = [...examples];
        const a = newExamples.slice(0, index);
        const b = newExamples.slice(index);
        const upOne = a.pop();
        const theOne = b.shift();
        if (theOne) {
            a.push(theOne);
        }
        if (upOne) {
            b.unshift(upOne);
        }
        if (onSubmit !== undefined) {
            onSubmit([...a, ...b]);
        }
    };
    const handlersExampleDown = (index: number) => {
        const newExamples = [...examples];
        const a = newExamples.slice(0, index);
        const b = newExamples.slice(index);
        const theOne = b.shift();
        const downOne = b.shift();
        if (theOne) {
            b.unshift(theOne);
        }
        if (downOne) {
            b.unshift(downOne);
        }
        if (onSubmit !== undefined) {
            onSubmit([...a, ...b]);
        }
    };
    const handlersExampleUpdateCate = (cate: number | string, index: number) => {
        const cIndex = Number(cate);
        const eIndex = Number(index);
        const curExample = examples[eIndex];
        if (curExample !== undefined) {
            const newExample = { ...curExample, cate: cIndex };
            const newExamples = examples.map((example, index) => (index === eIndex ? newExample : example));
            if (onSubmit !== undefined) {
                onSubmit(newExamples);
            }
        }
    };
    const handlersExampleUpdateText = (index: number, text: string) => {
        const newExamples = examples.map((example, exampleIndex) => (exampleIndex === index ? { ...example, text: text } : example));
        if (onSubmit !== undefined) {
            onSubmit(newExamples);
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
        <Drawer id="video-script-editor-examples" title="Edit Examples" width={800} onClose={handlersOnClose} open={open}>
            <section id="example-panel">
                <Button icon={<PlusSquareOutlined />} onClick={handlersTempExampleCreate} />
            </section>
            <section id="example-list">
                {examples.length > 0 &&
                    examples.map((example, exampleIndex) => {
                        return (
                            <div key={example.id} className="item">
                                <div className="item-panel">
                                    <Select size="small" onChange={(v) => handlersExampleUpdateCate(v, exampleIndex)} value={example.cate} options={cates.map((v) => ({ label: v.value, value: v.index }))} />
                                    <Button icon={<ArrowUpOutlined />} onClick={(e) => handlersExampleUp(exampleIndex)} />
                                    <Button icon={<ArrowDownOutlined />} onClick={(e) => handlersExampleDown(exampleIndex)} />
                                    <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersExampleRemove(exampleIndex)} />
                                </div>
                                <div className="item-textarea">
                                    <Input.TextArea autoSize defaultValue={example.text} onBlur={(e) => handlersExampleUpdateText(exampleIndex, e.target.value)} />
                                </div>
                            </div>
                        );
                    })}
            </section>
        </Drawer>
    );
};

export default EditorExample;
