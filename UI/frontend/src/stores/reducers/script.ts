import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Script as DataScript, Script as DataScriptAricle, Scene as DataScene, Paragragh as DataParagragh, PayloadScript, StateScript } from "../../types";
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
    children: [dataSentence],
};
const initialState: StateScript = {
    timeOffset: 0,
    dataArticle: {
        name: "",
        words: [],
        grammers: [],
        scenes: [],
    },
    data: {
        name: "",
        roles: [],
        scenes: [],
        words: [],
        grammers: [],
        paragraghs: [dataParagraph],
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
        updateWords: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, words: action.payload.text ? action.payload.text.split("\n") : [] };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateGrammers: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.data = { ...state.data, grammers: action.payload.text ? action.payload.text.split("\n---\n") : [] };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateParagraphsByInsert: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const a = state.data.paragraghs.slice(0, action.payload.pKey + 1);
                a.push(dataParagraph);
                const b = state.data.paragraghs.slice(action.payload.pKey + 1);
                const newParagraghs = [...a, ...b].map((v, k) => {
                    return { ...v, key: `${k}`, children: v.children.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                });
                state.data = { ...state.data, paragraghs: newParagraghs };
                state.dataArticle = fnGetArticleData(state.data);
            }
        },
        updateParagraphsByDelete: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    if (state.data.paragraghs.length > 1) {
                        const a = state.data.paragraghs.slice(0, action.payload.pKey);
                        const b = state.data.paragraghs.slice(action.payload.pKey + 1);
                        const newParagraghs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, children: v.children.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.data = { ...state.data, paragraghs: newParagraghs };
                        state.dataArticle = fnGetArticleData(state.data);
                    }
                }
            }
        },
        updateParagraphsByCut: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    if (curParagragh.children.length > 1) {
                        const curParagraghChildren = curParagragh.children.slice(0, action.payload.sKey);
                        const newParagraghChildren = curParagragh.children.slice(action.payload.sKey);
                        curParagragh.children = curParagraghChildren;
                        const a = state.data.paragraghs.slice(0, action.payload.pKey + 1);
                        a.push({ ...dataParagraph, children: newParagraghChildren });
                        const b = state.data.paragraghs.slice(action.payload.pKey + 1);
                        const newParagraghs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, children: v.children.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.data = { ...state.data, paragraghs: newParagraghs };
                        state.dataArticle = fnGetArticleData(state.data);
                    }
                }
            }
        },
        updateParagraphsByInsertSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    const a = curParagragh.children.slice(0, action.payload.sKey + 1);
                    a.push(dataSentence);
                    const b = curParagragh.children.slice(action.payload.sKey + 1);
                    curParagragh.children = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagragh.key}-${k}` }));
                    state.dataArticle = fnGetArticleData(state.data);
                }
            }
        },
        updateParagraphsByDeleteSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    if (curParagragh.children.length > 1) {
                        const a = curParagragh.children.slice(0, action.payload.sKey);
                        const b = curParagragh.children.slice(action.payload.sKey);
                        b.shift();
                        curParagragh.children = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagragh.key}-${k}` }));
                        state.dataArticle = fnGetArticleData(state.data);
                    }
                }
            }
        },
        updateParagraphRole: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    const match = action.payload.text ? action.payload.text.match(/@[^@]+/g) : null;
                    const res = match !== null ? match.map((v) => v.slice(1)) : [];
                    const newParagragh = { ...curParagragh, roles: res };
                    const newParagraghs = state.data.paragraghs.map((v) => {
                        return v.key === newParagragh.key ? newParagragh : v;
                    });
                    state.data = { ...state.data, paragraghs: newParagraghs };
                    state.dataArticle = fnGetArticleData(state.data);
                }
            }
        },
        updateParagraphScene: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    const newParagragh = { ...curParagragh, scene: action.payload.text };
                    const newParagraghs = state.data.paragraghs.map((v) => {
                        return v.key === newParagragh.key ? newParagragh : v;
                    });
                    state.data = { ...state.data, paragraghs: newParagraghs };
                    state.dataArticle = fnGetArticleData(state.data);
                }
            }
        },
        updateSentenceText: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    const curSentence = curParagragh.children[action.payload.sKey];
                    if (curSentence !== undefined) {
                        if (action.payload.text !== curSentence?.texts.join("\n---\n")) {
                            curParagragh.children = curParagragh.children.map((v) => {
                                return v.key == curSentence.key ? { ...curSentence, texts: action.payload.text ? action.payload.text.split("\n---\n") : [] } : v;
                            });
                            const newParagraghs = state.data.paragraghs.map((v) => {
                                return v.key == curParagragh.key ? curParagragh : v;
                            });
                            state.data = { ...state.data, paragraghs: newParagraghs };
                            state.dataArticle = fnGetArticleData(state.data);
                        }
                    }
                }
            }
        },
        updateSentenceTime: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagragh = state.data.paragraghs[action.payload.pKey];
                if (curParagragh !== undefined) {
                    const curSentence = curParagragh.children[action.payload.sKey];
                    if (curSentence !== undefined) {
                        if (fnIsSRTTime(action.payload.text)) {
                            if (action.payload.type === 0) {
                                if (action.payload.text !== curSentence.startTime) {
                                    if ((curSentence.endTime && fnSRTTimeToFloat(action.payload.text) < fnSRTTimeToFloat(curSentence.endTime)) || !curSentence.endTime) {
                                        curParagragh.children = curParagragh.children.map((v) => {
                                            return v.key == curSentence.key ? { ...curSentence, startTime: action.payload.text ? action.payload.text : "" } : v;
                                        });
                                        const newParagraghs = state.data.paragraghs.map((v) => {
                                            return v.key == curParagragh.key ? curParagragh : v;
                                        });
                                        state.data = { ...state.data, paragraghs: newParagraghs };
                                        state.dataArticle = fnGetArticleData(state.data);
                                    }
                                }
                            }
                            if (action.payload.type === 1) {
                                if (action.payload.text !== curSentence.endTime) {
                                    if ((curSentence.startTime && fnSRTTimeToFloat(action.payload.text) > fnSRTTimeToFloat(curSentence.startTime)) || !curSentence.startTime) {
                                        curParagragh.children = curParagragh.children.map((v) => {
                                            return v.key == curSentence.key ? { ...curSentence, endTime: action.payload.text ? action.payload.text : "" } : v;
                                        });
                                        const newParagraghs = state.data.paragraghs.map((v) => {
                                            return v.key == curParagragh.key ? curParagragh : v;
                                        });
                                        state.data = { ...state.data, paragraghs: newParagraghs };
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
    },
});

export const { updateData, updateParagraphsByInsert, updateParagraphsByDelete, updateParagraphsByCut, updateParagraphsByInsertSentence, updateParagraphsByDeleteSentence, updateName, updateRoles, updateScenes, updateWords, updateGrammers, updateParagraphScene, updateParagraphRole, updateTimeOffset, updateSentenceText, updateSentenceTime } = slice.actions;

export default slice.reducer;
