/* TTS */
interface PlayLoopAudio {
    playing: null | boolean;
    playingIndex: number;
}
export type { PlayLoopAudio };
/* TTS */

/* Script */
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
/* Script */

/* Redux */
interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}

interface StateProject {
    name: string;
    processings: boolean[];
    activeSentence: number;
    activeVocab: number;
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

export type { StateAuth, StateProject, StateScript, StateVideo, PayloadScript, PayloadProject };
/* Redux */
