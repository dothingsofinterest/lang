import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import script from "./reducers/script";
import status from "./reducers/status";

const store = configureStore({
    reducer: { auth, script, status },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
