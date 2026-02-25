import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StatePlan, PayloadPlan, Paragraph } from "../../types/Data";
import { Script as DataScript, Diary as DataDiary, PayloadScript, Vocab as DataVocab, Scene as DataScene, Example as DataExample } from "../../types/Data";
import { fnGetFormattedData, fnSyncScript } from "../../utils/script";
import { fnGetFormattedData as fnGetFormattedDataDiary, fnSyncDiary } from "../../utils/diary";

const initialState: StatePlan = {
    hash: "",
    type: 0,
    videoURL: "",
    videoAudioURL: "",
    videoAudioWaveformURL: "",
    videoScriptCurrentTime: 0,
    videoScriptWaveformZoom: 0,
    videoMatchingSentence: 0,
    videoMatchingSentencePos: 0,
    videoExampleMatching: 0,
    vocabMatchListen: 0,
    vocabMatchMeaning: 0,
    vocabMatchWatch: 0,
    processings: [], // 0:Video, 1:Upload TTS, 2:Upload Vocabulary Image, 3:Audio/Index, 4:Create Waver Button
    script: {
        title: "",
        roles: [],
        scenes: [],
        vocabs: [],
        grammars: [],
        paragraphs: [
            {
                key: `0`,
                scene: ``,
                roles: [],
                sentences: [
                    {
                        key: "0-0",
                        startTime: "",
                        endTime: "",
                        texts: [],
                        linkings: [],
                    },
                ],
            },
        ],
        examples: [],
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
        examples: [],
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
        updateVideoExampleMatching: (state, action: PayloadAction<number>) => {
            state.videoExampleMatching = action.payload;
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
            fnSyncScript(state.hash, state.script);
        },
        updateScriptTitle: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script = { ...state.script, title: action.payload.text };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
        },
        updateScriptRoles: (state, action: PayloadAction<string[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, roles: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
        },
        updateScriptScenes: (state, action: PayloadAction<DataScene[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, scenes: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
        },
        updateScriptExamples: (state, action: PayloadAction<DataExample[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, examples: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
        },
        updateScriptParagraphs: (state, action: PayloadAction<Paragraph[]>) => {
            state.script = { ...state.script, paragraphs: action.payload };
            state.data = fnGetFormattedData(state.hash, state.script);
            fnSyncScript(state.hash, state.script);
        },
        updateScriptVocabs: (state, action: PayloadAction<DataVocab[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, vocabs: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
        },
        updateScriptGrammars: (state, action: PayloadAction<string[]>) => {
            if (Array.isArray(action.payload)) {
                state.script = { ...state.script, grammars: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
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
        updateDiaryVocabs: (state, action: PayloadAction<DataVocab[]>) => {
            if (action.payload !== undefined) {
                state.diary = { ...state.diary, vocabs: action.payload };
                state.data = fnGetFormattedDataDiary(state.hash, state.diary);
                fnSyncDiary(state.hash, state.diary);
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

export const { updateHash, updateType, updateProcessings, updateVideoMatchingSentence, updateVideoMatchingSentencePos, updateVideoExampleMatching, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom, updateVocabMatchListen, updateVocabMatchMeaning, updateVocabMatchWatch, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScriptData, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptExamples, updateScriptVocabs, updateScriptGrammars, updateScriptParagraphs, updateDiaryData, updateDiaryTitle, updateDiaryDate, updateDiaryContent, updateDiaryVocabs, updateDiaryGrammars } = slice.actions;

export default slice.reducer;
