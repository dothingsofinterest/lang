const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// =====================
// 配置
// =====================
const DB_PATH = path.join(__dirname, "../database/Lang.db");
const JSON_PATH = path.join(__dirname, "./grammar.json"); // 你的 json 文件路径

// =====================
// DB
// =====================
const db = new Database(DB_PATH);

// =====================
// SQL
// =====================
const insertGrammar = db.prepare(`
  INSERT INTO grammar (name, text)
  VALUES (?, ?)
`);

// =====================
// 主函数
// =====================
function run() {
    // 读取 JSON
    const raw = fs.readFileSync(JSON_PATH, "utf-8");
    const json = JSON.parse(raw);

    const list = json.grammar || [];

    if (!list.length) {
        console.log("⚠ 没有 grammar 数据");
        return;
    }

    // 事务
    const tx = db.transaction(() => {
        for (const item of list) {
            const name = item.name || null;
            const text = item.text || null;

            // 可选：过滤空 text
            if (!text) continue;

            insertGrammar.run(name, text);
        }
    });

    tx();

    console.log(`✔ 插入完成，共 ${list.length} 条`);
}

// =====================
// 执行
// =====================
try {
    run();
} catch (e) {
    console.error("❌ 错误:", e.message);
} finally {
    db.close();
}
