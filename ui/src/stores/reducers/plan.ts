import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StatePlan, PayloadPlan, Paragraph } from "../../types/Data";
import { Script as DataScript, Diary as DataDiary, PayloadScript, Vocab as DataVocab } from "../../types/Data";
import { fnGetFormattedData, fnSRTTimeToFloat, fnIsSRTTime, fnSyncScript } from "../../utils/script";
import { fnGetFormattedData as fnGetFormattedDataDiary, fnSyncDiary } from "../../utils/diary";

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
    hash: "",
    type: 0,
    videoURL: "",
    videoAudioURL: "",
    videoAudioWaveformURL: "",
    videoScriptCurrentTime: 0,
    videoTranslateMatchingSentence: 0,
    videoTranslateMatchingSentencePos: 0,
    videoScriptWaveformZoom: 0,
    videoMatchingSentence: 0,
    videoMatchingSentencePos: 0,
    vocabMatchListen: 0,
    vocabMatchMeaning: 0,
    vocabMatchWatch: 0,
    processings: [], // 0:Video, 1:Upload TTS, 2:Upload Vocabulary Image, 3:Audio/Index, 4:Create Waver Button
    scriptTimeOffset: 0,
    script: {
        title: "",
        roles: [],
        scenes: [],
        vocabs: [],
        grammars: [],
        paragraphs: [],
    },
    diary: {
        title: "",
        date: "",
        content: "",
        vocabs: [],
        grammars: [],
    },
    data: {
        title: "",
        vocabs: [],
        grammars: [],
        date: "",
        content: "",
        scenes: [],
        sentences: [],
    },
};

