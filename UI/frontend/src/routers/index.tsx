import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Index from "../views/public/Index";
import ScriptEdit from "../views/script/Edit";
import ScriptView from "../views/script/View";
import ClipScript from "../views/clip/Script";
import ClipBackground from "../views/clip/Background";
import VideoCompress from "../views/video/Compress";
import IndexLayout from "../views/layout/Index";

const routes = [
    {
        path: "/",
        element: <Index />,
    },
    {
        path: "/edit",
        element: <ScriptEdit />,
    },
    {
        path: "/view",
        element: <ScriptView />,
    },
    {
        path: "/clip/script",
        element: <ClipScript />,
    },
    {
        path: "/clip/background",
        element: <ClipBackground />,
    },
    {
        path: "/video/compress",
        element: <VideoCompress />,
    },
    {
        path: "/home",
        element: <IndexLayout />,
        Children: [],
    },
];

export default createHashRouter(routes);
