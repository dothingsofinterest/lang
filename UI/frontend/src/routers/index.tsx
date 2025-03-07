import { createBrowserRouter, createHashRouter, Navigate } from "react-router-dom";
import Index from "../views/public/Index";
import Script from "../views/public/Script";
import Follow from "../views/public/Follow";
import IndexLayout from "../views/layout/Index";

const routes = [
    {
        path: "/",
        element: <Index />,
    },
    {
        path: "/script",
        element: <Script />,
    },
    {
        path: "/follow",
        element: <Follow />,
    },
    {
        path: "/home",
        element: <IndexLayout />,
        Children: [],
    },
];

export default createBrowserRouter(routes);
