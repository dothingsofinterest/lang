import mysql, { Pool } from "mysql2/promise";

class ClientPool {
    private static singleton: Pool | null = null;
    static getInstance() {
        if (!ClientPool.singleton) {
            ClientPool.singleton = mysql.createPool({
                host: process.env.MYSQL_HOST || "localhost", // 服务器地址
                port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306, // 端口
                user: process.env.MYSQL_USER || "user", // 数据库用户名
                password: process.env.MYSQL_PASSWORD || "password", // 数据库密码
                database: process.env.MYSQL_DATABASE || "database", // 数据库名称
                waitForConnections: true,
                connectionLimit: 10, // 最大连接数
                queueLimit: 0,
            });
        }
        return ClientPool.singleton;
    }
}

interface SQL_SNIPPET {
    SELECT?: any[];
    TABLE: string;
    WHERE?: any[];
    COLUMNS?: any[];
    VALUES?: any[];
    SET?: any[];
    ORDER_BY?: string;
    INNER_JOIN?: any[];
    LEFT_JOIN?: any[];
    BIND_PARAMS?: any[];
}

const poolInstance = ClientPool.getInstance();

export { poolInstance as DB, SQL_SNIPPET };
