import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vocabulary } from "../../types/Data";

type initialState = {
    catalogFolding: boolean;
    videoScriptWaveformZoom: number;
    videoMatchingSentence: number;
    videoMatchingSentencePos: number;
    videoExampleRecognMatching: number;
    videoExampleTranslationMatching: number;
    loadingUploadVideo: number;
    loadingImportData: number;
    loadingVideoScriptIndexWaver: number;
    scriptVideoCurrentTime: number;
    vocabMeaningCur: Vocabulary | null;
    vocabMeaningCurIndex: number;
    vocabListenCur: Vocabulary | null;
    vocabListenCurIndex: number;
    exampleCur: any | null;
    exampleCurIndex: number;
    listenCurSentenceId: number;
    readCurSentence: any;
    readCurSentenceIndex: number;
    readVideoCurrentTime: number;
    readScrollPos: number;
};

const initialState: initialState = {
    catalogFolding: false,
    videoScriptWaveformZoom: 0,
    videoMatchingSentence: 0,
    videoMatchingSentencePos: 0,
    videoExampleRecognMatching: 0,
    videoExampleTranslationMatching: 0,
    loadingUploadVideo: 0,
    loadingImportData: 0,
    loadingVideoScriptIndexWaver: 0,
    scriptVideoCurrentTime: 0,
    vocabMeaningCur: null,
    vocabMeaningCurIndex: 0,
    vocabListenCur: null,
    vocabListenCurIndex: 0,
    exampleCur: null,
    exampleCurIndex: 0,
    listenCurSentenceId: 0,
    readCurSentence: null,
    readCurSentenceIndex: 0,
    readVideoCurrentTime: 0,
    readScrollPos: 0,
};

const slice = createSlice({
    name: "status",
    initialState,
    reducers: {
        updateCatalogFolding: (state, action: PayloadAction<boolean>) => {
            state.catalogFolding = action.payload;
        },
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
        updateScriptVideoCurrentTime: (state, action: PayloadAction<number>) => {
            state.scriptVideoCurrentTime = action.payload;
        },
        updateVideoScriptWaveformZoom: (state, action: PayloadAction<number>) => {
            state.videoScriptWaveformZoom = action.payload;
        },
        updateVocabListenCur: (state, action: PayloadAction<Vocabulary | null>) => {
            state.vocabListenCur = action.payload;
        },
        updateVocabListenCurIndex: (state, action: PayloadAction<number>) => {
            state.vocabListenCurIndex = action.payload;
        },
        updateExampleCur: (state, action: PayloadAction<any>) => {
            state.exampleCur = action.payload;
        },
        updateExampleCurIndex: (state, action: PayloadAction<number>) => {
            state.exampleCurIndex = action.payload;
        },
        updateVocabMeaningCur: (state, action: PayloadAction<Vocabulary | null>) => {
            state.vocabMeaningCur = action.payload;
        },
        updateVocabMeaningCurIndex: (state, action: PayloadAction<number>) => {
            state.vocabMeaningCurIndex = action.payload;
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
        updateListenCurSentence: (state, action: PayloadAction<number>) => {
            state.listenCurSentenceId = action.payload;
        },
        updateReadCurSentence: (state, action: PayloadAction<any>) => {
            state.readCurSentence = action.payload;
        },
        updateReadVideoCurrentTime: (state, action: PayloadAction<number>) => {
            state.readVideoCurrentTime = action.payload;
        },
        updateReadScrollPos: (state, action: PayloadAction<number>) => {
            state.readScrollPos = action.payload;
        },
    },
});

// prettier-ignore
export const { 
    updateCatalogFolding,
    updateListenCurSentence, 
    updateReadScrollPos, 
    updateReadCurSentence, 
    updateReadVideoCurrentTime, 
    updateVideoMatchingSentence, 
    updateVideoMatchingSentencePos, 
    updateVideoExampleRecognMatching, 
    updateVideoExampleTranslationMatching,
    updateScriptVideoCurrentTime, 
    updateVideoScriptWaveformZoom, 
    updateVocabListenCur, 
    updateVocabListenCurIndex, 
    updateVocabMeaningCur, 
    updateVocabMeaningCurIndex, 
    updateExampleCur, 
    updateExampleCurIndex, 
    updateLoadingUploadVideo,
    updateLoadingImportData, 
    updateLoadingVideoScriptIndexWaver 
} = slice.actions;

export default slice.reducer;
