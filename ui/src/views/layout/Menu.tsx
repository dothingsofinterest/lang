import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, EditFilled, SettingFilled, CustomerServiceFilled, AudioFilled, FileFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./Menu.scss";

const Menu = () => {
    console.log("[rendered] layout/menu");
    const location = useLocation();
    useEffect(() => {
        console.log("[mounted] layout/menu");
        return () => {
            console.log("[unmounted] layout/menu");
        };
    }, []);
    return (
        <aside id="menu">
            <Link to="/settings">
                <Button className={location.pathname + location.search === "/settings" ? `menu-item active` : `menu-item`} type="primary" icon={<SettingFilled />} />
            </Link>
            <Link to="/script">
                <Button className={location.pathname + location.search === "/script" ? `menu-item active` : `menu-item`} type="primary" icon={<FileFilled />} />
            </Link>
            <Link to="/dictation">
                <Button className={location.pathname + location.search === "/dictation" ? `menu-item active` : `menu-item`} type="primary" icon={<EditFilled />} />
            </Link>
            <Link to="/speaking">
                <Button className={location.pathname + location.search === "/speaking" ? `menu-item active` : `menu-item`} type="primary" icon={<AudioFilled />} />
            </Link>
        </aside>
    );
};

export default Menu;
