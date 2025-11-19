import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateDiary, Diary } from "../../types/Data";
import { fnTextToHTML } from "../../utils/diary";

const diary: Diary = {
    title: "",
    date: "",
    content: "",
};

const initialState: StateDiary = {
    data: diary,
    contentParsed: [],
};

const slice = createSlice({
    name: "diary",
    initialState,
    reducers: {
        updateDiaryTitle: (state, action: PayloadAction<string>) => {
            state.data = { ...state.data, title: action.payload };
        },
        updateDiaryDate: (state, action: PayloadAction<string>) => {
            state.data = { ...state.data, date: action.payload };
        },
        updateDiaryContent: (state, action: PayloadAction<string>) => {
            state.data = { ...state.data, content: action.payload };
            state.contentParsed = fnTextToHTML(state.data.content);
        },
    },
});

export const { updateDiaryTitle, updateDiaryDate, updateDiaryContent } = slice.actions;

export default slice.reducer;
