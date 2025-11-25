import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StatePlan, PayloadPlan, Paragraph } from "../../types/Data";
import { Script as DataScript, PayloadScript, Vocab as DataVocab } from "../../types/Data";
import { fnGetFormattedData, fnSRTTimeToFloat, fnIsSRTTime, fnSyncScript } from "../../utils/script";

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

const initialState: StatePlan = {
    videoHash: "",
    videoURL: "",
    videoAudioWaveformURL: "",
    scriptCurrentTime: 0,
    scriptWaveformZoom: 0,
    listenMatchingVocab: 0,
    meaningMatchingVocab: 0,
    videoMatchingSentence: 0,
    videoMatchingSentencePos: 0,
    translateMatchingSentence: 0,
    translateMatchingSentencePos: 0,
    processings: [], // 0:Video, 1:Upload TTS, 2:Upload Vocabulary Image, 3:Audio/Index, 4:Create Waver Button
    script: {
        data: {
            title: "",
            roles: [],
            scenes: [],
            vocabs: [],
            grammars: [],
            paragraphs: [],
        },
        dataFormatted: {
            title: "",
            vocabs: [],
            grammars: [],
            scenes: [],
            sentences: [],
        },
        timeOffset: 0,
    },
};

const slice = createSlice({
    name: "plan",
    initialState,
    reducers: {
        updateVideoHash: (state, action: PayloadAction<string>) => {
            state.videoHash = action.payload;
        },
        updateProcessings: (state, action: PayloadAction<PayloadPlan>) => {
            if (action.payload.buttonID !== undefined && action.payload.buttonStatus !== undefined) {
                state.processings[action.payload.buttonID] = action.payload.buttonStatus;
            }
        },
        updateVideoMatchingSentence: (state, action: PayloadAction<number>) => {
            state.videoMatchingSentence = action.payload;
        },
        updateVideoMatchingSentencePos: (state, action: PayloadAction<number>) => {
            state.videoMatchingSentencePos = action.payload;
        },
        updateTranslateMatchingSentence: (state, action: PayloadAction<number>) => {
            state.translateMatchingSentence = action.payload;
        },
        updateTranslateMatchingSentencePos: (state, action: PayloadAction<number>) => {
            state.translateMatchingSentencePos = action.payload;
        },
        updateScriptCurrentTime: (state, action: PayloadAction<number>) => {
            state.scriptCurrentTime = action.payload;
        },
        updateScriptWaveformZoom: (state, action: PayloadAction<number>) => {
            state.scriptWaveformZoom = action.payload;
        },
        updateListenMatchingVocab: (state, action: PayloadAction<number>) => {
            state.listenMatchingVocab = action.payload;
        },
        updateMeaningMatchingVocab: (state, action: PayloadAction<number>) => {
            state.meaningMatchingVocab = action.payload;
        },
        updateVideoURL: (state, action: PayloadAction<string>) => {
            URL.revokeObjectURL(state.videoURL);
            state.videoURL = action.payload;
        },
        updateVideoAudioWaverURL: (state, action: PayloadAction<string>) => {
            state.videoAudioWaveformURL = action.payload;
        },
        updateScriptData: (state, action: PayloadAction<DataScript>) => {
            state.script.data = action.payload;
            state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
            fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
        },
        updateScriptTitle: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, title: action.payload.text };
                state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
            }
        },
        updateScriptRoles: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, roles: action.payload.text ? action.payload.text.split("/") : [] };
                state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
            }
        },
        updateScriptScenes: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, scenes: action.payload.text ? action.payload.text.split("/") : [] };
                state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
            }
        },
        updateScriptVocabs: (state, action: PayloadAction<DataVocab>) => {
            if (action.payload.text !== undefined) {
                state.script.data.vocabs.unshift(action.payload);
                state.script.data = { ...state.script.data, vocabs: state.script.data.vocabs };
                state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                    state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                    fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
                }
            }
        },
        updateScriptGrammars: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script.data = { ...state.script.data, grammars: action.payload.text ? action.payload.text.split("\n---\n") : [] };
                state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
            }
        },
        updateScriptParagraphs: (state, action: PayloadAction<Paragraph[]>) => {
            state.script.data = { ...state.script.data, paragraphs: action.payload };
            state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
            fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                        state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                        fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                        state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                        fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                    state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                    fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                        state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                        fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                    state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                    fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                    state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                    fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                            state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                            fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                                        state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                                        fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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
                                        state.script.dataFormatted = fnGetFormattedData(state.videoHash, state.script.data);
                                        fnSyncScript(state.videoHash, state.script.data, state.script.timeOffset);
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

export const { updateVideoHash, updateProcessings, updateVideoMatchingSentence, updateVideoMatchingSentencePos, updateTranslateMatchingSentence, updateTranslateMatchingSentencePos, updateScriptCurrentTime, updateScriptWaveformZoom, updateListenMatchingVocab, updateMeaningMatchingVocab, updateVideoURL, updateVideoAudioWaverURL, updateScriptData, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptVocabs, updateScriptVocabsByDelete, updateScriptGrammars, updateScriptParagraphs, updateScriptParagraphsByInsert, updateScriptParagraphsByDelete, updateScriptParagraphsByCut, updateScriptParagraphsByInsertSentence, updateScriptParagraphsByDeleteSentence, updateScriptParagraphRole, updateScriptParagraphScene, updateScriptSentenceText, updateScriptSentenceTime, updateScriptTimeOffset } = slice.actions;

export default slice.reducer;
