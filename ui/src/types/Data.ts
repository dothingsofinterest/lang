export interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}
export interface StateData {
    videoHash: string;
    videoURL: string;
    videoAudioURL: string;
    videoAudioWaveformURL: string;
    script: Script;
    scriptParsed: ScriptParsed;
}
export interface PayloadScript {
    pKey?: number;
    sKey?: number;
    type?: number;
    text?: string;
    index?: number;
    list?: string[];
}

/* Data */
export interface Script {
    title: string;
    roles: string[];
    scenes: Scene[];
    paragraphs: Paragraph[];
    vocab: Vocab[];
    grammar: Grammar[];
    impression: Impression;
}
export interface ScriptParsed {
    title: string;
    vocab: Vocab[];
    grammar: Grammar[];
    exampleRecogn: GrammarExamplePractice[];
    exampleTranslation: GrammarExamplePractice[];
    scenes: SceneBlock[];
    sentences: Sentence[];
    impression: Impression;
}
export interface SceneBlock {
    name: string;
    paragraphs: Paragraph[];
}
export interface Scene {
    index: number;
    value: string;
}
export interface Paragraph {
    id: number;
    scene: string | number; // temporary
    roles: string[];
    sentences: Sentence[];
}
export interface Sentence {
    id: number;
    startTime: string;
    endTime: string;
    texts: string[];
}
export interface Vocab {
    id: number;
    text: string;
    type: number; // 1:listening, 2:watching, 4:thinking of
    image: string;
    pronunciation: string;
}
export interface Grammar {
    id: number;
    order: number;
    name: string;
    text: string;
    examples: GrammarExample[];
}
export interface GrammarExample {
    id: number;
    type: number;
    text: string;
}
export interface GrammarExamplePractice {
    text: string[];
    type: number;
}
export interface Impression {
    content: string;
    grammar: string[];
}
/* Data */
