import { DB, SQL_SNIPPET } from "../lib/DB";
import mysql, { ResultSetHeader } from "mysql2";
import { TypeEntity } from "../types/User";
import { encryptString } from "../utils/Bcrypt";

const findByID = async (ID: number) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`user`", SELECT: ["`id`", "`username`", "`password_hashed`", "`status`"], WHERE: ["`id`=?"], BIND_PARAMS: [ID] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")} LIMIT 1`;
    const [result] = await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
    return result[0];
};

const findByUsername = async (username: string) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`user`", SELECT: ["`id`", "`username`", "`password_hashed`", "`status`"], WHERE: ["`username`=?"], BIND_PARAMS: [username] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")} LIMIT 1`;
    const [result] = await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
    return result[0];
};

const doUpdate = async (data: any, ID: number) => {
    const { newPassword } = data;
    const newPasswordHashed = await encryptString(newPassword);
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`user`", WHERE: ["`id`=?"], SET: ["`password_hashed`=?"], BIND_PARAMS: [newPasswordHashed] };
    SQLSnippet.BIND_PARAMS?.push(ID);
    const SQL = `UPDATE ${SQLSnippet.TABLE} SET ${SQLSnippet.SET?.join(",")} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

export { findByID, findByUsername, doUpdate };
