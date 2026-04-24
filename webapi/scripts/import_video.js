const fs = require("fs-extra");
const path = require("path");
const Database = require("better-sqlite3");
const AdmZip = require("adm-zip");

// ===== 配置 =====
const VIDEO_ROOT = "./videos"; // 改成你的目录
const DB_PATH = path.resolve(__dirname, "../database/Lang.db");

// ===== DB =====
const db = new Database(DB_PATH);

// 生产建议：开启外键（虽然 video 表暂时没用到）
db.exec("PRAGMA foreign_keys = ON");

// ===== SQL（只做插入）=====
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO video (name) VALUES (?)
`);

// ===== 事务（性能关键）=====
const insertMany = db.transaction((names) => {
    for (const name of names) {
        const info = insertStmt.run(name);
        if (info.changes > 0) {
            console.log("✔ 插入:", name);
        } else {
            console.log("⚠ 已存在:", name);
        }
    }
});

// ===== 读取 script.json =====
function extractTitle(zipPath) {
    const zip = new AdmZip(zipPath);
    const entry = zip.getEntry("script.json");

    if (!entry) return null;

    const json = JSON.parse(entry.getData().toString("utf-8"));
    return json?.title || null;
}

// ===== 主逻辑 =====
async function run() {
    const dirs = await fs.readdir(VIDEO_ROOT);

    const titles = [];

    for (const dir of dirs) {
        const fullPath = path.join(VIDEO_ROOT, dir);

        const stat = await fs.stat(fullPath);
        if (!stat.isDirectory()) continue;

        const zipPath = path.join(fullPath, "data.zip");

        if (!(await fs.pathExists(zipPath))) {
            console.warn("❌ 缺少 data.zip:", dir);
            continue;
        }

        try {
            const title = extractTitle(zipPath);

            if (!title) {
                console.warn("❌ 没有 title:", dir);
                continue;
            }

            titles.push(title);
        } catch (err) {
            console.error("❌ 解析失败:", dir, err.message);
        }
    }

    console.log(`\n📦 共收集 ${titles.length} 条`);

    insertMany(titles);

    console.log("✅ 导入完成");
    db.close();
}

run();
