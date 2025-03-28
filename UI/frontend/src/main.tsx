import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routers";
import "./styles/base.scss";

const app = document.getElementById("app");
if (!app) {
    throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(app);

root.render(<RouterProvider router={router} />);
