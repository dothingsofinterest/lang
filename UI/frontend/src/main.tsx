import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routers";
import "./styles/common.scss";
import "./styles/app.scss";

const app = document.getElementById("app");
if (!app) {
    throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(app);

root.render(
    // <React.StrictMode>
        <RouterProvider router={router} />
    // </React.StrictMode>
);
