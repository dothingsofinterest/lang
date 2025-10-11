import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateProject, PayloadProject } from "../../types/Data";
import { Script as DataScript, PayloadScript, StateScript, Vocab as DataVocab } from "../../types/Data";
import { fnGetFormattedData, fnSRTTimeToFloat, fnIsSRTTime } from "../../utils/script";

const dataSentence = {
    key: "0-0",
    startTime: "",
    endTime: "",
    texts: [],
};

const dataParagraph = {
    key: `0`,
    scene: ``,
    roles: [],
    sentences: [dataSentence],
};

const initialState: StateProject = {
    name: "",
    videoURL: "",
    videoCompressedURL: "",
    script: {
        data: {
            title: "",
            roles: [],
            scenes: [],
            vocabs: [],
            grammars: [],
            paragraphs: [dataParagraph],
        },
        dataFormatted: {
            title: "",
            vocabs: [],
            grammars: [],
            scenes: [],
        },
        timeOffset: 0,
    },
    activeSentence: 0,
    activeSentencePos: 0,
    activeVocab: 0,
    activeVocabPos: 0,
    playMode: 0, // 0:article, 1:vocabs
    processings: [], // 0:Video, 1:Upload TTS, 2:Upload Vocabulary Image, 3:Audio/Index
};

