import axios, { AxiosInstance } from "axios";
import { APIPrefix } from "../settings.js";
import { Response, RequestDataUpdatePassword, RequestParamsTts } from "../types/Http";
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
export const importTts = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/tts/importTts`,
        data: data,
    });
};
export const streamTts = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "get",
        url: `/tts/streamTts`,
        responseType: "blob",
        params: params,
    });
};
// TTS

// Video
export const importVideo = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/importVideo`,
        data: data,
    });
};

export const compressVideo = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "get",
        url: `/video/compressVideo`,
        responseType: "blob",
        params: params,
    });
};
// Video

// Script
export const importScript = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/importScript`,
        data: data,
        params: params,
    });
};
export const importVocabImg = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/importVocabImg`,
        data: data,
        params: params,
    });
};
export const streamVocabImg = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "get",
        url: `/script/streamVocabImg`,
        responseType: "blob",
        params: params,
    });
};
export const uploadVocabImg = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/uploadVocabImg`,
        params: params,
        data: data,
    });
};
// Script
