import { DB, SQL_SNIPPET } from "../lib/DB";
import mysql, { ResultSetHeader } from "mysql2";
import { TypeEntity, TypeCount, TypeRequest } from "../types/Item";

const doList = async (data: TypeRequest) => {
    const { keyword, orderType, pageSize, pageNo } = data;
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`essay`", SELECT: ["`id`", "`title`", "`content`", "`vocabulary`"], WHERE: ["(1=1)"], ORDER_BY: "`id` DESC", BIND_PARAMS: [] };

    if (orderType === "ASC") SQLSnippet.ORDER_BY = "`id` ASC";
    if (keyword) SQLSnippet.WHERE?.push(` AND (\`title\` LIKE concat('%',?,'%') OR \`content\` LIKE concat('%',?,'%') OR \`vocabulary\` LIKE concat('%',?,'%'))`);
    if (keyword) SQLSnippet.BIND_PARAMS?.push(keyword, keyword, keyword);

    const SQL_Count = `SELECT COUNT(${SQLSnippet.SELECT?.[0]}) AS \`count\` FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")} LIMIT 1`;
    const [total] = await DB.query<TypeCount[]>(SQL_Count, SQLSnippet.BIND_PARAMS);
    console.log(mysql.format(SQL_Count, SQLSnippet.BIND_PARAMS));

    SQLSnippet.BIND_PARAMS?.push(pageSize * (pageNo - 1), pageSize);
    const SQL_List = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")} ORDER BY ${SQLSnippet.ORDER_BY} LIMIT ?,?`;
    const [list] = await DB.query<TypeEntity[]>(SQL_List, SQLSnippet.BIND_PARAMS);
    console.log(mysql.format(SQL_List, SQLSnippet.BIND_PARAMS));

    return {
        total: total[0].count,
        pageSize,
        pageNo,
        list,
    };
};

const doInsert = async (data: any) => {
    const { title, content, vocabulary } = data;
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`essay`", COLUMNS: ["`title`"], VALUES: ["?"], BIND_PARAMS: [title] };
    if (content) {
        SQLSnippet.COLUMNS?.push("`content`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(content);
    }
    if (vocabulary) {
        SQLSnippet.COLUMNS?.push("`vocabulary`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(vocabulary);
    }
    const SQL = `INSERT INTO ${SQLSnippet.TABLE} (${SQLSnippet.COLUMNS?.join(",")}) VALUES (${SQLSnippet.VALUES?.join(",")})`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

const doUpdate = async (data: any, ID: number) => {
    const { title, content, vocabulary } = data;
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`essay`", WHERE: ["`id`=?"], SET: ["`title`=?"], BIND_PARAMS: [title] };
    if (content) {
        SQLSnippet.SET?.push("`content`=?");
        SQLSnippet.BIND_PARAMS?.push(content);
    }
    if (vocabulary) {
        SQLSnippet.SET?.push("`vocabulary`=?");
        SQLSnippet.BIND_PARAMS?.push(vocabulary);
    }
    SQLSnippet.BIND_PARAMS?.push(ID);
    const SQL = `UPDATE ${SQLSnippet.TABLE} SET ${SQLSnippet.SET?.join(",")} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

const doDelete = async (ID: number) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`essay`", WHERE: ["`id`=?"], BIND_PARAMS: [ID] };
    const SQL = `DELETE FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

const findByTitle = async (title: string) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`essay`", SELECT: ["`id`", "`title`"], WHERE: ["`title`=?"], BIND_PARAMS: [title] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    return await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
};

export { doList, doInsert, doUpdate, doDelete, findByTitle };
