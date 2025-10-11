import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/public/Login";
import NotFound from "../views/public/NotFound";
import App from "../views/layout/App";
import Settings from "../views/settings/Index";
import Script from "../views/script/Index";
import ScriptGrammars from "../views/scriptGrammars/Index";
import ScriptVocabs from "../views/scriptVocabs/Index";
import Learn from "../views/learn/Index";
import Meaning from "../views/meaning/Index";
import Listen from "../views/listen/Index";
import Word from "../views/word/Index";
import Video from "../views/video/Index";

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
                element: <Navigate to="settings" replace />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
            {
                path: "script",
                element: <Script />,
            },
            {
                path: "script-grammars",
                element: <ScriptGrammars />,
            },
            {
                path: "script-vocabs",
                element: <ScriptVocabs />,
            },
            {
                path: "learn",
                element: <Learn />,
            },
            {
                path: "listen",
                element: <Listen />,
            },
            {
                path: "word",
                element: <Word />,
            },
            {
                path: "meaning",
                element: <Meaning />,
            },
            {
                path: "video",
                element: <Video />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
