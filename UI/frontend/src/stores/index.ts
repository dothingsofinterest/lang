import { configureStore } from "@reduxjs/toolkit";
import auth from "./reducers/auth";
import project from "./reducers/project";
import script from "./reducers/script";
import video from "./reducers/video";

const store = configureStore({
    reducer: {
        auth: auth,
        project: project,
        script: script,
        video: video,
    },
});

export default store;

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
