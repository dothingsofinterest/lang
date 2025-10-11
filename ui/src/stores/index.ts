import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import project from "./reducers/project";

const store = configureStore({
    reducer: {
        auth: auth,
        project: project,
    },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
