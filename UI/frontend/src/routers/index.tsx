import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/public/Login";
import NotFound from "../views/public/NotFound";
import App from "../views/layout/App";
import Set from "../views/set/Index";
import ScriptEdit from "../views/script/Edit";
import ScriptView from "../views/script/View";
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
                element: <Navigate to="/set" replace />,
            },
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
                path: "/video/subtitle",
                element: <VideoSubtitle />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
