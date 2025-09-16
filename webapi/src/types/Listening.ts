import { RowDataPacket } from "mysql2";

interface Count extends RowDataPacket {
    count: number;
}

interface Entity extends RowDataPacket {
    id: number;
    title: string;
    content: string;
    sort: number;
}

export type { Entity, Count };
