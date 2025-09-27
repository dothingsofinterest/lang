import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import "./Main.scss";

const Main = () => {
    const handlersEventBeforeunload = (event: BeforeUnloadEvent) => {
        const message = "你有未保存的更改，确定要离开吗？"; // 自定义提示信息 (大多数现代浏览器会忽略自定义消息，显示默认提示)
        event.preventDefault(); // 阻止默认行为 (重要：在某些浏览器中仍然需要)
        event.returnValue = message; // 设置提示信息
        return message; // 某些浏览器可能使用此返回值
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
