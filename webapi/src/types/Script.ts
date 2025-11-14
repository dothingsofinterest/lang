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
