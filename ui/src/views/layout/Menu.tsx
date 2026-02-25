import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, TranslationOutlined, SettingFilled, CustomerServiceFilled, ProfileFilled, ReadFilled, BulbFilled, EditFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Menu.scss";

interface RouteItem {
    url: string;
    icon: JSX.Element;
}
const routes: RouteItem[] = [
    { url: "/common/settings", icon: <SettingFilled /> },
    { url: "/common/vocabs-listen", icon: <CustomerServiceFilled /> },
    { url: "/common/vocabs-watch", icon: <EyeFilled /> },
    { url: "/common/vocabs-meaning", icon: <BulbFilled /> },
    { url: "/video/script", icon: <ProfileFilled /> },
    { url: "/video/read", icon: <ReadFilled /> },
    { url: "/video/translate", icon: <TranslationOutlined /> },
    { url: "/diary/edit", icon: <EditFilled /> },
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
