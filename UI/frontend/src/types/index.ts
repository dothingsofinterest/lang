/* OAuth */
interface RequestResponse {
    code: number;
    message: string;
    data: any;
}
interface RequestOAuthLoginParams {
    username: string;
    password: string;
    code: number;
    uuid: string;
}
interface RequestOAuthUpdatePasswordData {
    oldPassword: string;
    newPassword: string;
}
export type { RequestResponse, RequestOAuthLoginParams, RequestOAuthUpdatePasswordData };
/* OAuth */

/* TTS */
interface RequestTtsData {
    id?: number;
    content: string;
    type: number;
}
interface PlayLoopAudio {
    playing: null | boolean;
    playingIndex: number;
}
export type { RequestTtsData, PlayLoopAudio };
/* TTS */

/* Store */
interface StoreReducerStateAuth {
    ACCESS_TOKEN: string | undefined;
}
export type { StoreReducerStateAuth };
/* Store */
