import { Link } from "react-router-dom";
import { Layout, Input, Button, Upload } from "antd";
import { EyeFilled, TranslationOutlined, ExpandOutlined, SettingFilled, CustomerServiceFilled, ProfileFilled, ReadFilled, BulbFilled, EditFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { PlusCircleOutlined, UploadOutlined, DownloadOutlined, LineChartOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Video as DataVideo } from "../../types/Data";
import { videoList, videoCreate } from "../../api/requestAuth";
import { useSelector, useDispatch } from "react-redux";
import { updateLoadingUploadVideo, updateLoadingImportData } from "../../stores/reducers/status";
import { updateVideoURL, updateVideoAudioWaverURL, updateVideoAudioURL } from "../../stores/reducers/video";
import { useParams } from "react-router-dom";
import "./Nav.scss";

interface RouteItem {
    url: string;
    icon: JSX.Element;
}

const navs: RouteItem[] = [
    { url: "/read", icon: <ReadFilled /> },
    { url: "/script", icon: <ProfileFilled /> },
    { url: "/vocab-listen", icon: <CustomerServiceFilled /> },
    { url: "/vocab-meaning", icon: <BulbFilled /> },
];

const Nav = () => {
    const { id } = useParams();
    const videoId = Number(id);
    const { pathname } = useLocation();
    const firstPath = pathname.split("/").filter(Boolean)[0] ?? "";
    return (
        <nav id="nav">
            {navs.map((nav, key) => {
                return (
                    <Link to={`${nav.url}/${videoId}`} key={key} className={`item${nav.url.slice(1) === firstPath ? " active" : ""}`}>
                        <Button icon={nav.icon}></Button>
                    </Link>
                );
            })}
        </nav>
    );
};

export default Nav;
