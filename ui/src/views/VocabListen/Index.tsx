// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Layout, Button, Progress, Input } from "antd";
// import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, CopyOutlined, DashboardOutlined, EyeFilled } from "@ant-design/icons";
// import { RootState } from "../../stores";
// import { useSelector, useDispatch } from "react-redux";
// import { createSelector } from "@reduxjs/toolkit";
// import { updateVocabListenCur, updateVocabListenCurIndex } from "../../stores/reducers/status";
// import { Vocab as DataVocab } from "../../types/Data";
// import debounce from "lodash.debounce";
// import { strip } from "../../utils/number";
// import Audio, { AudioRef } from "../Public/Audio";
// import { Domain } from "../../settings.js";
// import "./Index.scss";

// const Index = () => {
//     const dispatch = useDispatch();
//     const scriptParsed = useSelector((state: RootState) => state.data.scriptParsed);
//     const inputListFilteredSelector = createSelector([(state: RootState) => state.data.scriptParsed.vocab], (inputs: DataVocab[]) => inputs.filter((v) => v.category === undefined || (v.category & 1) !== 0));
//     const inputList = useSelector(inputListFilteredSelector);
//     const curVocab = useSelector((state: RootState) => {
//         if (inputList.length === 0) return null;
//         return state.status.vocabListenCur === null ? inputList[0] : state.status.vocabListenCur;
//     });
//     const curVocabIndex = useSelector((state: RootState) => state.status.vocabListenCurIndex);
//     const [playSpeed, setPlaySpeed] = useState<number>(1);
//     const [textareaValue, setTextareaValue] = useState("");
//     const [maskClass, setMaskClass] = useState("mask");
//     const [isFocused, setIsFocused] = useState(false);
//     const refAudio = useRef<AudioRef>(null);
//     const refState = useRef({ curVocab, curVocabIndex, playSpeed, maskClass, isFocused });
//     const handlersPlayBackward = () => {
//         const playSpeed = refState.current.playSpeed;
//         const curVocabIndex = refState.current.curVocabIndex;
//         const lastVocab = inputList[curVocabIndex - 1];
//         if (lastVocab !== undefined) {
//             fnPlayTo(lastVocab, playSpeed);
//         }
//     };
//     const handlersPlayForward = () => {
//         const playSpeed = refState.current.playSpeed;
//         const curVocabIndex = refState.current.curVocabIndex;
//         const nextVocab = inputList[curVocabIndex + 1];
//         if (nextVocab !== undefined) {
//             fnPlayTo(nextVocab, playSpeed);
//         }
//     };
//     const handlersInputCopy = () => {
//         const vocab = refState.current.curVocab;
//         if (vocab && vocab.definition) {
//             const text = vocab.definition.split(" | ");
//             if (text && text[0]) {
//                 navigator.clipboard.writeText(`${text[0]}`).then(() => {
//                     console.log("copied.");
//                 });
//             }
//         }
//     };
//     const handlerPlaySpeedUp = () => {
//         const curVocab = refState.current.curVocab;
//         if (curVocab) {
//             const playSpeed = refState.current.playSpeed;
//             const valueComputed = strip(playSpeed + 0.2);
//             const value = valueComputed > 3 ? 3 : valueComputed;
//             setPlaySpeed(value);
//             fnPlayTo(curVocab, playSpeed);
//         }
//     };
//     const handlerPlaySpeedDown = () => {
//         const curVocab = refState.current.curVocab;
//         if (curVocab) {
//             const playSpeed = refState.current.playSpeed;
//             const valueComputed = strip(playSpeed - 0.2);
//             const value = valueComputed === 0 ? 0.2 : valueComputed;
//             setPlaySpeed(value);
//             fnPlayTo(curVocab, playSpeed);
//         }
//     };
//     const handlersPlayClear = () => {
//         if (inputList.length > 0) {
//             fnPlayTo(inputList[0], playSpeed);
//         }
//     };
//     const handlersTypeVocab = (value: string) => {
//         setTextareaValue(value);
//         setMaskClass("mask");
//         fnDebouncedTypeVocab(value);
//     };
//     const handlerToggleTips = () => {
//         const maskClass = refState.current.maskClass;
//         setMaskClass(maskClass.includes("invisible") ? "mask" : "mask invisible");
//     };
//     const fnPlayTo = (vocab: DataVocab, speed: number) => {
//         if (vocab) {
//             setTextareaValue(vocab.definition.charAt(0));
//             dispatch(updateVocabListenCur(vocab));
//             dispatch(updateVocabListenCurIndex(inputList.findIndex(({ id }) => id === vocab.id)));
//             refAudio.current?.play(`${Domain}/data/${scriptParsed.hash}/speech/${vocab.speech}`, speed);
//         }
//     };
//     const fnDebouncedTypeVocab = useCallback(
//         debounce((value) => {
//             if (inputList.length > 0) {
//                 const curVocab = refState.current.curVocab;
//                 if (curVocab) {
//                     const text = curVocab.definition.split(" | ")[0];
//                     const textParts = text.split("/");
//                     if (textParts[0] === value) {
//                         setMaskClass("mask invisible");
//                     }
//                 }
//             }
//         }, 100),
//         [],
//     );
//     useEffect(() => {
//         const onKeyDownHandler = (event: KeyboardEvent) => {
//             if (event.code === "ArrowLeft") {
//                 if (!refState.current.isFocused) {
//                     handlersPlayBackward();
//                 }
//             }
//             if (event.code === "ArrowRight") {
//                 if (!refState.current.isFocused) {
//                     handlersPlayForward();
//                 }
//             }
//             if (event.code === "Enter") {
//                 if (refState.current.isFocused) {
//                     event.preventDefault();
//                     setMaskClass("mask");
//                     handlersPlayForward();
//                 }
//             }
//             if (event.code === "ControlRight") {
//                 handlerToggleTips();
//             }
//             if (event.code === "ArrowUp") {
//                 handlerPlaySpeedUp();
//             }
//             if (event.code === "ArrowDown") {
//                 handlerPlaySpeedDown();
//             }
//         };
//         window.addEventListener("keydown", onKeyDownHandler);
//         if (curVocab) {
//             fnPlayTo(curVocab, 1);
//         }
//         return () => {
//             window.removeEventListener("keydown", onKeyDownHandler);
//         };
//     }, []);
//     useEffect(() => {
//         refState.current = { curVocab, curVocabIndex, playSpeed, maskClass, isFocused };
//     }, [curVocab, curVocabIndex, playSpeed, maskClass, isFocused]);
//     return (
//         <Layout className="main-inner" id="vocab-listen-index">
//             <div className="main-inner-item-aside"></div>
//             <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
//                 <section id="panel">
//                     <div className="buttons">
//                         <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn">
//                             Click or Press Left
//                         </Button>
//                         <Button icon={<CopyOutlined />} onClick={handlersInputCopy} className="btn" />
//                         <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
//                         <Button icon={<EyeFilled />} onClick={handlerToggleTips} className="btn"></Button>
//                         <Button icon={<DashboardOutlined />} className="btn">
//                             {playSpeed}
//                         </Button>
//                         <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn">
//                             Click or Press Right
//                         </Button>
//                     </div>
//                     <div className="progress">
//                         <Progress percent={Math.ceil(((curVocabIndex + 1) / inputList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
//                     </div>
//                 </section>
//                 <section id="display">
//                     {curVocab && (
//                         <>
//                             <div className="img">{curVocab.image && <img src={`${Domain}/data/${scriptParsed.hash}/vocab_images/${curVocab.image}`} />}</div>
//                             <div className="text">{curVocab.definition}</div>
//                             <div className={maskClass}></div>
//                         </>
//                     )}
//                 </section>
//                 <section id="input">
//                     <Input.TextArea onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} value={textareaValue} onChange={(e) => handlersTypeVocab(e.target.value)} />
//                 </section>
//                 <Audio ref={refAudio} loop={true} />
//             </div>
//             <div className="main-inner-item-aside"></div>
//         </Layout>
//     );
// };
// export default Index;
