import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateVideo } from "../../types";

const initialState: StateVideo = {
    localOrigin: "",
    localOriginCompress: "",
    localOriginBgAss: "",
};

const slice = createSlice({
    name: "video",
    initialState,
    reducers: {
        updateLocalOrigin: (state, action: PayloadAction<string>) => {
            state.localOrigin = action.payload;
        },
        updateLocalOriginCompress: (state, action: PayloadAction<string>) => {
            state.localOriginCompress = action.payload;
        },
        updateLocalOriginBgAss: (state, action: PayloadAction<string>) => {
            state.localOriginBgAss = action.payload;
        },
    },
});

export const { updateLocalOrigin, updateLocalOriginCompress, updateLocalOriginBgAss } = slice.actions;

export default slice.reducer;
