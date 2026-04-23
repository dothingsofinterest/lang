import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vocab as DataVocab } from "../../types/Data";

type initialState = {
    videoScriptCurrentTime: number;
    videoScriptWaveformZoom: number;
    videoMatchingSentence: number;
    videoMatchingSentencePos: number;
    videoExampleRecognMatching: number;
    videoExampleTranslationMatching: number;
    vocabListenCur: DataVocab | null;
    vocabListenCurIndex: number;
    vocabMatchMeaning: number;
    vocabWatchCur: DataVocab | null;
    vocabWatchCurIndex: number;
    loadingUploadVideo: number;
    loadingImportData: number;
    loadingVideoScriptIndexWaver: number;

    readSentenceIndex: number;
    readVideoCurrentTime: number;
};

const initialState: initialState = {
    videoScriptCurrentTime: 0,
    videoScriptWaveformZoom: 0,
    videoMatchingSentence: 0,
    videoMatchingSentencePos: 0,
    videoExampleRecognMatching: 0,
    videoExampleTranslationMatching: 0,
    vocabListenCur: null,
    vocabListenCurIndex: 0,
    vocabMatchMeaning: 0,
    vocabWatchCur: null,
    vocabWatchCurIndex: 0,
    loadingUploadVideo: 0,
    loadingImportData: 0,
    loadingVideoScriptIndexWaver: 0,

    readSentenceIndex: 0,
    readVideoCurrentTime: 0,
};

const slice = createSlice({
    name: "status",
    initialState,
    reducers: {
        updateVideoMatchingSentence: (state, action: PayloadAction<number>) => {
            state.videoMatchingSentence = action.payload;
        },
        updateVideoMatchingSentencePos: (state, action: PayloadAction<number>) => {
            state.videoMatchingSentencePos = action.payload;
        },
        updateVideoExampleRecognMatching: (state, action: PayloadAction<number>) => {
            state.videoExampleRecognMatching = action.payload;
        },
        updateVideoExampleTranslationMatching: (state, action: PayloadAction<number>) => {
            state.videoExampleTranslationMatching = action.payload;
        },
        updateVideoScriptCurrentTime: (state, action: PayloadAction<number>) => {
            state.videoScriptCurrentTime = action.payload;
        },
        updateVideoScriptWaveformZoom: (state, action: PayloadAction<number>) => {
            state.videoScriptWaveformZoom = action.payload;
        },
        updateVocabListenCur: (state, action: PayloadAction<DataVocab>) => {
            state.vocabListenCur = action.payload;
        },
        updateVocabListenCurIndex: (state, action: PayloadAction<number>) => {
            state.vocabListenCurIndex = action.payload;
        },
        updateVocabMatchMeaning: (state, action: PayloadAction<number>) => {
            state.vocabMatchMeaning = action.payload;
        },
        updateVocabWatchCur: (state, action: PayloadAction<DataVocab>) => {
            state.vocabWatchCur = action.payload;
        },
        updateVocabWatchCurIndex: (state, action: PayloadAction<number>) => {
            state.vocabWatchCurIndex = action.payload;
        },
        updateLoadingUploadVideo: (state, action: PayloadAction<number>) => {
            state.loadingUploadVideo = action.payload;
        },
        updateLoadingImportData: (state, action: PayloadAction<number>) => {
            state.loadingImportData = action.payload;
        },
        updateLoadingVideoScriptIndexWaver: (state, action: PayloadAction<number>) => {
            state.loadingVideoScriptIndexWaver = action.payload;
        },
        updateReadSentenceIndex: (state, action: PayloadAction<number>) => {
            state.readSentenceIndex = action.payload;
        },
        updateReadVideoCurrentTime: (state, action: PayloadAction<number>) => {
            state.readVideoCurrentTime = action.payload;
        },
    },
});

export const { updateReadSentenceIndex, updateReadVideoCurrentTime, updateVideoMatchingSentence, updateVideoMatchingSentencePos, updateVideoExampleRecognMatching, updateVideoExampleTranslationMatching, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom, updateVocabListenCur, updateVocabListenCurIndex, updateVocabMatchMeaning, updateVocabWatchCur, updateVocabWatchCurIndex, updateLoadingUploadVideo, updateLoadingImportData, updateLoadingVideoScriptIndexWaver } = slice.actions;

export default slice.reducer;
