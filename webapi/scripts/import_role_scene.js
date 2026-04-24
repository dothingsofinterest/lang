const fs = require("fs-extra");
const path = require("path");
const Database = require("better-sqlite3");
const AdmZip = require("adm-zip");

// =====================
// DB
// =====================
const db = new Database("../database/Lang.db");
db.exec("PRAGMA foreign_keys = ON");

// =====================
// SQL
// =====================
const insertVideo = db.prepare(`INSERT OR IGNORE INTO video (name) VALUES (?)`);
const getVideo = db.prepare(`SELECT id FROM video WHERE name = ?`);

const insertRole = db.prepare(`INSERT INTO role (video_id, name) VALUES (?, ?)`);
const getRole = db.prepare(`SELECT id FROM role WHERE video_id=? AND name=?`);

const insertScene = db.prepare(`INSERT INTO scene (video_id, name) VALUES (?, ?)`);
const getScene = db.prepare(`SELECT id FROM scene WHERE video_id=? AND name=?`);

const insertParagraph = db.prepare(`
  INSERT INTO paragraph (video_id, scene_id, role_id)
  VALUES (?, ?, ?)
`);

const insertSentence = db.prepare(`
  INSERT INTO sentence (paragraph_id, start_time, end_time, text)
  VALUES (?, ?, ?, ?)
`);

// =====================
// Cache Maps
// =====================
const roleMap = new Map(); // name -> id
const sceneMap = new Map(); // index -> id

// =====================
// utils
// =====================
function parseTime(str) {
    // "00:02:05,403" → ms
    const [h, m, s] = str.split(":");
    const [sec, ms] = s.split(",");
    return Number(h) * 3600000 + Number(m) * 60000 + Number(sec) * 1000 + Number(ms);
}

// =====================
// video get/create
// =====================
function getVideoId(title) {
    insertVideo.run(title);
    return getVideo.get(title).id;
}

// =====================
// MAIN
// =====================
async function run(dirPath) {
    const zipPath = path.join(dirPath, "data.zip");
    const zip = new AdmZip(zipPath);

    const json = JSON.parse(zip.readAsText("script.json"));

    const videoId = getVideoId(json.title);

    console.log("\n=====================");
    console.log("VIDEO:", json.title);

    // =====================
    // ROLE
    // =====================
    const roleTx = db.transaction(() => {
        for (const name of json.roles || []) {
            insertRole.run(videoId, name);
            const id = getRole.get(videoId, name).id;
            roleMap.set(name, id);
        }
    });
    roleTx();

    // =====================
    // SCENE
    // =====================
    const sceneTx = db.transaction(() => {
        for (const s of json.scenes || []) {
            insertScene.run(videoId, s.value);
            const row = getScene.get(videoId, s.value);
            sceneMap.set(s.index, row.id);
        }
    });
    sceneTx();

    // =====================
    // PARAGRAPH + SENTENCE
    // =====================
    const paraTx = db.transaction(() => {
        for (const p of json.paragraphs || []) {
            const sceneId = sceneMap.get(p.scene) || null;

            const roleName = p.roles?.[0];
            const roleId = roleMap.get(roleName) || null;

            const paraInfo = insertParagraph.run(videoId, sceneId, roleId);
            const paragraphId = paraInfo.lastInsertRowid;

            // sentences
            for (const s of p.sentences || []) {
                insertSentence.run(paragraphId, parseTime(s.startTime), parseTime(s.endTime), s.texts?.join("\n") || "");
            }
        }
    });

    paraTx();

    console.log("✔ DONE:", json.title);
}

// =====================
// batch
// =====================
async function batch() {
    const root = "./videos";

    const dirs = await fs.readdir(root);

    for (const d of dirs) {
        const full = path.join(root, d);
        const stat = await fs.stat(full);

        if (!stat.isDirectory()) continue;

        try {
            await run(full);
        } catch (e) {
            console.error("ERROR:", d, e.message);
        }
    }

    db.close();
}

batch();
