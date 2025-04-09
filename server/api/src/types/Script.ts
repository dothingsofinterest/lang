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
export type { Script, ScriptArticle, Paragraph, Sentence, Scene };
/* Data Structure - Script */
