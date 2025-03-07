import { RowDataPacket } from "mysql2";

interface TypeRequest {
    keyword: string;
    orderType: string;
    pageSize: number;
    pageNo: number;
}

interface TypeCount extends RowDataPacket {
    count: number;
}

interface TypeEntity extends RowDataPacket {
    id: number;
    tts_id: number;
    name: string;
    pronounce: string;
    common: string;
    noun: string;
    noun_plural: string;
    verb: string;
    verb_past_tense: string;
    verb_past_participle: string;
    verb_present_participle: string;
    verb_third_person_singular: string;
    adjective: string;
    adverb: string;
    conjunction: string;
    pronoun: string;
    preposition: string;
    comment: string;
}

export type { TypeEntity, TypeCount, TypeRequest };
