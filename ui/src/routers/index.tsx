import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/Public/Login";
import App from "../views/Layout/App";
import NotFound from "../views/Public/NotFound";
import CommonSettings from "../views/CommonSettings/Index";
import CommonVocabsListen from "../views/CommonVocabsListen/Index";
import CommonVocabsWatch from "../views/CommonVocabsWatch/Index";
import CommonVocabsMeaning from "../views/CommonVocabsMeaning/Index";
import VideoScript from "../views/VideoScript/Index";
import VideoRead from "../views/VideoRead/Index";
import VideoAudioClips from "../views/VideoAudioClips/Index";
import VideoTranslate from "../views/VideoTranslate/Index";
import DiaryEdit from "../views/DiaryEdit/Index";

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
                element: <Navigate to="common/settings" replace />,
            },
            {
                path: "common/settings",
                element: <CommonSettings />,
            },
            {
                path: "common/vocabs-listen",
                element: <CommonVocabsListen />,
            },
            {
                path: "common/vocabs-watch",
                element: <CommonVocabsWatch />,
            },
            {
                path: "common/vocabs-meaning",
                element: <CommonVocabsMeaning />,
            },
            {
                path: "video/script",
                element: <VideoScript />,
            },
            {
                path: "video/read",
                element: <VideoRead />,
            },
            {
                path: "video/audio-clips",
                element: <VideoAudioClips />,
            },
            {
                path: "video/translate",
                element: <VideoTranslate />,
            },
            {
                path: "diary/edit",
                element: <DiaryEdit />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