const slice = createSlice({
    name: "plan",
    initialState,
    reducers: {
        updateHash: (state, action: PayloadAction<string>) => {
            state.hash = action.payload;
        },
        updateType: (state, action: PayloadAction<number>) => {
            state.type = action.payload;
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
        updateVideoTranslateMatchingSentence: (state, action: PayloadAction<number>) => {
            state.videoTranslateMatchingSentence = action.payload;
        },
        updateVideoTranslateMatchingSentencePos: (state, action: PayloadAction<number>) => {
            state.videoTranslateMatchingSentencePos = action.payload;
        },
        updateVideoScriptCurrentTime: (state, action: PayloadAction<number>) => {
            state.videoScriptCurrentTime = action.payload;
        },
        updateVideoScriptWaveformZoom: (state, action: PayloadAction<number>) => {
            state.videoScriptWaveformZoom = action.payload;
        },
        updateVocabMatchListen: (state, action: PayloadAction<number>) => {
            state.vocabMatchListen = action.payload;
        },
        updateVocabMatchMeaning: (state, action: PayloadAction<number>) => {
            state.vocabMatchMeaning = action.payload;
        },
        updateVocabMatchWatch: (state, action: PayloadAction<number>) => {
            state.vocabMatchWatch = action.payload;
        },
        updateVideoURL: (state, action: PayloadAction<string>) => {
            URL.revokeObjectURL(state.videoURL);
            state.videoURL = action.payload;
        },
        updateVideoAudioURL: (state, action: PayloadAction<string>) => {
            state.videoAudioURL = action.payload;
        },
        updateVideoAudioWaverURL: (state, action: PayloadAction<string>) => {
            state.videoAudioWaveformURL = action.payload;
        },
        updateScriptData: (state, action: PayloadAction<DataScript>) => {
            state.script = action.payload;
            state.data = fnGetFormattedData(state.hash, state.script);
            fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
        },
        updateScriptTitle: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script = { ...state.script, title: action.payload.text };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
            }
        },
        updateScriptRoles: (state, action: PayloadAction<string[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, roles: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
            }
        },
        updateScriptScenes: (state, action: PayloadAction<string[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, scenes: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
            }
        },
        updateScriptVocabs: (state, action: PayloadAction<DataVocab>) => {
            if (action.payload.text !== undefined) {
                state.script.vocabs.unshift(action.payload);
                state.script = { ...state.script, vocabs: state.script.vocabs };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
            }
        },
        updateScriptVocabsByDelete: (state, action: PayloadAction<number>) => {
            if (action.payload !== undefined) {
                const curVocab = state.script.vocabs[action.payload];
                if (curVocab !== undefined) {
                    const a = state.script.vocabs.slice(0, action.payload);
                    const b = state.script.vocabs.slice(action.payload + 1);
                    const newVocabs = [...a, ...b];
                    state.script = { ...state.script, vocabs: newVocabs };
                    state.data = fnGetFormattedData(state.hash, state.script);
                    fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                }
            }
        },
        updateScriptGrammars: (state, action: PayloadAction<string[]>) => {
            if (Array.isArray(action.payload)) {
                state.script = { ...state.script, grammars: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
            }
        },
        updateScriptParagraphs: (state, action: PayloadAction<Paragraph[]>) => {
            state.script = { ...state.script, paragraphs: action.payload };
            state.data = fnGetFormattedData(state.hash, state.script);
            fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
        },
        updateScriptParagraphsByInsert: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const a = state.script.paragraphs.slice(0, action.payload.pKey + 1);
                a.push(dataParagraph);
                const b = state.script.paragraphs.slice(action.payload.pKey + 1);
                const newParagraphs = [...a, ...b].map((v, k) => {
                    return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                });
                state.script = { ...state.script, paragraphs: newParagraphs };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
            }
        },
        updateScriptParagraphsByDelete: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (state.script.paragraphs.length > 1) {
                        const a = state.script.paragraphs.slice(0, action.payload.pKey);
                        const b = state.script.paragraphs.slice(action.payload.pKey + 1);
                        const newParagraphs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.script = { ...state.script, paragraphs: newParagraphs };
                        state.data = fnGetFormattedData(state.hash, state.script);
                        fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                    }
                }
            }
        },
        updateScriptParagraphsByCut: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const curParagraphSentences = curParagraph.sentences.slice(0, action.payload.sKey);
                        const newParagraphSentences = curParagraph.sentences.slice(action.payload.sKey);
                        curParagraph.sentences = curParagraphSentences;
                        const a = state.script.paragraphs.slice(0, action.payload.pKey + 1);
                        a.push({ ...dataParagraph, sentences: newParagraphSentences });
                        const b = state.script.paragraphs.slice(action.payload.pKey + 1);
                        const newParagraphs = [...a, ...b].map((v, k) => {
                            return { ...v, key: `${k}`, sentences: v.sentences.map((vv, kk) => ({ ...vv, key: `${k}-${kk}` })) };
                        });
                        state.script = { ...state.script, paragraphs: newParagraphs };
                        state.data = fnGetFormattedData(state.hash, state.script);
                        fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                    }
                }
            }
        },
        updateScriptParagraphsByInsertSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const a = curParagraph.sentences.slice(0, action.payload.sKey + 1);
                    a.push(dataSentence);
                    const b = curParagraph.sentences.slice(action.payload.sKey + 1);
                    curParagraph.sentences = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagraph.key}-${k}` }));
                    state.data = fnGetFormattedData(state.hash, state.script);
                    fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                }
            }
        },
        updateScriptParagraphsByDeleteSentence: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    if (curParagraph.sentences.length > 1) {
                        const a = curParagraph.sentences.slice(0, action.payload.sKey);
                        const b = curParagraph.sentences.slice(action.payload.sKey);
                        b.shift();
                        curParagraph.sentences = [...a, ...b].map((v, k) => ({ ...v, key: `${curParagraph.key}-${k}` }));
                        state.data = fnGetFormattedData(state.hash, state.script);
                        fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                    }
                }
            }
        },
        updateScriptParagraphRole: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const match = action.payload.text ? action.payload.text.match(/@[^@]+/g) : null;
                    const res = match !== null ? match.map((v) => v.slice(1)) : [];
                    const newParagraph = { ...curParagraph, roles: res };
                    const newParagraphs = state.script.paragraphs.map((v) => {
                        return v.key === newParagraph.key ? newParagraph : v;
                    });
                    state.script = { ...state.script, paragraphs: newParagraphs };
                    state.data = fnGetFormattedData(state.hash, state.script);
                    fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                }
            }
        },
        updateScriptParagraphScene: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const newParagraph = { ...curParagraph, scene: action.payload.text };
                    const newParagraphs = state.script.paragraphs.map((v) => {
                        return v.key === newParagraph.key ? newParagraph : v;
                    });
                    state.script = { ...state.script, paragraphs: newParagraphs };
                    state.data = fnGetFormattedData(state.hash, state.script);
                    fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                }
            }
        },
        updateScriptSentenceText: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
                if (curParagraph !== undefined) {
                    const curSentence = curParagraph.sentences[action.payload.sKey];
                    if (curSentence !== undefined) {
                        if (action.payload.text !== curSentence?.texts.join("\n---\n")) {
                            curParagraph.sentences = curParagraph.sentences.map((v) => {
                                return v.key == curSentence.key ? { ...curSentence, texts: action.payload.text ? action.payload.text.split("\n---\n") : [] } : v;
                            });
                            const newParagraphs = state.script.paragraphs.map((v) => {
                                return v.key == curParagraph.key ? curParagraph : v;
                            });
                            state.script = { ...state.script, paragraphs: newParagraphs };
                            state.data = fnGetFormattedData(state.hash, state.script);
                            fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                        }
                    }
                }
            }
        },
        updateScriptSentenceTime: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.pKey !== undefined && action.payload.sKey !== undefined && action.payload.text !== undefined) {
                const curParagraph = state.script.paragraphs[action.payload.pKey];
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
                                        const newParagraphs = state.script.paragraphs.map((v) => {
                                            return v.key == curParagraph.key ? curParagraph : v;
                                        });
                                        state.script = { ...state.script, paragraphs: newParagraphs };
                                        state.data = fnGetFormattedData(state.hash, state.script);
                                        fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                                    }
                                }
                            }
                            if (action.payload.type === 1) {
                                if (action.payload.text !== curSentence.endTime) {
                                    if ((curSentence.startTime && fnSRTTimeToFloat(action.payload.text) > fnSRTTimeToFloat(curSentence.startTime)) || !curSentence.startTime) {
                                        curParagraph.sentences = curParagraph.sentences.map((v) => {
                                            return v.key == curSentence.key ? { ...curSentence, endTime: action.payload.text ? action.payload.text : "" } : v;
                                        });
                                        const newParagraphs = state.script.paragraphs.map((v) => {
                                            return v.key == curParagraph.key ? curParagraph : v;
                                        });
                                        state.script = { ...state.script, paragraphs: newParagraphs };
                                        state.data = fnGetFormattedData(state.hash, state.script);
                                        fnSyncScript(state.hash, state.script, state.scriptTimeOffset);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        updateScriptTimeOffset: (state, action: PayloadAction<number>) => {
            state.scriptTimeOffset = action.payload;
        },
        updateDiaryData: (state, action: PayloadAction<DataDiary>) => {
            if (action.payload) {
                state.diary = action.payload;
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
            }
        },
        updateDiaryTitle: (state, action: PayloadAction<string>) => {
            if (action.payload !== undefined) {
                state.diary = { ...state.diary, title: action.payload };
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
            }
        },
        updateDiaryDate: (state, action: PayloadAction<string>) => {
            if (action.payload !== undefined) {
                state.diary = { ...state.diary, date: action.payload };
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
            }
        },
        updateDiaryContent: (state, action: PayloadAction<string>) => {
            if (action.payload !== undefined) {
                state.diary = { ...state.diary, content: action.payload };
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
            }
        },
        updateDiaryVocabs: (state, action: PayloadAction<DataVocab>) => {
            if (action.payload.text !== undefined) {
                state.diary.vocabs.unshift(action.payload);
                state.diary = { ...state.diary, vocabs: state.diary.vocabs };
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
            }
        },
        updateDiaryVocabsByDelete: (state, action: PayloadAction<number>) => {
            if (action.payload !== undefined) {
                const curVocab = state.diary.vocabs[action.payload];
                if (curVocab !== undefined) {
                    const a = state.diary.vocabs.slice(0, action.payload);
                    const b = state.diary.vocabs.slice(action.payload + 1);
                    const newVocabs = [...a, ...b];
                    state.diary = { ...state.diary, vocabs: newVocabs };
                    state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                    fnSyncDiary(state.hash, state.diary);
                }
            }
        },
        updateDiaryGrammars: (state, action: PayloadAction<string[]>) => {
            if (Array.isArray(action.payload)) {
                state.diary = { ...state.diary, grammars: action.payload };
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
            }
        },
    },
});

export const { updateHash, updateType, updateProcessings, updateVideoMatchingSentence, updateVideoMatchingSentencePos, updateVideoTranslateMatchingSentence, updateVideoTranslateMatchingSentencePos, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom, updateVocabMatchListen, updateVocabMatchMeaning, updateVocabMatchWatch, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScriptData, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptVocabs, updateScriptVocabsByDelete, updateScriptGrammars, updateScriptParagraphs, updateScriptParagraphsByInsert, updateScriptParagraphsByDelete, updateScriptParagraphsByCut, updateScriptParagraphsByInsertSentence, updateScriptParagraphsByDeleteSentence, updateScriptParagraphRole, updateScriptParagraphScene, updateScriptSentenceText, updateScriptSentenceTime, updateScriptTimeOffset, updateDiaryData, updateDiaryTitle, updateDiaryDate, updateDiaryContent, updateDiaryVocabs, updateDiaryVocabsByDelete, updateDiaryGrammars } = slice.actions;

export default slice.reducer;
