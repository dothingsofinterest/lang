declare namespace Express {
    export interface Request {
        user?: {
            id: number;
            username: string;
            password_hashed: string;
        };
    }
}
