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
    scriptId: number;
    paragraphId: number;
    startTime: number;
    endTime: number;
    orderNum: number;
    text: string;
    piece: string;
}
