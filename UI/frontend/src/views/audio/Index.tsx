import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, Upload } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import "./Index.scss";

const Index = () => {
    console.log("----------Render | Audio/Index----------");
    const processings = useSelector((state: RootState) => state.project.processings);
    const handlersUploadAudio = () => {};
    useEffect(() => {
        console.log("----------Mounted | Audio/Index Component----------");
        return () => {
            console.log("----------Unmounted | Audio/Index Component----------");
        };
    });
    return (
        <Layout className="main-inner" id="audio-index">
            <div className="main-inner-item-main">
                <section className="sec upload">
                    <Upload showUploadList={false} beforeUpload={handlersUploadAudio} disabled={processings[3]}>
                        <Button icon={<PlusCircleOutlined />} loading={processings[3]} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc", justifyContent: "center" }} />
                    </Upload>
                </section>
            </div>
        </Layout>
    );
};

export default Index;
