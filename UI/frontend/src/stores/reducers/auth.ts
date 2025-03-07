import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RequestResponse, StoreReducerStateAuth } from "../../types";
import Cookies from "js-cookie";

const initialState: StoreReducerStateAuth = {
    ACCESS_TOKEN: `${Cookies.get(`AUTH`)}`,
};
const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<RequestResponse>) {
            state.ACCESS_TOKEN = action.payload.data.access_token;
            Cookies.set(`AUTH`, action.payload.data.access_token, { expires: Math.ceil(action.payload.data.expires_in / 86400) });
        },
        clearToken(state) {
            state.ACCESS_TOKEN = ``;
            Cookies.remove(`AUTH`);
        },
    },
});

export const { setToken, clearToken } = slice.actions;

export default slice.reducer;
