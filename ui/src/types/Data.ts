/* Plan */
export interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}
export interface StatePlan {
    hash: string;
    type: number;
    videoURL: string;
    videoAudioURL: string;
    videoAudioWaveformURL: string;
    videoScriptCurrentTime: number;
    videoScriptWaveformZoom: number;
    videoTranslateMatchingSentence: number;
    videoTranslateMatchingSentencePos: number;
    videoMatchingSentence: number;
    videoMatchingSentencePos: number;
    videoAudioClipsMatching: number;
    vocabMatchListen: number;
    vocabMatchMeaning: number;
    vocabMatchWatch: number;
    script: Script;
    diary: Diary;
    processings: boolean[];
    data: PlanData;
}
export interface PayloadScript {
    pKey?: number;
    sKey?: number;
    type?: number;
    text?: string;
    index?: number;
    list?: string[];
}
export interface PayloadPlan {
    buttonID?: number;
    buttonStatus?: boolean;
}
/* Plan */

/* Data */
export interface PlanData {
    title: string;
    audioClips: AudioClip[];
    vocabs: Vocab[];
    grammars: string[];
    date: string;
    content: string;
    scenes: SceneBlock[];
    sentences: Sentence[];
}
export interface Script {
    title: string;
    roles: string[];
    scenes: Scene[];
    audioClips: AudioClip[];
    vocabs: Vocab[];
    grammars: string[];
    paragraphs: Paragraph[];
}
export interface Paragraph {
    key: string;
    scene: string | number; // temporary
    roles: string[];
    sentences: Sentence[];
}
export interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
    linkings: string[];
}
export interface SceneBlock {
    name: string;
    paragraphs: Paragraph[];
}
export interface Scene {
    index: number;
    value: string;
}
export interface Vocab {
    text: string;
    image: string;
    voice: number;
    speed: number;
    pronunciation: string;
}
export interface AudioClip {
    text: string;
    audio: string;
}
export interface Diary {
    title: string;
    date: string;
    content: string;
    vocabs: Vocab[];
    grammars: string[];
}
/* Data */
