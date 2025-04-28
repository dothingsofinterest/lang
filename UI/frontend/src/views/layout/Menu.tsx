import { Link } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { EyeOutlined, FormOutlined, SettingOutlined, VideoCameraOutlined, FileMarkdownOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import "./Menu.scss";

const Menu = () => {
    const location = useLocation();
    return (
        <aside id="menu">
            <Link to="/set">
                <Tooltip title="Project settings" mouseEnterDelay={1}>
                    <Button className={location.pathname + location.search === "/set" ? `menu-item active` : `menu-item`} type="primary" icon={<SettingOutlined />} />
                </Tooltip>
            </Link>
            <Link to="/script/edit">
                <Tooltip title="Edit script" mouseEnterDelay={1}>
                    <Button className={location.pathname + location.search === "/script/edit" ? `menu-item active` : `menu-item`} type="primary" icon={<FormOutlined />} />
                </Tooltip>
            </Link>
            <Link to="/script/view">
                <Tooltip title="View script" mouseEnterDelay={1}>
                    <Button className={location.pathname + location.search === "/script/view" ? `menu-item active` : `menu-item`} type="primary" icon={<EyeOutlined />} />
                </Tooltip>
            </Link>
            <Link to="/video/subtitle">
                <Tooltip title="Generate a video with subtitle" mouseEnterDelay={1}>
                    <Button size="large" className={location.pathname + location.search === "/video/subtitle" ? `menu-item active` : `menu-item`} type="primary" icon={<VideoCameraOutlined />} />
                </Tooltip>
            </Link>
            <Link to="/audio/list">
                <Tooltip title="Multiple pronunciation" mouseEnterDelay={1}>
                    <Button size="large" className={location.pathname + location.search === "/audio/list" ? `menu-item active` : `menu-item`} type="primary" icon={<FileMarkdownOutlined />} />
                </Tooltip>
            </Link>
        </aside>
    );
};

export default Menu;
