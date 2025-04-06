import { Outlet } from "react-router-dom";
import "./Main.scss";
const Main = () => {
    return (
        <main id="main">
            <Outlet></Outlet>
        </main>
    );
};

export default Main;
