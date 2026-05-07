import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useLocation, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearToken } from "../../stores/reducers/auth";

interface GuardProps {
    children: React.ReactNode;
}

const Guard: React.FC<GuardProps> = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const token = Cookies.get(`ACCESS_TOKEN`);
    useEffect(() => {
        if (!token) {
            dispatch(clearToken());
            window.location.href = "/#/login";
        }
    }, [location.pathname]);
    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default Guard;
