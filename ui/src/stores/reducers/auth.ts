import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Response } from "../../types/Http"
import { StateAuth } from "../../types/Data";
import Cookies from "js-cookie";

const initialState: StateAuth = {
    ACCESS_TOKEN: `${Cookies.get(`ACCESS_TOKEN`)}`,
};
const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<Response>) {
            state.ACCESS_TOKEN = action.payload.data.access_token;
            Cookies.set(`ACCESS_TOKEN`, action.payload.data.access_token, { expires: Math.ceil(action.payload.data.expires_in / 86400) });
        },
        clearToken(state) {
            state.ACCESS_TOKEN = ``;
            Cookies.remove(`ACCESS_TOKEN`);
        },
    },
});

export const { setToken, clearToken } = slice.actions;

export default slice.reducer;
