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
    title: string;
    content: string;
    vocabulary: string;
}

export type { TypeRequest, TypeEntity, TypeCount };
