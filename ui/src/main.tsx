import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./stores";
import router from "./routers";
import "./styles/base.scss";
import "./styles/ant.scss";

const app = document.getElementById("app");
if (!app) {
    throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(app);

root.render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>,
);
