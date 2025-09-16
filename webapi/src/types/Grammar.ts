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
    name: string;
    content: string;
    sort?: number;
}

export type { TypeRequest, TypeEntity, TypeCount };
