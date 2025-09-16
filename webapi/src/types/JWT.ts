interface Payload {
    id: number;
    username: string;
    password_hashed: string;
    iat: number;
    exp: number;
}

export type { Payload };
