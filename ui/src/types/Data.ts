/* TTS */
interface PlayLoopAudio {
    playing: null | boolean;
    playingIndex: number;
}
export type { PlayLoopAudio };
/* TTS */

/* Script */
interface Script {
    title: string;
    roles: string[];
    scenes: string[];
    vocabs: Vocab[];
    grammars: string[];
    paragraphs: Paragraph[];
}

interface FormattedData {
    title: string;
    vocabs: Vocab[];
    grammars: string[];
    scenes: Scene[];
}

interface Vocab {
    text: string;
    image: string[];
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

export type { Script, FormattedData, Vocab, Paragraph, Sentence, Scene };
/* Script */

/* Redux */
interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}

interface StateProject {
    name: string;
    videoURL: string;
    videoCompressedURL: string;
    script: StateScript;
    activeSentence: number;
    activeSentencePos: number;
    activeVocab: number;
    activeVocabPos: number;
    playMode: number;
    processings: boolean[];
}

interface StateScript {
    data: Script;
    dataFormatted: FormattedData;
    timeOffset: number;
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

export type { StateAuth, StateProject, StateScript, PayloadScript, PayloadProject };
/* Redux */
