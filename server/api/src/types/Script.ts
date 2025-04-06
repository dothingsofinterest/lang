/* Data Structure - Script */
interface Script {
    name: string;
    roles: string[];
    scenes: string[];
    words: string[];
    grammers: string[];
    paragraghs: Paragragh[];
}
interface ScriptArticle {
    name: string;
    words: string[];
    grammers: string[];
    scenes: Scene[];
}
interface Paragragh {
    key: string;
    scene: string;
    roles: string[];
    children: Sentence[];
}
interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}
interface Scene {
    name: string;
    paragraghs: Paragragh[];
}
export type { Script, ScriptArticle, Paragragh, Sentence, Scene };
/* Data Structure - Script */
