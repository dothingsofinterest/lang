import React, { useEffect } from "react";

interface props {
    children: React.ReactNode;
}

const Guard: React.FC<props> = ({ children }) => {
    useEffect(() => {}, []); // eslint-disable-line

    return <>{children}</>;
};

export default Guard;
