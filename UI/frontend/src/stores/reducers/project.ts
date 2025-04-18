import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateProject, PayloadProject } from "../../types/Data";

const initialState: StateProject = {
    name: "",
    processings: [],
    activeSentence: 0,
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
        updatePlayStop: (state, action: PayloadAction<boolean>) => {
            state.playStop = action.payload;
        },
    },
});

export const { updateName, updateProcessings, updateActiveSentence, updatePlayStop } = slice.actions;

export default slice.reducer;
