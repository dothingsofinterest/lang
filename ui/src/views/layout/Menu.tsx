import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, TranslationOutlined, SettingFilled, CustomerServiceFilled, ProfileFilled, ReadFilled, InteractionFilled, BulbFilled, EditFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Menu.scss";

interface RouteItem {
    url: string;
    icon: JSX.Element;
}
const routes = [
    {
        prefix: "video",
        children: [
            { url: "/video/settings", icon: <SettingFilled /> },
            { url: "/video/script", icon: <ProfileFilled /> },
            { url: "/video/read", icon: <ReadFilled /> },
            { url: "/video/word", icon: <EyeFilled /> },
            { url: "/video/listen", icon: <CustomerServiceFilled /> },
            { url: "/video/meaning", icon: <BulbFilled /> },
            { url: "/video/translate", icon: <TranslationOutlined /> },
        ],
    },
    { prefix: "diary", children: [{ url: "/diary/index", icon: <EditFilled /> }] },
];
const Menu = () => {
    const location = useLocation();
    const URLPath = location.pathname.split("/");
    const [currentRoutes, setCurrentRoutes] = useState<RouteItem[]>();
    useEffect(() => {
        return () => {};
    }, []);
    useEffect(() => {
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].prefix === URLPath[1]) {
                setCurrentRoutes(routes[i].children);
                break;
            }
        }
    }, [location]);
    return (
        <aside id="menu">
            {currentRoutes !== undefined &&
                currentRoutes.map((value, key) => {
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