const slice = createSlice({
    name: "project",
    initialState,
    reducers: {
        updateName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        updateProcessings: (state, action: PayloadAction<PayloadProject>) => {
            if (action.payload.buttonID !== undefined && action.payload.buttonStatus !== undefined) {
                state.processings[action.payload.buttonID] = action.payload.buttonStatus;
            }
        },
        updateActiveSentence: (state, action: PayloadAction<number>) => {
            state.activeSentence = action.payload;
        },
        updateActiveSentencePos: (state, action: PayloadAction<number>) => {
            state.activeSentencePos = action.payload;
        },
        updateActiveVocab: (state, action: PayloadAction<number>) => {
            state.activeVocab = action.payload;
        },
        updateActiveVocabPos: (state, action: PayloadAction<number>) => {
            state.activeVocabPos = action.payload;
        },
        updatePlayMode: (state, action: PayloadAction<number>) => {
            state.playMode = action.payload;
        },
        updateVideoURL: (state, action: PayloadAction<string>) => {
            state.videoURL = action.payload;
        },
        updateVideoCompressedURL: (state, action: PayloadAction<string>) => {
            state.videoCompressedURL = action.payload;
        },
        updateScriptData: (state, action: PayloadAction<DataScript>) => {
            state.script.data = action.payload;
            state.script.dataFormatted = fnGetFormattedData(state.script.data);
        },
        updateScriptTitle: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, title: action.payload.text };
                state.script.dataFormatted = fnGetFormattedData(state.script.data);
            }
        },
        updateScriptRoles: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, roles: action.payload.text ? action.payload.text.split("/") : [] };
                state.script.dataFormatted = fnGetFormattedData(state.script.data);
            }
        },
        updateScriptScenes: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, scenes: action.payload.text ? action.payload.text.split("/") : [] };
                state.script.dataFormatted = fnGetFormattedData(state.script.data);
            }
        },
        updateScriptVocabs: (state, action: PayloadAction<DataVocab>) => {
            if (action.payload.text !== undefined) {
                state.script.data.vocabs.unshift(action.payload);
                state.script.data = { ...state.script.data, vocabs: state.script.data.vocabs };
                state.script.dataFormatted = fnGetFormattedData(state.script.data);
            }
        },
        updateScriptVocabsByDelete: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const curVocab = state.script.data.vocabs[action.payload.pKey];
                if (curVocab !== undefined) {
                    const a = state.script.data.vocabs.slice(0, action.payload.pKey);
                    const b = state.script.data.vocabs.slice(action.payload.pKey + 1);
                    const newVocabs = [...a, ...b];
                    state.script.data = { ...state.script.data, vocabs: newVocabs };
                    state.script.dataFormatted = fnGetFormattedData(state.script.data);
                }
            }
        },
        updateScriptGrammars: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, grammars: action.payload.text ? action.payload.text.split("\n---\n") : [] };
                state.script.dataFormatted = fnGetFormattedData(state.script.data);
            }
        },
        updateScriptParagraphsByInsert: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const a = state.script.data.paragraphs.slice(0, action.payload.pKey + 1);
                a.push(dataParagraph);
                const b = state.script.data.paragraphs.slice(action.payload.pKey + 1);
                const newParagraphs = [...a, ...b].map((v, k) => {
                    return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                });
                state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                state.script.dataFormatted = fnGetFormattedData(state.script.data);
            }
        },
        updateScriptParagraphsByDelete: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (state.script.data.paragraphs.length > 1) {
                        const a = state.script.data.paragraphs.slice(0, action.payload.pKey);
                        const b = state.script.data.paragraphs.slice(action.payload.pKey + 1);
                        const newParagraphs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                        state.script.dataFormatted = fnGetFormattedData(state.script.data);
                    }
                }
            }
        },
        updateScriptParagraphsByCut: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const curParagraphSentences = curParagraph.sentences.slice(0, action.payload.sKey);
                        const newParagraphSentences = curParagraph.sentences.slice(action.payload.sKey);
                        curParagraph.sentences = curParagraphSentences;
                        const a = state.script.data.paragraphs.slice(0, action.payload.pKey + 1);
                        a.push({ ...dataParagraph, sentences: newParagraphSentences });
                        const b = state.script.data.paragraphs.slice(action.payload.pKey + 1);
                        const newParagraphs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                        state.script.dataFormatted = fnGetFormattedData(state.script.data);
                    }
                }
            }
        },
        updateScriptParagraphsByInsertSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const a = curParagraph.sentences.slice(0, action.payload.sKey + 1);
                    a.push(dataSentence);
                    const b = curParagraph.sentences.slice(action.payload.sKey + 1);
                    curParagraph.sentences = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagraph.key}-${k}` }));
                    state.script.dataFormatted = fnGetFormattedData(state.script.data);
                }
            }
        },
        updateScriptParagraphsByDeleteSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const a = curParagraph.sentences.slice(0, action.payload.sKey);
                        const b = curParagraph.sentences.slice(action.payload.sKey);
                        b.shift();
                        curParagraph.sentences = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagraph.key}-${k}` }));
                        state.script.dataFormatted = fnGetFormattedData(state.script.data);
                    }
                }
            }
        },
        updateScriptParagraphRole: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const match = action.payload.text ? action.payload.text.match(/@[^@]+/g) : null;
                    const res = match !== null ? match.map((v) => v.slice(1)) : [];
                    const newParagraph = { ...curParagraph, roles: res };
                    const newParagraphs = state.script.data.paragraphs.map((v) => {
                        return v.key === newParagraph.key ? newParagraph : v;
                    });
                    state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                    state.script.dataFormatted = fnGetFormattedData(state.script.data);
                }
            }
        },
        updateScriptParagraphScene: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const newParagraph = { ...curParagraph, scene: action.payload.text };
                    const newParagraphs = state.script.data.paragraphs.map((v) => {
                        return v.key === newParagraph.key ? newParagraph : v;
                    });
                    state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                    state.script.dataFormatted = fnGetFormattedData(state.script.data);
                }
            }
        },
        updateScriptSentenceText: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[action.payload.sKey];
                    if (curSentence !== undefined) {
                        if (action.payload.text !== curSentence?.texts.join("\n---\n")) {
                            curParagraph.sentences = curParagraph.sentences.map((v) => {
                                return v.key == curSentence.key ? { ...curSentence, texts: action.payload.text ? action.payload.text.split("\n---\n") : [] } : v;
                            });
                            const newParagraphs = state.script.data.paragraphs.map((v) => {
                                return v.key == curParagraph.key ? curParagraph : v;
                            });
                            state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                            state.script.dataFormatted = fnGetFormattedData(state.script.data);
                        }
                    }
                }
            }
        },
        updateScriptSentenceTime: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[action.payload.sKey];
                    if (curSentence !== undefined) {
                        if (fnIsSRTTime(action.payload.text)) {
                            if (action.payload.type === 0) {
                                if (action.payload.text !== curSentence.startTime) {
                                    if ((curSentence.endTime && fnSRTTimeToFloat(action.payload.text) < fnSRTTimeToFloat(curSentence.endTime)) || !curSentence.endTime) {
                                        curParagraph.sentences = curParagraph.sentences.map((v) => {
                                            return v.key == curSentence.key ? { ...curSentence, startTime: action.payload.text ? action.payload.text : "" } : v;
                                        });
                                        const newParagraphs = state.script.data.paragraphs.map((v) => {
                                            return v.key == curParagraph.key ? curParagraph : v;
                                        });
                                        state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                                        state.script.dataFormatted = fnGetFormattedData(state.script.data);
                                    }
                                }
                            }
                            if (action.payload.type === 1) {
                                if (action.payload.text !== curSentence.endTime) {
                                    if ((curSentence.startTime && fnSRTTimeToFloat(action.payload.text) > fnSRTTimeToFloat(curSentence.startTime)) || !curSentence.startTime) {
                                        curParagraph.sentences = curParagraph.sentences.map((v) => {
                                            return v.key == curSentence.key ? { ...curSentence, endTime: action.payload.text ? action.payload.text : "" } : v;
                                        });
                                        const newParagraphs = state.script.data.paragraphs.map((v) => {
                                            return v.key == curParagraph.key ? curParagraph : v;
                                        });
                                        state.script.data = { ...state.script.data, paragraphs: newParagraphs };
                                        state.script.dataFormatted = fnGetFormattedData(state.script.data);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        updateScriptTimeOffset: (state, action: PayloadAction<number>) => {
            state.script.timeOffset = action.payload;
        },
    },
});

export const { updateName, updateProcessings, updateActiveSentence, updateActiveSentencePos, updateActiveVocab, updateActiveVocabPos, updatePlayMode, updateVideoURL, updateVideoCompressedURL, updateScriptData, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptVocabs, updateScriptVocabsByDelete, updateScriptGrammars, updateScriptParagraphsByInsert, updateScriptParagraphsByDelete, updateScriptParagraphsByCut, updateScriptParagraphsByInsertSentence, updateScriptParagraphsByDeleteSentence, updateScriptParagraphRole, updateScriptParagraphScene, updateScriptSentenceText, updateScriptSentenceTime, updateScriptTimeOffset } = slice.actions;

export default slice.reducer;
