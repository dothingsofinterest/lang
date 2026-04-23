// import React, { useState, useRef, useEffect } from "react";
// import { Button, Layout, Progress } from "antd";
// import { RootState } from "../../stores";
// import { ClearOutlined, FastBackwardOutlined, FastForwardOutlined, SoundFilled } from "@ant-design/icons";
// import { useSelector, useDispatch } from "react-redux";
// import { createSelector } from "@reduxjs/toolkit";
// import { updateVocabWatchCur, updateVocabWatchCurIndex } from "../../stores/reducers/status";
// import { fnShuffle } from "../../utils/util";
// import { Vocab as DataVocab } from "../../types/Data";
// import Audio, { AudioRef } from "../Public/Audio";
// import { Domain } from "../../settings.js";
// import "./Index.scss";

// const calOptions = (excludedItem: DataVocab, list: DataVocab[]): DataVocab[] => {
//     const result: DataVocab[] = [excludedItem];
//     for (let i = 0; i < 3; i++) {
//         const filterList = list.filter((item) => !result.map((r) => r.id).includes(item.id));
//         const randomIndex = Math.floor(Math.random() * (filterList.length - 1));
//         result.push(filterList[randomIndex]);
//     }
//     return fnShuffle(result);
// };

// const Index = () => {
//     const dispatch = useDispatch();
//     const scriptParsed = useSelector((state: RootState) => state.data.scriptParsed);
//     const inputListFilteredSelector = createSelector([(state: RootState) => state.data.scriptParsed.vocab], (inputs: DataVocab[]) => inputs.filter((v) => v.category === undefined || (v.category & 2) !== 0));
//     const inputList = useSelector(inputListFilteredSelector);
//     const curVocab = useSelector((state: RootState) => {
//         if (inputList.length === 0) return null;
//         return state.status.vocabWatchCur === null ? inputList[0] : state.status.vocabWatchCur;
//     });
//     const curVocabIndex = useSelector((state: RootState) => state.status.vocabWatchCurIndex);
//     const [selection, setSelection] = useState<DataVocab[]>(() => (curVocab ? calOptions(curVocab, inputList) : []));
//     const [selectionActvie, setSelectionActvie] = useState<number>(0);
//     const refAudio = useRef<AudioRef>(null);
//     const refState = useRef({ curVocab, curVocabIndex });
//     const handlerClickSelection = (vocab: DataVocab) => {
//         if (curVocab) {
//             const inputText = vocab.definition.split(" | ")[0];
//             const answerText = curVocab.definition.split(" | ")[0];
//             if (inputText === answerText) {
//                 refAudio.current?.play("/audio/paid.mp3", 1);
//                 const nextVocab = inputList[curVocabIndex + 1];
//                 if (nextVocab !== undefined) {
//                     fnPlayTo(nextVocab);
//                 }
//             } else {
//                 setSelectionActvie(vocab.id);
//             }
//         }
//     };
//     const handlerPlayAudio = () => {
//         const curVocab = refState.current.curVocab;
//         if (curVocab && curVocab.speech) {
//             refAudio.current?.play(`${Domain}/data/${scriptParsed.hash}/speech/${curVocab.speech}`, 1);
//         }
//     };
//     const handlersPlayBackward = () => {
//         const curVocabIndex = refState.current.curVocabIndex;
//         const lastVocab = inputList[curVocabIndex - 1];
//         if (lastVocab !== undefined) {
//             fnPlayTo(lastVocab);
//         }
//     };
//     const handlersPlayForward = () => {
//         const curVocabIndex = refState.current.curVocabIndex;
//         const nextVocab = inputList[curVocabIndex + 1];
//         if (nextVocab !== undefined) {
//             fnPlayTo(nextVocab);
//         }
//     };
//     const handlersPlayClear = () => {
//         if (inputList.length > 0) {
//             fnPlayTo(inputList[0]);
//         }
//     };
//     const fnPlayTo = (vocab: DataVocab) => {
//         if (vocab) {
//             setSelection(calOptions(vocab, inputList));
//             setSelectionActvie(0);
//             dispatch(updateVocabWatchCur(vocab));
//             dispatch(updateVocabWatchCurIndex(inputList.findIndex(({ id }) => id === vocab.id)));
//         }
//     };
//     useEffect(() => {
//         const onKeyDownHandler = (event: KeyboardEvent) => {
//             if (event.code === "ArrowLeft") {
//                 handlersPlayBackward();
//             }
//             if (event.code === "ArrowRight") {
//                 handlersPlayForward();
//             }
//         };
//         window.addEventListener("keydown", onKeyDownHandler);
//         return () => {
//             window.removeEventListener("keydown", onKeyDownHandler);
//         };
//     }, []);
//     useEffect(() => {
//         refState.current = { curVocab, curVocabIndex };
//     }, [curVocab, curVocabIndex]);
//     return (
//         <Layout className="main-inner" id="vocab-watch-index">
//             <div className="main-inner-item-aside"></div>
//             <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 0" }}>
//                 <section id="panel">
//                     <div className="buttons">
//                         <Button icon={<FastBackwardOutlined />} onClick={handlersPlayBackward} className="btn" />
//                         <Button icon={<SoundFilled />} onClick={handlerPlayAudio} className="btn" />
//                         <Button icon={<ClearOutlined />} onClick={handlersPlayClear} className="btn" />
//                         <Button icon={<FastForwardOutlined />} onClick={handlersPlayForward} className="btn" />
//                     </div>
//                     <div className="progress">
//                         <Progress percent={Math.ceil(((curVocabIndex + 1) / inputList.length) * 100)} percentPosition={{ align: "center", type: "inner" }} strokeLinecap="butt" />
//                     </div>
//                 </section>
//                 <section id="display">
//                     {curVocab && (
//                         <>
//                             <div className="text">{curVocab.definition.split(" | ")[0]}</div>
//                             <div className="selector">
//                                 {selection.map((item) => {
//                                     return (
//                                         <div key={item.id} className={`item${item.id === selectionActvie ? " active" : ""}`} onClick={() => handlerClickSelection(item)}>
//                                             {item.image && <img src={`${Domain}/data/${scriptParsed.hash}/vocab_images/${item.image}`} />}
//                                             <i className="cn">{item.definition.split(" | ")[2]}</i>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </>
//                     )}
//                 </section>
//                 <Audio ref={refAudio} loop={false} />
//             </div>
//             <div className="main-inner-item-aside"></div>
//         </Layout>
//     );
// };
// export default Index;
