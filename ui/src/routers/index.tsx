import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/public/Login";
import NotFound from "../views/public/NotFound";
import App from "../views/layout/App";
import Setting from "../views/setting/Index";
import ScriptEdit from "../views/script/Edit";
import ScriptView from "../views/script/View";
import Audio from "../views/audio/Index";
import VideoSubtitle from "../views/video/Subtitle";

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
                element: <Navigate to="set" replace />,
            },
            {
                path: "setting",
                element: <Setting />,
            },
            {
                path: "script/edit",
                element: <ScriptEdit />,
            },
            {
                path: "script/view",
                element: <ScriptView />,
            },
            {
                path: "video/subtitle",
                element: <VideoSubtitle />,
            },
            {
                path: "audio/list",
                element: <Audio />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
