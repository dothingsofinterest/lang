import axios, { AxiosInstance } from "axios";
import { Response } from "../types/Http";

const instance: AxiosInstance = axios.create({
    baseURL: ``,
    timeout: 10000,
});

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

const OAuthCaptcha = (): Promise<Response> => {
    return instance.request({
        method: "get",
        url: "/open/captcha",
    });
};

export { OAuthCaptcha };
