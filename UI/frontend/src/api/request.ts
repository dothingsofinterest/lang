import axios, { AxiosInstance } from "axios";
import { Response, RequestDataLoginSimple } from "../types/Http";
import { APIPrefix } from "../settings.js";

// Request Instance
const instance: AxiosInstance = axios.create({
    baseURL: `${APIPrefix}`,
    timeout: 10000,
});
// Request Instance

// Request Instance Interceptor
instance.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return response.data;
        }
        return Promise.reject(response.data);
    },
    (error) => {
        return Promise.reject(error);
    },
);
// Request Instance Interceptor

// Login
const OAuthLogin = (data: RequestDataLoginSimple): Promise<Response> => {
    return instance.request({
        method: "post",
        url: `/open/login`,
        data: data,
    });
};
const OAuthCaptcha = (): Promise<Response> => {
    return instance.request({
        method: "get",
        url: "/open/captcha",
    });
};
// Login

export { OAuthLogin, OAuthCaptcha };
