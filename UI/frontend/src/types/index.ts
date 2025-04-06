/* Data Structure - HTTP */
interface RequestResponse {
    code: number;
    message: string;
    data: any;
}
export type { RequestResponse };
/* Data Structure - HTTP */

/* Data Structure - OAuth */
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
export type { RequestOAuthLoginParams, RequestOAuthUpdatePasswordData };
/* Data Structure - OAuth */

/* Data Structure - TTS */
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
/* Data Structure - TTS */

/* Data Structure - Script */
interface Script {
    name: string;
    roles: string[];
    scenes: string[];
    words: string[];
    grammers: string[];
    paragraghs: Paragragh[];
}
interface ScriptArticle {
    name: string;
    words: string[];
    grammers: string[];
    scenes: Scene[];
}
interface Paragragh {
    key: string;
    scene: string;
    roles: string[];
    children: Sentence[];
}
interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}
interface Scene {
    name: string;
    paragraghs: Paragragh[];
}
export type { Script, ScriptArticle, Paragragh, Sentence, Scene };
/* Data Structure - Script */

/* State Structure */
interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}
interface StateProject {
    name: string;
    processings: boolean[];
    activeSentence: number;
    playStop: boolean;
}
interface StateScript {
    data: Script;
    dataArticle: ScriptArticle;
    timeOffset: number;
}
interface StateVideo {
    localOrigin: string;
    localOriginCompress: string;
    localOriginBgAss: string;
}
export type { StateAuth, StateProject, StateScript, StateVideo };
/* State Structure */

/* PlayLoad */
interface PayloadScript {
    pKey?: number;
    sKey?: number;
    type?: number;
    text?: string;
}
interface PayloadProject {
    buttonID?: number;
    buttonStatus?: boolean;
}
export type { PayloadScript, PayloadProject };
/* PlayLoad */
