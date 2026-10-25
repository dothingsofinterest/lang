import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Script } from "../../types/Data";

interface listParams {
    keyword: string;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface StateCatalog {
    list: Script[];
    listParams: listParams;
}

const initialState: StateCatalog = {
    list: [],
    listParams: {
        keyword: "",
        page: 1,
        pageSize: 100,
        totalPages: 0,
    },
};

const slice = createSlice({
    name: "catalog",
    initialState,
    reducers: {
        setList: (state, action: PayloadAction<Script[]>) => {
            state.list = action.payload;
        },
        setListParams: (state, action: PayloadAction<listParams>) => {
            state.listParams = action.payload;
        },
    },
});

// prettier-ignore
export const {
    setList, 
    setListParams
} = slice.actions;

export default slice.reducer;
