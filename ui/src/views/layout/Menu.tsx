import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, EditFilled, SettingFilled, VideoCameraOutlined, FileMarkdownOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import "./Menu.scss";

const Menu = () => {
    const location = useLocation();
    return (
        <aside id="menu">
            <Link to="/setting">
                <Button className={location.pathname + location.search === "/setting" ? `menu-item active` : `menu-item`} type="primary" icon={<SettingFilled />} />
            </Link>
            <Link to="/script/edit">
                <Button className={location.pathname + location.search === "/script/edit" ? `menu-item active` : `menu-item`} type="primary" icon={<EditFilled />} />
            </Link>
            <Link to="/script/view">
                <Button className={location.pathname + location.search === "/script/view" ? `menu-item active` : `menu-item`} type="primary" icon={<EyeFilled />} />
            </Link>
            <Link to="/video/subtitle">
                <Button size="large" className={location.pathname + location.search === "/video/subtitle" ? `menu-item active` : `menu-item`} type="primary" icon={<VideoCameraOutlined />} />
            </Link>
            <Link to="/audio/list">
                <Button size="large" className={location.pathname + location.search === "/audio/list" ? `menu-item active` : `menu-item`} type="primary" icon={<FileMarkdownOutlined />} />
            </Link>
        </aside>
    );
};

export default Menu;
