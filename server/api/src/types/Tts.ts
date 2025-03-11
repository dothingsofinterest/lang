import { RowDataPacket } from "mysql2";

interface TypeEntityItemTts extends RowDataPacket {
    id: number;
    name: string;
    audio: string;
    audio_cn: string;
    audio_source: number;
}

export type { TypeEntityItemTts };
