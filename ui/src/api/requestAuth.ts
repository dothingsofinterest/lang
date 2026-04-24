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
export const videoCreate = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/create`,
        data: data,
    });
};
export const videoUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/update`,
        data: data,
    });
};
export const videoRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/remove`,
        data: data,
    });
};
export const videoList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/video/list`,
        params: params,
    });
};
// Video

// Audio
export const audioClip = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/audio/clip`,
        params: params,
    });
};
// Audio

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
export const speechConcat = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "post",
        url: `/speech/concat`,
        responseType: "blob",
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

// Vocab
export const vocabCreate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/create`,
        data: data,
    });
};
export const vocabUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/update`,
        data: data,
    });
};
export const vocabRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/remove`,
        data: data,
    });
};
export const vocabList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/list`,
        params: params,
    });
};
export const vocabFileMove = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/file/move`,
        params: params,
    });
};
export const vocabFileRemove = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/file/remove`,
        params: params,
    });
};
export const vocabFileUploadImage = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocab/file/image_upload`,
        data: data,
        params: params,
    });
};
// Vocab

// Script
export const scriptDetail = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/detail`,
        params: params,
    });
};
// Script
