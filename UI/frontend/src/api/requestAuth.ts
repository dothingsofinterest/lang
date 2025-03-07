import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import store from "../stores";
import { clearToken } from "../stores/reducers/auth";
import { APIPrefix } from "../settings.js";
import { RequestResponse, RequestOAuthUpdatePasswordData } from "../types";

// Request Instance
const requestInstance = axios.create({
    baseURL: APIPrefix,
    timeout: 10000,
});

requestInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const state = store.getState();
        const token = state.auth.ACCESS_TOKEN;
        if (token) {
            config.headers["Authorization"] = "Bearer " + token;
            return config;
        }
        store.dispatch(clearToken());
        window.location.href = "/login";
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

requestInstance.interceptors.response.use(
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

// User Request
export const OAuthLogout = (): Promise<RequestResponse> => {
    return requestInstance.request({
        method: "post",
        url: "/logout",
    });
};

export const OAuthUpdatePassword = (data: RequestOAuthUpdatePasswordData): Promise<RequestResponse> => {
    return requestInstance.request({
        method: "put",
        url: "/users/updatePass",
        data: data,
    });
};
// User Request
