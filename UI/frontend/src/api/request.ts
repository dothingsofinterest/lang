import axios, { AxiosInstance } from "axios";
import { RequestResponse, RequestOAuthLoginParams, RequestTtsData } from "../types";
import { APIPrefix } from "../settings.js";

// Request Instance
const instance: AxiosInstance = axios.create({
    baseURL: APIPrefix,
    timeout: 10000,
});
// Request Instance

// Request Instance Interceptor
instance.interceptors.response.use(
    (response) => {
        if (response.status === 200 && response.data.code === 1) {
            return response.data;
        }
        return Promise.reject(new Error(response.data.message, response.data));
    },
    (error) => {
        return Promise.reject(error);
    },
);
// Request Instance Interceptor

// Login
const OAuthLogin = (params: RequestOAuthLoginParams): Promise<RequestResponse> => {
    return instance.post("/login", params);
};
const OAuthCaptcha = (): Promise<RequestResponse> => {
    return instance.request({
        method: "get",
        url: "/captcha",
    });
};
// Login

// TTS
const ttsGen = (params: RequestTtsData): Promise<RequestResponse> => {
    return instance.request({
        method: "get",
        url: "/tts/gen",
        params: params,
    });
};
// TTS

export { OAuthLogin, OAuthCaptcha, ttsGen };
