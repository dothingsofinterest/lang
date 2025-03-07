import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import collapse from "./reducers/collapse";

const store = configureStore({
    reducer: {
        auth: auth,
        collapse: collapse,
    },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
