import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Record<string, number> = {
    videoScriptCurrentTime: 0,
    videoScriptWaveformZoom: 0,
    videoMatchingSentence: 0,
    videoMatchingSentencePos: 0,
    videoExampleRecognMatching: 0,
    videoExampleTranslationMatching: 0,
    vocabMatchListen: 0,
    vocabMatchMeaning: 0,
    vocabMatchWatch: 0,
    loadingUploadVideo: 0,
    loadingImportData: 0,
    loadingVideoScriptIndexWaver: 0,
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
        updateVocabMatchListen: (state, action: PayloadAction<number>) => {
            state.vocabMatchListen = action.payload;
        },
        updateVocabMatchMeaning: (state, action: PayloadAction<number>) => {
            state.vocabMatchMeaning = action.payload;
        },
        updateVocabMatchWatch: (state, action: PayloadAction<number>) => {
            state.vocabMatchWatch = action.payload;
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
    },
});

export const { updateVideoMatchingSentence, updateVideoMatchingSentencePos, updateVideoExampleRecognMatching, updateVideoExampleTranslationMatching, updateVideoScriptCurrentTime, updateVideoScriptWaveformZoom, updateVocabMatchListen, updateVocabMatchMeaning, updateVocabMatchWatch, updateLoadingUploadVideo, updateLoadingImportData, updateLoadingVideoScriptIndexWaver } = slice.actions;

export default slice.reducer;
