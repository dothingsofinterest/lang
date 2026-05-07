export interface StateAuth {
    ACCESS_TOKEN: string | undefined;
}

/* Data */
export interface Script {
    id: number;
    name: string;
    studyCount: number;
}

export interface ScriptScene {
    id: number;
    scriptId: number;
    name: string;
}

export interface ScriptRole {
    id: number;
    scriptId: number;
    name: string;
}

export interface ScriptParagraph {
    id: number;
    scriptId: number;
    sceneId: number;
    roleId: number;
    orderNum: number;
}
export interface ScriptParagraphWithSentences {
    id: number;
    scriptId: number;
    sceneId: number | null;
    roleId: number | null;
    orderNum: number;
    sentences: {
        id: number;
        startTime: number;
        endTime: number;
        orderNum: number;
        text: string;
        piece: string;
    }[];
}
export interface ScriptSentence {
    id: number;
    scriptId?: number;
    paragraphId?: number;
    startTime: number;
    endTime: number;
    orderNum?: number;
    text: string;
    piece: string;
}
export interface Vocabulary {
    id: number;
    definition: string;
    image: string;
    speech: string;
    category: number; // 1:listening, 2:watching, 4:thinking of
    script_ids?: string;
}

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
/* Data */

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
}
