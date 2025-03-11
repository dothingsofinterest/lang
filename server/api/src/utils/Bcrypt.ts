import bcrypt from "bcrypt";

const saltRounds = 10; // 盐的轮数。越高越安全，但计算也越耗时，10-12 是推荐的范围。

const encryptString = async (password: string) => {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

const checkString = async (password: string, encodedPassword: string) => {
    try {
        return await bcrypt.compare(password, encodedPassword);
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

export { encryptString, checkString };
