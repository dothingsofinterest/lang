import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer, Radio } from "antd";
import { PlusSquareOutlined, PlusCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Grammar as DataGrammar } from "../../types/Data";
import screenfull from "screenfull";
import "./EditorGrammar.scss";

interface EditorGrammarProps {
    grammarList: DataGrammar[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (grammarList: DataGrammar[]) => void;
}

const defaultExample = {
    id: 1,
    type: -1,
    text: "",
};

const defaultGrammar = {
    id: 1,
    order: 0,
    name: ``,
    text: ``,
    examples: [defaultExample],
};

const EditorGrammar: React.FC<EditorGrammarProps> = ({ grammarList, open, onClose, onSubmit }) => {
    const refCurExampleID = useRef<number>(0);
    const handlerGrammarCreate = () => {
        const grammarIDs = grammarList.map((grammarItem) => grammarItem.id);
        const id = grammarIDs.length === 0 ? 1 : Math.max(...grammarIDs) + 1;
        const newGrammarList = [...grammarList];
        newGrammarList.unshift({ ...defaultGrammar, id });
        if (onSubmit !== undefined) {
            onSubmit(newGrammarList);
        }
    };
    const handlerGrammarRemove = (grammarId: number) => {
        const confirmed = window.confirm("Are you confirmed to do this?");
        if (confirmed) {
            const newGrammarList = grammarList.filter((grammarItem) => grammarItem.id !== grammarId);
            if (onSubmit !== undefined) {
                onSubmit(newGrammarList);
            }
        }
    };
    const handlerGrammarUpdateName = (grammarId: number, name: string) => {
        const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
        if (curGrammar !== undefined) {
            const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === grammarId ? { ...grammarItem, name } : grammarItem));
            if (onSubmit !== undefined) {
                onSubmit(newGrammarList);
            }
        }
    };
    const handlerGrammarUpdateOrder = (grammarId: number, order: number) => {
        const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
        if (curGrammar !== undefined) {
            const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === grammarId ? { ...grammarItem, order } : grammarItem));
            if (onSubmit !== undefined) {
                onSubmit(newGrammarList.sort((a, b) => a.order - b.order));
            }
        }
    };
    const handlerGrammarUpdateText = (grammarId: number, text: string) => {
        const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
        if (curGrammar !== undefined) {
            const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === grammarId ? { ...grammarItem, text } : grammarItem));
            if (onSubmit !== undefined) {
                onSubmit(newGrammarList);
            }
        }
    };
    const handlerGrammarAddExample = (grammarId: number) => {
        const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
        if (curGrammar !== undefined) {
            const exampleIDs = curGrammar.examples.map((example) => example.id);
            const id = exampleIDs.length === 0 ? 1 : Math.max(...exampleIDs) + 1;
            const newExamples = [...curGrammar.examples];
            newExamples.unshift({ ...defaultExample, id });
            const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === curGrammar.id ? { ...grammarItem, examples: newExamples } : grammarItem));
            if (onSubmit !== undefined) {
                onSubmit(newGrammarList);
            }
        }
    };
    const handlerGrammarRemoveExample = (grammarId: number) => {
        const confirmed = window.confirm("Are you confirmed to do this?");
        if (confirmed) {
            const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
            if (curGrammar !== undefined) {
                if (refCurExampleID.current !== 0) {
                    const exampleId = refCurExampleID.current;
                    const curExample = curGrammar.examples.find((example) => example.id === exampleId);
                    if (curExample !== undefined) {
                        const newExamples = curGrammar.examples.filter((example) => example.id !== exampleId);
                        const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === curGrammar.id ? { ...grammarItem, examples: newExamples } : grammarItem));
                        if (onSubmit !== undefined) {
                            onSubmit(newGrammarList);
                        }
                        refCurExampleID.current = 0;
                    }
                }
            }
        }
    };
    const handlerExampleUpdateType = (grammarId: number, exampleId: number, type: number) => {
        const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
        if (curGrammar !== undefined) {
            const curExample = curGrammar.examples.find((example) => example.id === exampleId);
            if (curExample !== undefined) {
                const newExamples = curGrammar.examples.map((example) => (example.id === curExample.id ? { ...example, type } : example));
                const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === curGrammar.id ? { ...grammarItem, examples: newExamples } : grammarItem));
                if (onSubmit !== undefined) {
                    onSubmit(newGrammarList);
                }
            }
        }
    };
    const handlerExampleUpdateText = (grammarId: number, exampleId: number, text: string) => {
        const curGrammar = grammarList.find((grammarItem) => grammarItem.id === grammarId);
        if (curGrammar !== undefined) {
            const curExample = curGrammar.examples.find((example) => example.id === exampleId);
            if (curExample !== undefined) {
                const newExamples = curGrammar.examples.map((example) => (example.id === curExample.id ? { ...example, text } : example));
                const newGrammarList = grammarList.map((grammarItem) => (grammarItem.id === curGrammar.id ? { ...grammarItem, examples: newExamples } : grammarItem));
                if (onSubmit !== undefined) {
                    onSubmit(newGrammarList);
                }
            }
        }
    };
    const handlerExampleSetCur = (exampleId: number, element: HTMLElement) => {
        refCurExampleID.current = exampleId;
        if (screenfull.isEnabled) {
            screenfull.request(element);
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
        <Drawer id="video-script-editor-grammar" title="Edit Grammar" width={800} onClose={handlersOnClose} open={open}>
            <section id="grammar-panel">
                <Button icon={<PlusSquareOutlined />} onClick={handlerGrammarCreate} />
            </section>
            <section id="grammar-list">
                {grammarList.length > 0 &&
                    grammarList.map((grammarItem) => {
                        return (
                            <div key={grammarItem.id} className="grammar-item">
                                <div className="grammar-info-base">
                                    <Input defaultValue={grammarItem.name} onBlur={(e) => handlerGrammarUpdateName(grammarItem.id, e.target.value)} />
                                    <Input className="order" defaultValue={grammarItem.order} onBlur={(e) => handlerGrammarUpdateOrder(grammarItem.id, Number(e.target.value))} />
                                    <Button icon={<PlusCircleOutlined />} onClick={(e) => handlerGrammarAddExample(grammarItem.id)} />
                                    <Button icon={<MinusCircleOutlined />} onClick={(e) => handlerGrammarRemoveExample(grammarItem.id)} />
                                    <Button icon={<CloseCircleOutlined />} onClick={(e) => handlerGrammarRemove(grammarItem.id)} />
                                </div>
                                <div className="grammar-info-explanation">
                                    <Input.TextArea autoSize defaultValue={grammarItem.text} onBlur={(e) => handlerGrammarUpdateText(grammarItem.id, e.target.value)} />
                                </div>
                                <div className="grammar-info-example">
                                    {grammarItem.examples.length > 0 &&
                                        grammarItem.examples.map((example) => {
                                            return (
                                                <div key={example.id} className="grammar-info-example-item">
                                                    <Radio.Group value={example.type} onChange={(e) => handlerExampleUpdateType(grammarItem.id, example.id, e.target.value)}>
                                                        <Radio.Button value={0}>R</Radio.Button>
                                                        <Radio.Button value={1}>T</Radio.Button>
                                                        <Radio.Button value={2}>A</Radio.Button>
                                                    </Radio.Group>
                                                    <Input.TextArea autoSize defaultValue={example.text} onFocus={(e) => handlerExampleSetCur(example.id, e.target)} onBlur={(e) => handlerExampleUpdateText(grammarItem.id, example.id, e.target.value)} />
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
            </section>
        </Drawer>
    );
};

export default EditorGrammar;
