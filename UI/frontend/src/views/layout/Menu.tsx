import { Link } from "react-router-dom";
import { Layout, Input, Button, Upload, Checkbox } from "antd";
import { EyeOutlined, BookOutlined, SettingOutlined, VideoCameraOutlined, DesktopOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import "./Menu.scss";

const Menu = () => {
    const location = useLocation();
    return (
        <nav id="menu">
            <Link to="/set">
                <Button className={location.pathname + location.search === "/set" ? `menu-item active` : `menu-item`} type="primary" icon={<SettingOutlined />}>
                    Set
                </Button>
            </Link>
            <Link to="/script/edit">
                <Button className={location.pathname + location.search === "/script/edit" ? `menu-item active` : `menu-item`} type="primary" icon={<BookOutlined />}>
                    Edit
                </Button>
            </Link>
            <Link to="/script/view">
                <Button className={location.pathname + location.search === "/script/view" ? `menu-item active` : `menu-item`} type="primary" icon={<BookOutlined />}>
                    View
                </Button>
            </Link>
            <Link to="/video/clip-script">
                <Button className={location.pathname + location.search === "/video/clip-script" ? `menu-item active` : `menu-item`} type="primary" icon={<VideoCameraOutlined />}>
                    Script
                </Button>
            </Link>
            <Link to="/video/clip-bg">
                <Button className={location.pathname + location.search === "/video/clip-bg" ? `menu-item active` : `menu-item`} type="primary" icon={<DesktopOutlined />}>
                    Bg
                </Button>
            </Link>
        </nav>
    );
};

export default Menu;
