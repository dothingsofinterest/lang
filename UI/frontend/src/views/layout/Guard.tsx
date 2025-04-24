import React, { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { clearToken } from "../../stores/reducers/auth";
import Cookies from "js-cookie";

interface props {
    children: React.ReactNode;
}

const Guard: React.FC<props> = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const token = useSelector((state: RootState) => state.auth.ACCESS_TOKEN);
    useEffect(() => {
        const cookie = Cookies.get(`ACCESS_TOKEN`);
        if (!cookie) {
            dispatch(clearToken());
            window.location.href = "/#/login";
        }
    }, [location.pathname]);

    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default Guard;
