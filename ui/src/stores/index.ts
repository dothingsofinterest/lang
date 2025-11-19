import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import plan from "./reducers/plan";
import diary from "./reducers/diary";

const store = configureStore({
    reducer: { auth, plan, diary },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
