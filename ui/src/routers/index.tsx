import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/Public/Login";
import App from "../views/Layout/App";
import NotFound from "../views/Public/NotFound";
import Home from "../views/Home/Index";
import Read from "../views/Read/Index";
import Listen from "../views/Listen/Index";
import Script from "../views/Script/Index";
import VocabListen from "../views/VocabListen/Index";
import VocabMeaning from "../views/VocabMeaning/Index";
import Skeleton from "../views/Skeleton/Index";

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
                element: <Navigate to="home/1" replace />,
            },
            {
                path: "home/:id",
                element: <Home />,
            },
            {
                path: "script/:id",
                element: <Script />,
            },
            {
                path: "read/:id",
                element: <Read />,
            },
            {
                path: "listen/:id",
                element: <Listen />,
            },
            {
                path: "vocabListen/:id",
                element: <VocabListen />,
            },
            {
                path: "vocabMeaning/:id",
                element: <VocabMeaning />,
            },
            {
                path: "skeleton/:id",
                element: <Skeleton />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
