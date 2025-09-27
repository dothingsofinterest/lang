import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, EditFilled, SettingFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import "./Menu.scss";

const Menu = () => {
    const location = useLocation();
    return (
        <aside id="menu">
            <Link to="/settings">
                <Button className={location.pathname + location.search === "/settings" ? `menu-item active` : `menu-item`} type="primary" icon={<SettingFilled />} />
            </Link>
            <Link to="/script">
                <Button className={location.pathname + location.search === "/script" ? `menu-item active` : `menu-item`} type="primary" icon={<EditFilled />} />
            </Link>
            <Link to="/play">
                <Button className={location.pathname + location.search === "/play" ? `menu-item active` : `menu-item`} type="primary" icon={<EyeFilled />} />
            </Link>
        </aside>
    );
};

export default Menu;
