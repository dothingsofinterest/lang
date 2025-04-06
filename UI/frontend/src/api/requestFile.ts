import axios, { AxiosInstance } from "axios";
import { APIPrefix } from "../settings.js";
import { RequestResponse } from "../types/index.js";

// Request Instance
const requestInstance: AxiosInstance = axios.create({
    baseURL: APIPrefix,
    timeout: 600000,
});
// Request Instance

// Request Instance Interceptor
requestInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.log(error);
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
        return Promise.reject(error);
    },
);
// Request Instance Interceptor

// Video
export const videoUpload = (data: FormData): Promise<RequestResponse> => {
    return requestInstance.request({
        method: "post",
        url: `/video/upload`,
        data: data,
    });
};
export const videoDownload = (params: object): Promise<RequestResponse> => {
    return requestInstance.request({
        method: "get",
        url: `/video/download`,
        params: params,
    });
};
export const videoStream = (params: object): Promise<RequestResponse> => {
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
export const videoGenerateSubtitleClip = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "get",
        url: `/video/stream-subtitle`,
        responseType: "blob",
        params: params,
    });
};
// Video

// Script
export const scriptUpload = (params: object, data: FormData): Promise<RequestResponse> => {
    return requestInstance.request({
        method: "post",
        url: `/script/upload`,
        data: data,
        params: params,
    });
};
// Script
