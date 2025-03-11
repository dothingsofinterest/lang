import { RowDataPacket } from "mysql2";

interface TypeEntity extends RowDataPacket {
    id: number;
    username: string;
    password_hashed: string;
    status: number;
}

interface JwtPayload {
    id: number;
    username: string;
    password_hashed: string;
    iat: number;
    exp: number;
}

export type { TypeEntity, JwtPayload };
