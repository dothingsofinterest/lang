import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StateVideo {
    videoURL: string;
    videoAudioURL: string;
    videoAudioWaveformURL: string;
    scriptId: number;
    script: any;
    scriptSentenceList: any[];
    scriptVocabList: any[];
}

const initialState: StateVideo = {
    videoURL: "",
    videoAudioURL: "",
    videoAudioWaveformURL: "",
    scriptId: 0,
    script: {},
    scriptSentenceList: [],
    scriptVocabList: [],
};

const slice = createSlice({
    name: "script",
    initialState,
    reducers: {
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
        updateScriptId: (state, action: PayloadAction<number>) => {
            state.scriptId = action.payload;
        },
        updateScript: (state, action: PayloadAction<any>) => {
            state.script = action.payload;
        },
        updateScriptSentenceList: (state, action: PayloadAction<any>) => {
            state.scriptSentenceList = action.payload;
        },
        updateScriptVocabList: (state, action: PayloadAction<any>) => {
            state.scriptVocabList = action.payload;
        },
    },
});

// prettier-ignore
export const { 
    updateScriptId, 
    updateVideoURL, 
    updateVideoAudioURL, 
    updateVideoAudioWaverURL,
    updateScript, 
    updateScriptSentenceList, 
    updateScriptVocabList,
} = slice.actions;

export default slice.reducer;
