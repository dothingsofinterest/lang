import axios, { AxiosInstance } from "axios";
import { APIPrefix } from "../settings.js";
import { Response, RequestDataUpdatePassword, RequestParamsTts } from "../types/Http";
import store from "../stores";
import { clearToken } from "../stores/reducers/auth";

const requestInstance: AxiosInstance = axios.create({
    baseURL: APIPrefix,
    timeout: 1800000,
});

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

// Video
export const videoImport = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/import`,
        data: data,
    });
};
export const videoInit = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: "/video/init",
        params: params,
    });
};
// Video

// Video Data
export const importData = (params: Object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/import`,
        data: data,
        params: params,
    });
};
export const exportData = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/export`,
        responseType: "blob",
        params: params,
    });
};
export const dataSync = (params: Object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `video/data/sync`,
        data: data,
        params: params,
    });
};
export const vocabImageUpload = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/vocab_image_upload`,
        data: data,
        params: params,
    });
};
export const vocabImagePronunciationMove = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/vocab_image_pronunciation_move`,
        params: params,
    });
};
export const vocabImagePronunciationRemove = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/vocab_image_pronunciation_remove`,
        params: params,
    });
};
export const concatAudio = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/audio_concat`,
        responseType: "blob",
        params: params,
    });
};
export const clipAudio = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/data/audio_clip`,
        params: params,
    });
};
// Video Data

// Speech
export const speechTTS = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/speech/tts`,
        params: params,
    });
};
export const speechUpload = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/speech/upload`,
        data: data,
        params: params,
    });
};
export const speechBatchTranscode = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/speech/batch_transcode`,
        params: params,
    });
};
// Speech

// Statistics
export const statisticsCountVocab = (): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/statistics/count_vocab`,
    });
};
export const statisticsSearch = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/statistics/search`,
        params: params,
    });
};
// Statistics
