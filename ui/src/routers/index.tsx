import { createBrowserRouter, createHashRouter, Navigate, redirect } from "react-router-dom";
import Login from "../views/Public/Login";
import App from "../views/Layout/App";
import NotFound from "../views/Public/NotFound";
// import Settings from "../views/Settings/Index";
import Read from "../views/Read/Index";
import Script from "../views/Script/Index";
// import VocabListen from "../views/VocabListen/Index";
// import VocabWatch from "../views/VocabWatch/Index";
import VocabMeaning from "../views/VocabMeaning/Index";
import ExampleRecogn from "../views/Example/ExampleRecogn";
import ExampleTranslation from "../views/Example/ExampleTranslation";

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
                element: <Navigate to="read/1" replace />,
            },
            // {
            //     path: "settings",
            //     element: <Settings />,
            // },
            {
                path: "script/:id",
                element: <Script />,
            },
            {
                path: "read/:id",
                element: <Read />,
            },
            // {
            //     path: "vocab-listen",
            //     element: <VocabListen />,
            // },
            // {
            //     path: "vocab-watch",
            //     element: <VocabWatch />,
            // },
            {
                path: "vocab-meaning",
                element: <VocabMeaning />,
            },
            {
                path: "example-recogn",
                element: <ExampleRecogn />,
            },
            {
                path: "example-translation",
                element: <ExampleTranslation />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
];

export default createHashRouter(routes);
