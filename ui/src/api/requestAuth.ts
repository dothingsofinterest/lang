import axios, { AxiosInstance } from "axios";
import { APIPrefix } from "../settings.js";
import { Response, RequestDataUpdatePassword } from "../types/Http";
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

// Script
export const scriptCreate = (data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/create`,
        data: data,
    });
};
export const scriptUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/update`,
        data: data,
    });
};
export const scriptRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/remove`,
        data: data,
    });
};
export const scriptList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/list`,
        params: params,
    });
};
export const scriptRead = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script/read`,
        params: params,
    });
};
/// Script

// Script Paragraph
export const scriptParagraphList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_paragraph/list`,
        params: params,
    });
};
export const scriptParagraphInsert = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_paragraph/insert`,
        data: data,
    });
};
export const scriptParagraphUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_paragraph/update`,
        data: data,
    });
};
export const scriptParagraphRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_paragraph/remove`,
        data: data,
    });
};
export const scriptParagraphCut = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_paragraph/cut`,
        data: data,
    });
};
// Script Paragraph

// Script Sentence
export const scriptSentenceList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_sentence/list`,
        params: params,
    });
};
export const scriptSentenceInsert = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_sentence/insert`,
        data: data,
    });
};
export const scriptSentenceUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_sentence/update`,
        data: data,
    });
};
export const scriptSentenceInsertBatch = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_sentence/insert_batch`,
        data: data,
    });
};
export const scriptSentenceRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_sentence/remove`,
        data: data,
    });
};
export const scriptSentenceSearch = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_sentence/search`,
        params: params,
    });
};
// Script Sentence

// Script Vocabulary
export const scriptVocabCreate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_vocab/create`,
        data: data,
    });
};
export const scriptVocabRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_vocab/remove`,
        data: data,
    });
};
export const scriptVocabList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_vocab/list`,
        params: params,
    });
};
// Script Vocabulary

// Script Role
export const scriptRoleCreate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_role/create`,
        data: data,
    });
};
export const scriptRoleUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_role/update`,
        data: data,
    });
};
export const scriptRoleRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_role/remove`,
        data: data,
    });
};
export const scriptRoleList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_role/list`,
        params: params,
    });
};
// Script Role

// Script Scene
export const scriptSceneCreate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_scene/create`,
        data: data,
    });
};
export const scriptSceneUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_scene/update`,
        data: data,
    });
};
export const scriptSceneRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_scene/remove`,
        data: data,
    });
};
export const scriptSceneList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/script_scene/list`,
        params: params,
    });
};
// Script Scene

// Audio
export const audioClip = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/audio/clip`,
        params: params,
    });
};
// Audio

// File
export const fileUploadImage = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/file/upload_image`,
        data: data,
        params: params,
    });
};
// File

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

// Vocabulary
export const vocabCreate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/create`,
        data: data,
    });
};
export const vocabUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/update`,
        data: data,
    });
};
export const vocabRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/remove`,
        data: data,
    });
};
export const vocabList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/list`,
        params: params,
    });
};
export const vocabFileMove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/file/move`,
        data: data,
    });
};
export const vocabFileRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/file/remove`,
        data: data,
    });
};
export const vocabFileUploadImage = (params: object, data: FormData): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/file/image_upload`,
        data: data,
        params: params,
    });
};
export const vocabFileExportSpeech = (params: object): Promise<Blob> => {
    return requestInstance.request({
        method: "post",
        url: `/vocabulary/file/export_speech`,
        responseType: "blob",
        params: params,
    });
};
// Vocabulary

// Grammar
export const grammarList = (params: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/grammar/list`,
        params: params,
    });
};
export const grammarCreate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/grammar/create`,
        data: data,
    });
};
export const grammarUpdate = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/grammar/update`,
        data: data,
    });
};
export const grammarRemove = (data: object): Promise<Response> => {
    return requestInstance.request({
        method: "post",
        url: `/grammar/remove`,
        data: data,
    });
};
// Grammar
