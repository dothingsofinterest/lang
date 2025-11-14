import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import "./Main.scss";

const Main = () => {
    console.log("[rendered] layout/main");
    const handlersEventBeforeunload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        return "你有未保存的更改，确定要离开吗？";
    };
    useEffect(() => {
        console.log("[mounted] layout/main");
        window.addEventListener("beforeunload", handlersEventBeforeunload);
        return () => {
            console.log("[unmounted] layout/main");
            window.removeEventListener("beforeunload", handlersEventBeforeunload);
        };
    }, []);
    return (
        <main id="main">
            <Outlet></Outlet>
        </main>
    );
};

export default Main;
