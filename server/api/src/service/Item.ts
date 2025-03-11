import { DB, SQL_SNIPPET } from "../lib/DB";
import mysql, { ResultSetHeader } from "mysql2";
import { TypeEntity, TypeCount, TypeRequest } from "../types/Item";

const doList = async (data: TypeRequest) => {
    const { keyword, orderType, pageSize, pageNo } = data;
    const SQLSnippet: SQL_SNIPPET = {
        TABLE: "`item`",
        SELECT: ["`id`", "`name`", "`common`", "`pronounce`", "`noun`", "`noun_plural`", "`verb`", "`verb_past_tense`", "`verb_past_participle`", "`verb_third_person_singular`", "`verb_present_participle`", "`adjective`", "`adverb`", "`conjunction`", "`preposition`", "`comment`", "`sound`"],
        WHERE: ["(1=1)"],
        ORDER_BY: orderType === "ASC" ? "`id` ASC" : "`id` DESC",
        BIND_PARAMS: [],
    };
    if (keyword) {
        const SQLLike = ` AND (\`name\` ?
            OR \`common\` ?
            OR \`noun\` ?
            OR \`verb\` ?
            OR \`adjective\` ?
            OR \`adverb\` ?
            OR \`preposition\` ?
            OR \`conjunction\` ?
            OR \`comment\` ?)`;
        const SQLLikeRep = SQLLike.replace(/\?(\n\s+)?/g, "LIKE concat('%',?,'%') ");
        SQLSnippet.WHERE?.push(SQLLikeRep);
        SQLSnippet.BIND_PARAMS?.push(keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword, keyword);
    }
    const SQL_Count = `SELECT COUNT(\`id\`) AS \`count\` FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")} LIMIT 1`;
    const [total] = await DB.query<TypeCount[]>(SQL_Count, SQLSnippet.BIND_PARAMS);
    console.log(mysql.format(SQL_Count, SQLSnippet.BIND_PARAMS));

    SQLSnippet.BIND_PARAMS?.push(pageSize * (pageNo - 1), pageSize);
    const SQL_List = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")} ORDER BY ${SQLSnippet.ORDER_BY} LIMIT ?,?`;
    const [list] = await DB.query<TypeEntity[]>(SQL_List, SQLSnippet.BIND_PARAMS);
    console.log(mysql.format(SQL_List, SQLSnippet.BIND_PARAMS));

    return { total: total[0].count, pageSize, pageNo, list };
};

const doListByCommon = async (data: TypeRequest) => {
    const { keyword } = data;
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", SELECT: ["`id`", "`common`"], WHERE: ["`common` LIKE concat('%',?,'%')"], BIND_PARAMS: [keyword] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    const [list] = await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
    return { list };
};

