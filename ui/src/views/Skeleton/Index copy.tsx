import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Button, Progress, Input } from "antd";
import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateExampleCur, updateExampleCurIndex } from "../../stores/reducers/status";
import "./Index.scss";
import type { InputRef } from "antd";

const Index = () => {
    const dispatch = useDispatch();
    const exampleList = useSelector((state: RootState) => state.script.scriptExampleSentenceList);
    const curExample = useSelector((state: RootState) => {
        if (exampleList.length === 0) return null;
        if (state.status.exampleCur === null) {
            const theExample = { ...exampleList[0] };
            theExample.text = theExample.text.split(" ");
            theExample.piece = theExample.piece.split("|").map((v: string) => Number(v));
            return theExample;
        } else {
            return state.status.exampleCur;
        }
    });
    const curExampleIndex = useSelector((state: RootState) => state.status.exampleCurIndex);
    const [stackRightEntrance, setStackRightEntrance] = useState<number[]>([]);
    const [stackLeftEntrance, setStackLeftEntrance] = useState<number[]>(curExample && curExample.piece ? curExample.piece : []);
    const [version, setVersion] = useState<number>(0);
    const refInputs = useRef<InputRef[]>([]);
    const refState = useRef({ curExample, curExampleIndex, stackRightEntrance, stackLeftEntrance });
    const handlerPlayBackward = () => {
        const curExampleIndex = refState.current.curExampleIndex;
        const lastExample = exampleList[curExampleIndex - 1];
        if (lastExample !== undefined) {
            const theExample = { ...lastExample };
            theExample.text = theExample.text.split(" ");
            theExample.piece = theExample.piece.split("|").map((v: string) => Number(v));
            setStackRightEntrance([]);
            setStackLeftEntrance(theExample.piece);
            setVersion((version) => version + 1);
            dispatch(updateExampleCur(theExample));
            dispatch(updateExampleCurIndex(exampleList.findIndex(({ id }) => id === lastExample.id)));
        }
    };
    const handlerPlayForward = () => {
        const curExampleIndex = refState.current.curExampleIndex;
        const nextExample = exampleList[curExampleIndex + 1];
        if (nextExample !== undefined) {
            const theExample = { ...nextExample };
            theExample.text = theExample.text.split(" ");
            theExample.piece = theExample.piece.split("|").map((v: string) => Number(v));
            setStackRightEntrance([]);
            setStackLeftEntrance(theExample.piece);
            setVersion((version) => version + 1);
            dispatch(updateExampleCur(theExample));
            dispatch(updateExampleCurIndex(exampleList.findIndex(({ id }) => id === nextExample.id)));
        }
    };
    const handlerPlayClear = () => {
        if (exampleList.length > 0) {
            const first = { ...exampleList[0] };
            first.text = first.text.split(" ");
            first.piece = first.piece.split("|").map((v: string) => Number(v));
            setStackRightEntrance([]);
            setStackLeftEntrance(first.piece);
            setVersion((version) => version + 1);
            dispatch(updateExampleCur(first));
            dispatch(updateExampleCurIndex(exampleList.findIndex(({ id }) => id === first.id)));
        }
    };
    const handlerType = (value: string, index: number) => {
        const text = curExample.text;
        if (text[index] === value) {
            const stackLeftEntrance = [...refState.current.stackLeftEntrance];
            const stackRightEntrance = [...refState.current.stackRightEntrance];
            const head = stackLeftEntrance.shift();
            setStackLeftEntrance([...stackLeftEntrance]);
            if (head) {
                stackRightEntrance.push(head);
                setStackRightEntrance(stackRightEntrance);
            }
        }
    };
    const handlerOnFocus = (index: number) => {
        console.log("index", index);
    };
    useEffect(() => {
        const onKeyDownHandler = (event: KeyboardEvent) => {
            if (event.code === "ArrowLeft") {
                handlerPlayBackward();
            }
            if (event.code === "ArrowRight") {
                handlerPlayForward();
            }
            if (event.code === "Enter") {
                event.preventDefault();
                handlerPlayForward();
            }
            if (event.code === "Backspace") {
                const stackLeftEntrance = refState.current.stackLeftEntrance;
                const stackRightEntrance = refState.current.stackRightEntrance;
                const eleTyping = refInputs.current[stackLeftEntrance[0]];
                if (eleTyping) {
                    if (!eleTyping.input?.value) {
                        const ele = stackRightEntrance.pop();
                        setStackRightEntrance([...stackRightEntrance]);
                        if (ele) {
                            stackLeftEntrance.unshift(ele);
                            setStackLeftEntrance([...stackLeftEntrance]);
                        }
                    }
                }
            }
        };
        dispatch(updateExampleCur(curExample));
        dispatch(updateExampleCurIndex(curExampleIndex));
        window.addEventListener("keydown", onKeyDownHandler);
        return () => {
            window.removeEventListener("keydown", onKeyDownHandler);
        };
    }, []);
    useEffect(() => {
        refState.current = { curExample, curExampleIndex, stackLeftEntrance, stackRightEntrance };
    }, [curExample, curExampleIndex, stackLeftEntrance, stackRightEntrance]);
    useEffect(() => {
        const pointElem = refInputs.current[stackLeftEntrance[0]];
        if (pointElem) {
            pointElem.focus();
        }
    }, [stackLeftEntrance]);
    return (
        <Layout className="main-inner" id="example-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <section id="panel">
                    <div className="buttons">
                        <Button icon={<FastBackwardOutlined />} onClick={handlerPlayBackward} className="btn">
                            Click or Press Left
                        </Button>
                        <Button icon={<ClearOutlined />} onClick={handlerPlayClear} className="btn" />
                        <Button icon={<FastForwardOutlined />} onClick={handlerPlayForward} className="btn">
                            Click or Press Right
                        </Button>
                    </div>
                    <div className="progress">
                        <Progress percent={Math.ceil(((curExampleIndex + 1) / exampleList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
                    </div>
                </section>
                <section id="display">
                    <div className="chunks" key={version}>
                        {curExample &&
                            curExample.text.map((piece: string, k: number) => {
                                return curExample.piece.includes(k) ? (
                                    // prettier-ignore
                                    <Input 
                                        key={`${k}${piece}`} 
                                        defaultValue={``}
                                        ref={(el) => el && (refInputs.current[k] = el)} 
                                        className="item"
                                        onChange={(e) => handlerType(e.target.value, k)} 
                                        onFocus={(e) => handlerOnFocus(k)}
                                        disabled={!stackLeftEntrance.includes(k)} 
                                        style={{ width: `${piece.length + 2}ch`, minWidth: "40px"}}
                                    />
                                ) : (
                                    // prettier-ignore
                                    <span 
                                        key={k} 
                                        className={curExample.piece.includes(k) ? "piece" : ""}>
                                            {piece}
                                    </span>
                                );
                            })}
                    </div>
                </section>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};
export default Index;
