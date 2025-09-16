import React, { useState, useRef } from "react";
import { Row, Col, Card, Button, Form, Input, Space } from "antd";
import type { FormProps } from "antd";
import { useDispatch } from "react-redux";
import { setToken } from "../../stores/reducers/auth";
import { OAuthLogin, OAuthCaptcha } from "../../api/request";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined, MobileOutlined } from "@ant-design/icons";
import { RequestDataLogin } from "../../types/Http";
import Cookies from "js-cookie";
import "./Login.scss";
type FieldType = {
    username: string;
    password: string;
    code: number;
};
const Login = () => {
    const [captcha, setCaptcha] = useState(``);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const UUID = useRef(``);
    const loadCaptcha = async () => {
        try {
            const res = await OAuthCaptcha();
            setCaptcha(`data:image/svg+xml;base64,${res.data.image}`);
            UUID.current = res.data.uuid;
        } catch (error) {
            console.error("error", error);
            alert(`Failed to load captcha.`);
        }
    };
    const onSubmit: FormProps<FieldType>["onFinish"] = async (values) => {
        try {
            setLoading(true);
            const data: RequestDataLogin = {
                username: `${values.username}`,
                password: `${values.password}`,
                code: values.code,
                uuid: `${UUID.current}`,
            };
            const res = await OAuthLogin(data);
            if (res.code) {
                dispatch(setToken(res));
                navigate("/set");
            } else {
                alert(`${res.message}`);
            }
            setLoading(false);
        } catch (error: any) {
            console.error("error", error);
            setLoading(false);
            loadCaptcha();
            alert(`${error.message}`);
        }
    };
    const onSubmitFailed: FormProps<FieldType>["onFinishFailed"] = (error) => {
        console.error(error);
        alert(`Please enter correct account and password.`);
    };
    useEffect(() => {
        const cookie = Cookies.get(`ACCESS_TOKEN`);
        if (cookie) {
            navigate("/set");
        }
        loadCaptcha();
    }, []);
    return (
        <Row id="login">
            <Col span={18} id="logo">
                <div className="logo-inner">Learn a language</div>
            </Col>
            <Col span={6} id="form">
                <Card title="Please Login">
                    <Form onFinish={onSubmit} onFinishFailed={onSubmitFailed} autoComplete="off">
                        <Form.Item name="username" rules={[{ required: true, message: "Please input your username." }]} initialValue="123">
                            <Input size="large" prefix={<UserOutlined />} placeholder="Please input username" autoComplete="new-password" />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: "Please input your password." }]} initialValue="123">
                            <Input.Password size="large" prefix={<LockOutlined />} placeholder="Please input password" autoComplete="new-password" />
                        </Form.Item>
                        <Space.Compact direction="horizontal">
                            <Form.Item name="code" rules={[{ required: true, message: "Please input code." }]} initialValue="1234">
                                <Input size="large" maxLength={4} prefix={<MobileOutlined />} placeholder="Please input code" autoComplete="new-password" />
                            </Form.Item>
                            <img src={captcha} onClick={loadCaptcha} alt="captcha" className="captcha" />
                        </Space.Compact>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default Login;
