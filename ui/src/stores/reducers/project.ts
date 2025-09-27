import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateProject, PayloadProject } from "../../types/Data";

const initialState: StateProject = {
    name: "",
    processings: [], // 0-Set/Index 1,2-Video/Subtitle 3-Audio/Index
    activeSentence: 0,
    activeSentencePos: 0,
    activeVocab: 0,
    activeVocabPos: 0,
    playStop: true,
};

const slice = createSlice({
    name: "project",
    initialState,
    reducers: {
        updateName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        updateProcessings: (state, action: PayloadAction<PayloadProject>) => {
            if (action.payload.buttonID !== undefined && action.payload.buttonStatus !== undefined) {
                state.processings[action.payload.buttonID] = action.payload.buttonStatus;
            }
        },
        updateActiveSentence: (state, action: PayloadAction<number>) => {
            state.activeSentence = action.payload;
        },
        updateActiveSentencePos: (state, action: PayloadAction<number>) => {
            state.activeSentencePos = action.payload;
        },
        updateActiveVocab: (state, action: PayloadAction<number>) => {
            state.activeVocab = action.payload;
        },
        updateActiveVocabPos: (state, action: PayloadAction<number>) => {
            state.activeVocabPos = action.payload;
        },
        updatePlayStop: (state, action: PayloadAction<boolean>) => {
            state.playStop = action.payload;
        },
    },
});

export const { updateName, updateProcessings, updateActiveSentence, updateActiveSentencePos, updateActiveVocab, updateActiveVocabPos, updatePlayStop } = slice.actions;

export default slice.reducer;
