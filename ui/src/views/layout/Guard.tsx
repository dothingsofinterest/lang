import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useLocation, Navigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { clearToken } from "../../stores/reducers/auth";
import { message } from "antd";

interface GuardProps {
    children: React.ReactNode;
}

const Guard: React.FC<GuardProps> = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const token = Cookies.get(`ACCESS_TOKEN`);
    const video = useSelector((state: RootState) => state.video);
    const [messageApi, contextHolder] = message.useMessage();
    useEffect(() => {
        if (!token) {
            dispatch(clearToken());
            window.location.href = "/#/login";
        }
        // if (!video.videoURL) {
        //     if (location.pathname !== "/settings") {
        //         messageApi.info("Upload an mp4 Video.");
        //         window.location.href = "/#/settings";
        //     }
        // }
    }, [location.pathname]);

    return token ? (
        <>
            {contextHolder}
            {children}
        </>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default Guard;
