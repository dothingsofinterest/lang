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
    sentences: Sentence[];
}

interface Vocab {
    text: string;
    image: string;
    pronunciation: string;
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

/* Diary */
interface Diary {
    title: string;
    date: string;
    content: string;
}

export type { Diary };
/* Diary */

/* Redux */
interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}

interface StatePlan {
    videoHash: string;
    videoURL: string;
    videoAudioWaveformURL: string;
    script: {
        data: Script;
        dataFormatted: FormattedData;
        timeOffset: number;
    };
    scriptCurrentTime: number;
    scriptWaveformZoom: number;
    listenMatchingVocab: number;
    meaningMatchingVocab: number;
    videoMatchingSentence: number;
    videoMatchingSentencePos: number;
    translateMatchingSentence: number;
    translateMatchingSentencePos: number;
    processings: boolean[];
}

interface PayloadScript {
    pKey?: number;
    sKey?: number;
    type?: number;
    text?: string;
}

interface PayloadPlan {
    buttonID?: number;
    buttonStatus?: boolean;
}

interface StateDiary {
    data: Diary;
    contentParsed: string[];
}

export type { StateAuth, StatePlan, PayloadScript, PayloadPlan, StateDiary };
/* Redux */
