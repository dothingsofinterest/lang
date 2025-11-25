import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./Nav.scss";

const Menu = () => {
    const location = useLocation();
    const URLPath = location.pathname.split("/");
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <nav id="nav">
            <Link to="/video/settings" className={URLPath[1] === "video" ? `nav-item active` : `nav-item`}>
                <span>Video</span>
            </Link>
            <Link to="/diary/index" className={URLPath[1] === "diary" ? `nav-item active` : `nav-item`}>
                <span>Diary</span>
            </Link>
        </nav>
    );
};

export default Menu;
