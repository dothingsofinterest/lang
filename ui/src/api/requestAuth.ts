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

// Plan Video
export const videoImport = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/video/import`,
        data: data,
    });
};
export const videoInit = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: "/plan/video/init",
        params: params,
    });
};
// Plan Video

// Plan Data
export const importData = (params: Object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/import`,
        data: data,
        params: params,
    });
};
export const exportData = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/export`,
        responseType: "blob",
        params: params,
    });
};
export const dataSync = (params: Object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `plan/data/sync`,
        data: data,
        params: params,
    });
};
export const vocabImageUpload = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/vocab_image_upload`,
        data: data,
        params: params,
    });
};
export const vocabPronunciationUpload = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/vocab_pronunciation_upload`,
        data: data,
        params: params,
    });
};
export const vocabPronunciationGenerate = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/vocab_pronunciation_generate`,
        params: params,
    });
};
export const vocabImagePronunciationMove = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/vocab_image_pronunciation_move`,
        params: params,
    });
};
export const vocabImagePronunciationRemove = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/vocab_image_pronunciation_remove`,
        params: params,
    });
};
export const concatAudio = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/audio_concat`,
        responseType: "blob",
        params: params,
    });
};
export const clipAudio = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/plan/data/audio_clip`,
        params: params,
    });
};
// Plan Data

// Statistics
export const planCountVocabs = (): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/statistics/count_vocabs`,
    });
};
export const planSearch = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/statistics/search`,
        params: params,
    });
};
// Statistics
