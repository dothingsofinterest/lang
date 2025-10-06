import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateVideo } from "../../types/Data";

const initialState: StateVideo = {
    URL: "",
    URLCompressed: "",
};

const slice = createSlice({
    name: "video",
    initialState,
    reducers: {
        updateURL: (state, action: PayloadAction<string>) => {
            state.URL = action.payload;
        },
        updateURLCompressed: (state, action: PayloadAction<string>) => {
            state.URLCompressed = action.payload;
        },
    },
});

export const { updateURL, updateURLCompressed } = slice.actions;

export default slice.reducer;
