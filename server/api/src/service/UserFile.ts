import { User } from "../types/User";

const users: User[] = [
    {
        id: 1,
        username: "123",
        password_hashed: "$2b$10$mGHU1REpyVykROEmyGSaEuRgx3k2uJcLUYMlf82FzI7cWwePb/eJm",
        status: 1,
    },
];

export const findByID = (value: number): User | undefined => {
    return users.find(({ id }) => id === value);
};

export const findByUsername = (username: string): User | undefined => {
    return users.find((v: User) => v.username === username);
};
