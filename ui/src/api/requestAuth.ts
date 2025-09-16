import axios, { AxiosInstance } from "axios";
import { APIPrefix } from "../settings.js";
import { Response, RequestDataUpdatePassword, RequestParamsTts } from "../types/Http";
import { AssFormat } from "../types/Data";
import store from "../stores";
import { clearToken } from "../stores/reducers/auth";

// Request Instance
const requestInstance: AxiosInstance = axios.create({
    baseURL: APIPrefix,
    timeout: 1800000,
});
// Request Instance

// Request Instance Interceptor
requestInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.ACCESS_TOKEN;
        if (token) {
            config.headers["Authorization"] = "Bearer " + token;
        } else {
            store.dispatch(clearToken());
            window.location.href = "/login";
        }
        return config;
    },
    (error) => {
        console.error(error);
        return Promise.reject(error);
    },
);

requestInstance.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return response.data;
        }
        return Promise.reject(response.data);
    },
    (error) => {
        console.error(error);
        return Promise.reject(error);
    },
);
// Request Instance Interceptor

// User
export const OAuthLogout = (): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: "/logout",
    });
};

export const OAuthUpdatePassword = (data: RequestDataUpdatePassword): Promise<Response> => {
    return requestInstance.request({
        method: "put",
        url: "/users/updatePass",
        data: data,
    });
};
// User

// TTS
export const ttsGen = (params: RequestParamsTts): Promise<Response> => {
    return requestInstance.request({
        method: "get",
        url: "/tts/gen",
        params: params,
    });
};
// TTS

// Video
export const videoUpload = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/upload`,
        data: data,
    });
};

export const videoDownload = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "get",
        url: `/video/download`,
        params: params,
    });
};

export const videoStream = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "get",
        url: `/video/stream`,
        responseType: "blob",
        params: params,
    });
};

export const videoCompress = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "get",
        url: `/video/compress`,
        responseType: "blob",
        params: params,
    });
};

export const videoGenerateSubtitleVideo = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "get",
        url: `/video/subtitle`,
        responseType: "blob",
        params: params,
    });
};

export const videoGetSubtitleVideoPreview = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "get",
        url: `/video/subtitle-preview`,
        params: params,
    });
};
// Video

// Script
export const scriptUpload = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/upload`,
        data: data,
    });
};

export const scriptUpdateAss = (params: object, data: AssFormat): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/update-ass`,
        params: params,
        data: data,
    });
};
// Script
