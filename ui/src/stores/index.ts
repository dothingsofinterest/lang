import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import video from "./reducers/video";
import status from "./reducers/status";

const store = configureStore({
    reducer: { auth, video, status },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
