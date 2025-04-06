import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/public/Login";
import App from "../views/layout/App";
import Set from "../views/set/Index";
import ScriptEdit from "../views/script/Edit";
import ScriptView from "../views/script/View";
import VideoClipScript from "../views/video/ClipScript";
import VideoClipBg from "../views/video/ClipBg";

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
                path: "/set",
                element: <Set />,
            },
            {
                path: "/script/edit",
                element: <ScriptEdit />,
            },
            {
                path: "/script/view",
                element: <ScriptView />,
            },
            {
                path: "/video/clip-script",
                element: <VideoClipScript />,
            },
            {
                path: "/video/clip-bg",
                element: <VideoClipBg />,
            },
        ],
    },
];

export default createHashRouter(routes);
