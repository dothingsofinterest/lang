import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import script from "./reducers/script";
import catalog from "./reducers/catalog";
import status from "./reducers/status";

const store = configureStore({
    reducer: { auth, script, catalog, status },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
