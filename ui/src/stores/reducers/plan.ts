import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StatePlan, PayloadPlan, Paragraph } from "../../types/Data";
import { Script as DataScript, Diary as DataDiary, PayloadScript, Vocab as DataVocab, Scene as DataScene, AudioClip as DataAudioClip } from "../../types/Data";
import { fnGetFormattedData, fnSyncScript } from "../../utils/script";
import { fnGetFormattedData as fnGetFormattedDataDiary, fnSyncDiary } from "../../utils/diary";

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
    videoAudioClipsMatching: 0,
    vocabMatchListen: 0,
    vocabMatchMeaning: 0,
    vocabMatchWatch: 0,
    processings: [], // 0:Video, 1:Upload TTS, 2:Upload Vocabulary Image, 3:Audio/Index, 4:Create Waver Button
    script: {
        title: "",
        roles: [],
        scenes: [],
        audioClips: [],
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
        audioClips: [],
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
        updateVideoAudioClipsMatching: (state, action: PayloadAction<number>) => {
            state.videoAudioClipsMatching = action.payload;
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
        updateScriptAudioClips: (state, action: PayloadAction<DataAudioClip[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, audioClips: action.payload };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
            }
        },
        updateScriptParagraphs: (state, action: PayloadAction<Paragraph[]>) => {
            state.script = { ...state.script, paragraphs: action.payload };
            state.data = fnGetFormattedData(state.hash, state.script);
            fnSyncScript(state.hash, state.script);
        },
        updateScriptVocabs: (state, action: PayloadAction<DataVocab>) => {
            if (action.payload.text !== undefined) {
                state.script.vocabs.unshift(action.payload);
                state.script = { ...state.script, vocabs: state.script.vocabs };
                state.data = fnGetFormattedData(state.hash, state.script);
                fnSyncScript(state.hash, state.script);
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
                    fnSyncScript(state.hash, state.script);
                }
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

export const { updateHash, updateType, updateProcessings, updateVideoMatchingSentence, updateVideoMatchingSentencePos, updateVideoTranslateMatchingSentence, updateVideoTranslateMatchingSentencePos, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom, updateVocabMatchListen, updateVideoAudioClipsMatching, updateVocabMatchMeaning, updateVocabMatchWatch, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScriptData, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptAudioClips, updateScriptVocabs, updateScriptVocabsByDelete, updateScriptGrammars, updateScriptParagraphs, updateDiaryData, updateDiaryTitle, updateDiaryDate, updateDiaryContent, updateDiaryVocabs, updateDiaryVocabsByDelete, updateDiaryGrammars } = slice.actions;

export default slice.reducer;
