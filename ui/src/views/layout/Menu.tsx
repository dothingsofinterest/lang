import { Link } from "react-router-dom";
import { Button } from "antd";
import { EyeFilled, EditFilled, SettingFilled, CustomerServiceFilled, ProfileFilled, ReadFilled, GoogleSquareFilled, YoutubeFilled, SoundFilled, FileWordFilled, BulbFilled } from "@ant-design/icons";
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
                <Button className={location.pathname + location.search === "/script" ? `menu-item active` : `menu-item`} type="primary" icon={<ProfileFilled />} />
            </Link>
            <Link to="/script-vocabs">
                <Button className={location.pathname + location.search === "/script-vocabs" ? `menu-item active` : `menu-item`} type="primary" icon={<FileWordFilled />} />
            </Link>
            <Link to="/script-grammars">
                <Button className={location.pathname + location.search === "/script-grammars" ? `menu-item active` : `menu-item`} type="primary" icon={<GoogleSquareFilled />} />
            </Link>
            <Link to="/learn">
                <Button className={location.pathname + location.search === "/learn" ? `menu-item active` : `menu-item`} type="primary" icon={<ReadFilled />} />
            </Link>
            <Link to="/listen">
                <Button className={location.pathname + location.search === "/listen" ? `menu-item active` : `menu-item`} type="primary" icon={<CustomerServiceFilled />} />
            </Link>
            <Link to="/word">
                <Button className={location.pathname + location.search === "/word" ? `menu-item active` : `menu-item`} type="primary" icon={<EyeFilled />} />
            </Link>
            <Link to="/meaning">
                <Button className={location.pathname + location.search === "/meaning" ? `menu-item active` : `menu-item`} type="primary" icon={<BulbFilled />} />
            </Link>
            <Link to="/video">
                <Button className={location.pathname + location.search === "/video" ? `menu-item active` : `menu-item`} type="primary" icon={<YoutubeFilled />} />
            </Link>
        </aside>
    );
};

export default Menu;
