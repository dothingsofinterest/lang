export interface Script {
    title: string;
    roles: string[];
    scenes: Scene[];
    paragraphs: Paragraph[];
    vocab: Vocab[];
    grammar: Grammar[];
    impression: Impression;
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

export interface Impression {
    content: string;
    grammar: string[];
}

export interface Vocab {
    text: string;
    type: number; // 1:listening, 2:watching, 4:thinking of
    image: string;
    pronunciation: string;
}

export interface Paragraph {
    key: string;
    scene: string;
    roles: string[];
    sentences: Sentence[];
}

export interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}

export interface Scene {
    index: number;
    value: string;
}
