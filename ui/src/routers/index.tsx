import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/public/Login";
import NotFound from "../views/public/NotFound";
import App from "../views/layout/App";
import Settings from "../views/settings/Index";
import Script from "../views/script/Index";
import Play from "../views/play/Index";

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
                path: "play",
                element: <Play />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
