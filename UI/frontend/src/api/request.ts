import axios, { AxiosInstance } from "axios";
import { RequestResponse, RequestOAuthLoginParams, RequestTtsData } from "../types";
import { APIPrefix } from "../settings.js";

// Request Instance
const instance: AxiosInstance = axios.create({
    baseURL: APIPrefix,
    timeout: 10000,
});

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
// Request Instance

// Login Request
const OAuthLogin = (params: RequestOAuthLoginParams): Promise<RequestResponse> => {
    return instance.post("/open/login", params);
};

const OAuthCaptcha = (): Promise<RequestResponse> => {
    return instance.request({
        method: "get",
        url: "/open/captcha",
    });
};
// Login Request

// TTS Request
const ttsGen = (params: RequestTtsData): Promise<RequestResponse> => {
    return instance.request({
        method: "get",
        url: "/tts/gen",
        params: params,
    });
};
// TTS Request

export { OAuthLogin, OAuthCaptcha, ttsGen };
