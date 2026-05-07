export interface Grammar {
    id: number;
    name: string;
    text: string;
}

export interface GrammarExample {
    id: number;
    scriptId: number;
    grammarId: number;
    text: string;
    piece: string;
    speech: string;
}
