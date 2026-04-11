import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, TranslationOutlined, ExpandOutlined, SettingFilled, CustomerServiceFilled, ProfileFilled, ReadFilled, BulbFilled, EditFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Menu.scss";

interface RouteItem {
    url: string;
    icon: JSX.Element;
}
const routes: RouteItem[] = [
    { url: "/settings", icon: <SettingFilled /> },
    { url: "/video-script", icon: <ProfileFilled /> },
    { url: "/following", icon: <ReadFilled /> },
    { url: "/vocab-listen", icon: <CustomerServiceFilled /> },
    { url: "/vocab-watch", icon: <EyeFilled /> },
    { url: "/vocab-meaning", icon: <BulbFilled /> },
    { url: "/example-recogn", icon: <ExpandOutlined /> },
    { url: "/example-translation", icon: <TranslationOutlined /> },
    { url: "/impression", icon: <EditFilled /> },
];
const Menu = () => {
    const location = useLocation();
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <aside id="menu">
            {routes.map((value, key) => {
                return (
                    <Link to={value.url} key={key}>
                        <Button className={location.pathname + location.search === value.url ? `menu-item active` : `menu-item`} type="primary" icon={value.icon} />
                    </Link>
                );
            })}
        </aside>
    );
};

export default Menu;
