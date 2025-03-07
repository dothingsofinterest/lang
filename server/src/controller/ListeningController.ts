import { Request, Response, NextFunction } from "express";
import { DB, SQL_SNIPPET } from "../lib/DB";
import mysql, { ResultSetHeader } from "mysql2";
import { Entity, Count } from "../types/Listening";
import { ServiceError } from "../exception/CustomError";

const SQL_TABLE = "`listening`";

export const doList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const keyword: string = req.query.keyword?.toString() || "";
        const pageSize: number = parseInt(req.query.pageSize as string) || 10;
        const pageNo: number = parseInt(req.query.pageNo as string) || 1;
        const offset: number = pageSize * (pageNo - 1);
        const SQL_SELECT = ["`id`", "`title`", "`content`", "`sort`"];
        const SQL_WHERE = ["WHERE 1=1"];
        const SQL_List_Params: any[] = [];
        if (keyword) {
            SQL_WHERE.push(` AND (\`title\` LIKE concat('%',?,'%') OR \`content\` LIKE concat('%',?,'%'))`);
            SQL_List_Params.push(keyword, keyword);
        }
        const SQL_Count = `SELECT count(${SQL_SELECT[0]}) as count FROM ${SQL_TABLE} ${SQL_WHERE.join("")} LIMIT 1`;
        const [total] = await DB.query<Count[]>(SQL_Count, SQL_List_Params);
        console.log(mysql.format(SQL_Count, SQL_List_Params));

        SQL_List_Params.push(offset, pageSize);
        const SQL_List = `SELECT ${SQL_SELECT.join(",")} FROM ${SQL_TABLE} ${SQL_WHERE.join("")} LIMIT ?,?`;
        const [list] = await DB.query<Entity[]>(SQL_List, SQL_List_Params);
        console.log(mysql.format(SQL_List, SQL_List_Params));
        res.json({
            code: 1,
            message: "success",
            data: { total: total[0].count, pageSize, pageNo, list },
        });
    } catch (error) {
        next(error);
    }
};

export const doInsert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content } = req.body;
        if (title === undefined || title.length === 0 || title.length > 255) {
            throw new ServiceError("title length is between 1 and 255");
        }
        const SQL_COLUMNS = ["`title`"];
        const SQL_VALUES = ["?"];
        const SQL_Params = [title];
        if (content) {
            SQL_COLUMNS.push("`content`");
            SQL_VALUES.push("?");
            SQL_Params.push(content);
        }
        const SQL = `INSERT INTO ${SQL_TABLE} (${SQL_COLUMNS.join(",")}) VALUES (${SQL_VALUES.join(",")})`;
        const [result] = await DB.execute<ResultSetHeader>(SQL, SQL_Params);
        console.log(mysql.format(SQL, SQL_Params));
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};

export const doUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ID: number = parseInt(req.params.id as string);
        const { title, content } = req.body;
        if (!ID) {
            throw new ServiceError("ID is required");
        }
        if (title === undefined || title.length === 0 || title.length > 255) {
            throw new ServiceError("title length is between 1 and 255");
        }
        const SQL_WHERE = ["WHERE `id`=?"];
        const SQL_SET = ["`title`=?"];
        const SQL_Params = [title];
        if (content) {
            SQL_SET.push("`content`=?");
            SQL_Params.push(content);
        }
        SQL_Params.push(ID);
        const SQL = `UPDATE ${SQL_TABLE} SET ${SQL_SET.join(",")} ${SQL_WHERE.join("")}`;
        const [result] = await DB.execute<ResultSetHeader>(SQL, SQL_Params);
        console.log(mysql.format(SQL, SQL_Params));
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};

export const doDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ID: number = parseInt(req.params.id as string);
        if (!ID) throw new ServiceError("ID is required");
        const SQL_WHERE = ["`id`=?"];
        const SQL = `DELETE FROM ${SQL_TABLE} WHERE ${SQL_WHERE.join("")}`;
        const SQL_Params = [ID];
        const [result] = await DB.execute<ResultSetHeader>(SQL, SQL_Params);
        res.json({
            code: result.affectedRows ? 1 : 0,
            message: result.affectedRows ? "Success" : "Failed",
        });
    } catch (error) {
        next(error);
    }
};
