import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import plan from "./reducers/plan";

const store = configureStore({
    reducer: { auth, plan },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
