import { RowDataPacket } from "mysql2";

interface TypeEntity extends RowDataPacket {
    id: number;
    name: string;
    audio: string;
}

export type { TypeEntity };
