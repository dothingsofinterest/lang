import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/Public/Login";
import App from "../views/Layout/App";
import NotFound from "../views/Public/NotFound";
import VideoSettings from "../views/VideoSettings/Index";
import VideoScript from "../views/VideoScript/Index";
import VideoLearn from "../views/VideoLearn/Index";
import VideoMeaning from "../views/VideoMeaning/Index";
import VideoListen from "../views/VideoListen/Index";
import VideoWord from "../views/VideoWord/Index";
import VideoPlay from "../views/VideoPlay/Index";
import VideoTranslate from "../views/VideoTranslate/Index";
import DiaryIndex from "../views/DiaryIndex/Index";

const routes = [
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Navigate to="video/settings" replace />,
            },
            {
                path: "video/settings",
                element: <VideoSettings />,
            },
            {
                path: "video/script",
                element: <VideoScript />,
            },
            {
                path: "video/learn",
                element: <VideoLearn />,
            },
            {
                path: "video/meaning",
                element: <VideoMeaning />,
            },
            {
                path: "video/word",
                element: <VideoWord />,
            },
            {
                path: "video/listen",
                element: <VideoListen />,
            },
            {
                path: "video/video",
                element: <VideoPlay />,
            },
            {
                path: "video/translate",
                element: <VideoTranslate />,
            },
            {
                path: "diary/index",
                element: <DiaryIndex />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
