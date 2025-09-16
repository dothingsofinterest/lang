import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Script as DataScript, Script as DataScriptAricle, Scene as DataScene, Paragraph as DataParagraph, PayloadScript, StateScript, AssFormat } from "../../types/Data";
import { fnGetArticleData, fnSRTTimeToFloat, fnIsSRTTime } from "../../utils/script";

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
const dataAssFormat = {
    enFontSize: 8,
    enFontColor: "H00FFFFFF",
    enFontColorInline: "H3517DC",
    enFontOutlineWidth: 6,
    enFontOutlineColor: "H00000000",
    enAlignment: 2,
    enMarginLR: 4,
    enMarginV: 40,
    cnFontSize: 6,
    cnFontColor: "H00FFFFFF",
    cnFontColorInline: "H3517DC",
    cnFontOutlineWidth: 6,
    cnFontOutlineColor: "H00000000",
    cnAlignment: 8,
    cnMarginLR: 4,
    cnMarginV: 40,
    cnLineBreak: 20,
};
const initialState: StateScript = {
    timeOffset: 0,
    dataArticle: {
        name: "",
        vocabs: [],
        notes: [],
        scenes: [],
    },
    data: {
        name: "",
        roles: [],
        scenes: [],
        vocabs: [],
        notes: [],
        paragraphs: [dataParagraph],
        assFormat: dataAssFormat,
    },
};

const slice = createSlice({
    name: "script",
    initialState,
    reducers: {
        updateData: (state, action: PayloadAction<DataScript>) => {
            state.data = action.payload;
            state.dataArticle = fnGetArticleData(state.data);
        },
        updateName: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, name: action.payload.text };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateRoles: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, roles: action.payload.text ? action.payload.text.split("/") : [] };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateScenes: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, scenes: action.payload.text ? action.payload.text.split("/") : [] };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateVocabs: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, vocabs: action.payload.text ? action.payload.text.split("\n") : [] };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateNotes: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, notes: action.payload.text ? action.payload.text.split("\n---\n") : [] };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateParagraphsByInsert: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const a = state.data.paragraphs.slice(0, action.payload.pKey + 1);
                a.push(dataParagraph);
                const b = state.data.paragraphs.slice(action.payload.pKey + 1);
                const newParagraphs = [...a, ...b].map((v, k) => {
                    return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                });
                state.data = { ...state.data, paragraphs: newParagraphs };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateParagraphsByDelete: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (state.data.paragraphs.length > 1) {
                        const a = state.data.paragraphs.slice(0, action.payload.pKey);
                        const b = state.data.paragraphs.slice(action.payload.pKey + 1);
                        const newParagraphs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.data = { ...state.data, paragraphs: newParagraphs };
                        state.dataArticle = fnGetArticleData(state.data);
                    }
                }
            }
        },
        updateParagraphsByCut: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const curParagraphSentences = curParagraph.sentences.slice(0, action.payload.sKey);
                        const newParagraphSentences = curParagraph.sentences.slice(action.payload.sKey);
                        curParagraph.sentences = curParagraphSentences;
                        const a = state.data.paragraphs.slice(0, action.payload.pKey + 1);
                        a.push({ ...dataParagraph, sentences: newParagraphSentences });
                        const b = state.data.paragraphs.slice(action.payload.pKey + 1);
                        const newParagraphs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.data = { ...state.data, paragraphs: newParagraphs };
                        state.dataArticle = fnGetArticleData(state.data);
                    }
                }
            }
        },
        updateParagraphsByInsertSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const a = curParagraph.sentences.slice(0, action.payload.sKey + 1);
                    a.push(dataSentence);
                    const b = curParagraph.sentences.slice(action.payload.sKey + 1);
                    curParagraph.sentences = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagraph.key}-${k}` }));
                    state.dataArticle = fnGetArticleData(state.data);
                }
            }
        },
        updateParagraphsByDeleteSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const a = curParagraph.sentences.slice(0, action.payload.sKey);
                        const b = curParagraph.sentences.slice(action.payload.sKey);
                        b.shift();
                        curParagraph.sentences = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagraph.key}-${k}` }));
                        state.dataArticle = fnGetArticleData(state.data);
                    }
                }
            }
        },
        updateParagraphRole: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const match = action.payload.text ? action.payload.text.match(/@[^@]+/g) : null;
                    const res = match !== null ? match.map((v) => v.slice(1)) : [];
                    const newParagraph = { ...curParagraph, roles: res };
                    const newParagraphs = state.data.paragraphs.map((v) => {
                        return v.key === newParagraph.key ? newParagraph : v;
                    });
                    state.data = { ...state.data, paragraphs: newParagraphs };
                    state.dataArticle = fnGetArticleData(state.data);
                }
            }
        },
        updateParagraphScene: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const newParagraph = { ...curParagraph, scene: action.payload.text };
                    const newParagraphs = state.data.paragraphs.map((v) => {
                        return v.key === newParagraph.key ? newParagraph : v;
                    });
                    state.data = { ...state.data, paragraphs: newParagraphs };
                    state.dataArticle = fnGetArticleData(state.data);
                }
            }
        },
        updateSentenceText: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[action.payload.sKey];
                    if (curSentence !== undefined) {
                        if (action.payload.text !== curSentence?.texts.join("\n---\n")) {
                            curParagraph.sentences = curParagraph.sentences.map((v) => {
                                return v.key == curSentence.key ? { ...curSentence, texts: action.payload.text ? action.payload.text.split("\n---\n") : [] } : v;
                            });
                            const newParagraphs = state.data.paragraphs.map((v) => {
                                return v.key == curParagraph.key ? curParagraph : v;
                            });
                            state.data = { ...state.data, paragraphs: newParagraphs };
                            state.dataArticle = fnGetArticleData(state.data);
                        }
                    }
                }
            }
        },
        updateSentenceTime: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.data.paragraphs[action.payload.pKey];
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
                                        const newParagraphs = state.data.paragraphs.map((v) => {
                                            return v.key == curParagraph.key ? curParagraph : v;
                                        });
                                        state.data = { ...state.data, paragraphs: newParagraphs };
                                        state.dataArticle = fnGetArticleData(state.data);
                                    }
                                }
                            }
                            if (action.payload.type === 1) {
                                if (action.payload.text !== curSentence.endTime) {
                                    if ((curSentence.startTime && fnSRTTimeToFloat(action.payload.text) > fnSRTTimeToFloat(curSentence.startTime)) || !curSentence.startTime) {
                                        curParagraph.sentences = curParagraph.sentences.map((v) => {
                                            return v.key == curSentence.key ? { ...curSentence, endTime: action.payload.text ? action.payload.text : "" } : v;
                                        });
                                        const newParagraphs = state.data.paragraphs.map((v) => {
                                            return v.key == curParagraph.key ? curParagraph : v;
                                        });
                                        state.data = { ...state.data, paragraphs: newParagraphs };
                                        state.dataArticle = fnGetArticleData(state.data);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        updateTimeOffset: (state, action: PayloadAction<number>) => {
            state.timeOffset = action.payload;
        },
        updateAssFormat: (state, action: PayloadAction<AssFormat>) => {
            state.data.assFormat = action.payload;
        },
    },
});

export const { updateData, updateParagraphsByInsert, updateParagraphsByDelete, updateParagraphsByCut, updateParagraphsByInsertSentence, updateParagraphsByDeleteSentence, updateName, updateRoles, updateScenes, updateVocabs, updateNotes, updateParagraphScene, updateParagraphRole, updateTimeOffset, updateSentenceText, updateSentenceTime, updateAssFormat } = slice.actions;

export default slice.reducer;
