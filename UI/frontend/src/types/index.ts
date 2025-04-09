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
    vocabs: string[];
    notes: string[];
    paragraphs: Paragraph[];
    assFormat: AssFormat;
}
interface ScriptArticle {
    name: string;
    vocabs: string[];
    notes: string[];
    scenes: Scene[];
}
interface Paragraph {
    key: string;
    scene: string;
    roles: string[];
    sentences: Sentence[];
}
interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}
interface Scene {
    name: string;
    paragraphs: Paragraph[];
}
interface AssFormat {
    enFontSize: number;
    enFontColor: string;
    enFontColorInline: string;
    enFontOutlineWidth: number;
    enFontOutlineColor: string;
    enAlignment: number;
    enMarginLR: number;
    enMarginV: number;
    cnFontSize: number;
    cnFontColor: string;
    cnFontColorInline: string;
    cnFontOutlineWidth: number;
    cnFontOutlineColor: string;
    cnAlignment: number;
    cnMarginLR: number;
    cnMarginV: number;
    cnLineBreak: number;
}
export type { Script, ScriptArticle, Paragraph, Sentence, Scene, AssFormat };
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