const doInsert = async (data: any) => {
    const { name, common, pronounce, noun, noun_plural, verb, verb_past_tense, verb_past_participle, verb_third_person_singular, verb_present_participle, adjective, adverb, conjunction, preposition, comment } = data;
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", COLUMNS: ["`name`"], VALUES: ["?"], BIND_PARAMS: [name] };
    if (common) {
        SQLSnippet.COLUMNS?.push("`common`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(common);
    }
    if (pronounce) {
        SQLSnippet.COLUMNS?.push("`pronounce`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(pronounce);
    }
    if (noun) {
        SQLSnippet.COLUMNS?.push("`noun`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(noun);
    }
    if (noun_plural) {
        SQLSnippet.COLUMNS?.push("`noun_plural`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(noun_plural);
    }
    if (verb) {
        SQLSnippet.COLUMNS?.push("`verb`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(verb);
    }
    if (verb_past_tense) {
        SQLSnippet.COLUMNS?.push("`verb_past_tense`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(verb_past_tense);
    }
    if (verb_past_participle) {
        SQLSnippet.COLUMNS?.push("`verb_past_participle`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(verb_past_participle);
    }
    if (verb_third_person_singular) {
        SQLSnippet.COLUMNS?.push("`verb_third_person_singular`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(verb_third_person_singular);
    }
    if (verb_present_participle) {
        SQLSnippet.COLUMNS?.push("`verb_present_participle`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(verb_present_participle);
    }
    if (adjective) {
        SQLSnippet.COLUMNS?.push("`adjective`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(adjective);
    }
    if (adverb) {
        SQLSnippet.COLUMNS?.push("`adverb`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(adverb);
    }
    if (conjunction) {
        SQLSnippet.COLUMNS?.push("`conjunction`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(conjunction);
    }
    if (preposition) {
        SQLSnippet.COLUMNS?.push("`preposition`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(preposition);
    }
    if (comment) {
        SQLSnippet.COLUMNS?.push("`comment`");
        SQLSnippet.VALUES?.push("?");
        SQLSnippet.BIND_PARAMS?.push(comment);
    }
    const SQL = `INSERT INTO ${SQLSnippet.TABLE} (${SQLSnippet.COLUMNS?.join(",")}) VALUES (${SQLSnippet.VALUES?.join(",")})`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

const doUpdate = async (data: any, ID: number) => {
    const { name, common, pronounce, noun, noun_plural, verb, verb_past_tense, verb_past_participle, verb_third_person_singular, verb_present_participle, adjective, adverb, conjunction, preposition, comment } = data;
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", WHERE: ["`id`=?"], SET: ["`name`=?"], BIND_PARAMS: [name] };
    SQLSnippet.SET?.push("`common`=?");
    SQLSnippet.BIND_PARAMS?.push(common);
    SQLSnippet.SET?.push("`pronounce`=?");
    SQLSnippet.BIND_PARAMS?.push(pronounce);
    SQLSnippet.SET?.push("`noun`=?");
    SQLSnippet.BIND_PARAMS?.push(noun);
    SQLSnippet.SET?.push("`noun_plural`=?");
    SQLSnippet.BIND_PARAMS?.push(noun_plural);
    SQLSnippet.SET?.push("`verb`=?");
    SQLSnippet.BIND_PARAMS?.push(verb);
    SQLSnippet.SET?.push("`verb_past_tense`=?");
    SQLSnippet.BIND_PARAMS?.push(verb_past_tense);
    SQLSnippet.SET?.push("`verb_past_participle`=?");
    SQLSnippet.BIND_PARAMS?.push(verb_past_participle);
    SQLSnippet.SET?.push("`verb_third_person_singular`=?");
    SQLSnippet.BIND_PARAMS?.push(verb_third_person_singular);
    SQLSnippet.SET?.push("`verb_present_participle`=?");
    SQLSnippet.BIND_PARAMS?.push(verb_present_participle);
    SQLSnippet.SET?.push("`adjective`=?");
    SQLSnippet.BIND_PARAMS?.push(adjective);
    SQLSnippet.SET?.push("`adverb`=?");
    SQLSnippet.BIND_PARAMS?.push(adverb);
    SQLSnippet.SET?.push("`conjunction`=?");
    SQLSnippet.BIND_PARAMS?.push(conjunction);
    SQLSnippet.SET?.push("`preposition`=?");
    SQLSnippet.BIND_PARAMS?.push(preposition);
    SQLSnippet.SET?.push("`comment`=?");
    SQLSnippet.BIND_PARAMS?.push(comment);
    SQLSnippet.BIND_PARAMS?.push(ID);
    const SQL = `UPDATE ${SQLSnippet.TABLE} SET ${SQLSnippet.SET?.join(",")} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

const doDelete = async (ID: number) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", WHERE: ["`id`=?"], BIND_PARAMS: [ID] };
    const SQL = `DELETE FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<ResultSetHeader>(SQL, SQLSnippet.BIND_PARAMS);
};

const findByID = async (ID: number) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", SELECT: ["`id`", "`name`", "`common`", "`pronounce`", "`noun`", "`noun_plural`", "`verb`", "`verb_past_tense`", "`verb_past_participle`", "`verb_third_person_singular`", "`verb_present_participle`", "`adjective`", "`adverb`", "`conjunction`", "`preposition`", "`comment`", "`sound`"], WHERE: ["`id`=?"], BIND_PARAMS: [ID] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
};

const findByName = async (name: string) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", SELECT: ["`id`", "`name`", "`common`", "`pronounce`", "`noun`", "`noun_plural`", "`verb`", "`verb_past_tense`", "`verb_past_participle`", "`verb_third_person_singular`", "`verb_present_participle`", "`adjective`", "`adverb`", "`conjunction`", "`preposition`", "`comment`", "`sound`"], WHERE: ["`name`=?"], BIND_PARAMS: [name] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
};

const findByNameCommon = async (name: string, common: string) => {
    const SQLSnippet: SQL_SNIPPET = { TABLE: "`item`", SELECT: ["`id`", "`name`", "`common`", "`pronounce`", "`noun`", "`noun_plural`", "`verb`", "`verb_past_tense`", "`verb_past_participle`", "`verb_third_person_singular`", "`verb_present_participle`", "`adjective`", "`adverb`", "`conjunction`", "`preposition`", "`comment`", "`sound`"], WHERE: ["`name` = ?", " AND `common` = ?"], BIND_PARAMS: [name, common] };
    const SQL = `SELECT ${SQLSnippet.SELECT?.join(",")} FROM ${SQLSnippet.TABLE} WHERE ${SQLSnippet.WHERE?.join("")}`;
    console.log(mysql.format(SQL, SQLSnippet.BIND_PARAMS));
    return await DB.execute<TypeEntity[]>(SQL, SQLSnippet.BIND_PARAMS);
};

export { doList, doListByCommon, doInsert, doUpdate, doDelete, findByID, findByName, findByNameCommon };
