// const fs = require("fs-extra");
// const path = require("path");
// const Database = require("better-sqlite3");
// const AdmZip = require("adm-zip");

// // =====================
// // DB
// // =====================
// const db = new Database("../database/Lang.db");
// db.exec("PRAGMA foreign_keys = ON");

// // =====================
// // SQL
// // =====================
// const insertVideo = db.prepare(`
//   INSERT OR IGNORE INTO video (name) VALUES (?)
// `);
// const getVideo = db.prepare(`
//   SELECT id FROM video WHERE name = ?
// `);

// const insertRole = db.prepare(`
//   INSERT OR IGNORE INTO role (video_id, name) VALUES (?, ?)
// `);
// const getRole = db.prepare(`
//   SELECT id FROM role WHERE video_id = ? AND name = ?
// `);

// const insertScene = db.prepare(`
//   INSERT OR IGNORE INTO scene (video_id, name) VALUES (?, ?)
// `);

// const getScene = db.prepare(`
//   SELECT id FROM scene WHERE video_id = ? AND name = ?
// `);

// const insertParagraph = db.prepare(`
//   INSERT INTO paragraph (video_id, scene_id, role_id)
//   VALUES (?, ?, ?)
// `);

// const insertSentence = db.prepare(`
//   INSERT INTO sentence (video_id, paragraph_id, start_time, end_time, text)
//   VALUES (?, ?, ?, ?, ?)
// `);

// const insertVocab = db.prepare(`
//   INSERT OR IGNORE INTO vocabulary (definition, image, speech, category)
//   VALUES (?, ?, ?, ?)
// `);

// const getVocab = db.prepare(`
//   SELECT id FROM vocabulary WHERE definition = ?
// `);

// const insertVocabMap = db.prepare(`
//   INSERT OR IGNORE INTO vocab (video_id, vocab_id)
//   VALUES (?, ?)
// `);

// // function extractVocabAssets(zip, videoId) {
// //     const baseDir = path.join("database", String(videoId));
// //     const imageDir = path.join(baseDir, "image");
// //     const speechDir = path.join(baseDir, "speech");

// //     // 创建目录
// //     fs.ensureDirSync(`database/image`);
// //     fs.ensureDirSync(`database/speech`);

// //     const entries = zip.getEntries();

// //     for (const entry of entries) {
// //         const name = entry.entryName;

// //         // vocab_images
// //         if (name.startsWith("vocab_images/") && !entry.isDirectory) {
// //             const fileName = path.basename(name);
// //             const target = path.join(imageDir, fileName);

// //             fs.writeFileSync(target, entry.getData());
// //         }

// //         // vocab_pronunciations
// //         if (name.startsWith("vocab_pronunciations/") && !entry.isDirectory) {
// //             const fileName = path.basename(name);
// //             const target = path.join(speechDir, fileName);

// //             fs.writeFileSync(target, entry.getData());
// //         }
// //     }

// //     console.log(`✔ assets done: video ${videoId}`);
// // }

// function extractVocabAssets(zip, videoId, json) {
//     const baseDir = path.join("database");

//     const imageRoot = path.join(baseDir, "image");
//     const speechRoot = path.join(baseDir, "speech");

//     fs.ensureDirSync(imageRoot);
//     fs.ensureDirSync(speechRoot);

//     const entries = zip.getEntries();

//     // 文件缓存
//     const imageFiles = new Map();
//     const speechFiles = new Map();

//     for (const entry of entries) {
//         const name = entry.entryName;

//         if (name.startsWith("vocab_images/") && !entry.isDirectory) {
//             imageFiles.set(path.basename(name), entry.getData());
//         }

//         if (name.startsWith("vocab_pronunciations/") && !entry.isDirectory) {
//             speechFiles.set(path.basename(name), entry.getData());
//         }
//     }

//     // 👉 映射返回（给 DB 用）
//     const imageMap = new Map();
//     const speechMap = new Map();

//     json.vocab.forEach((v, index) => {
//         // =====================
//         // chunk 逻辑（每100个一组）
//         // =====================
//         const chunkName = getChunkDate(videoId);

//         // =====================
//         // IMAGE
//         // =====================
//         if (v.image && imageFiles.has(v.image)) {
//             const dir = path.join(imageRoot, chunkName);
//             fs.ensureDirSync(dir);

//             const filePath = path.join(dir, v.image);

//             fs.writeFileSync(filePath, imageFiles.get(v.image));

//             imageMap.set(v.image, `${chunkName}/${v.image}`);
//         }

//         // =====================
//         // SPEECH
//         // =====================
//         if (v.pronunciation && speechFiles.has(v.pronunciation)) {
//             const dir = path.join(speechRoot, chunkName);
//             fs.ensureDirSync(dir);

//             const filePath = path.join(dir, v.pronunciation);

//             fs.writeFileSync(filePath, speechFiles.get(v.pronunciation));

//             speechMap.set(v.pronunciation, `${chunkName}/${v.pronunciation}`);
//         }
//     });

//     console.log(`✔ vocab assets done: video ${videoId}`);

//     return { imageMap, speechMap };
// }

// function extractMediaAssets(zip, videoId, dirPath) {
//     const baseDir = path.join("database", String(videoId));

//     fs.ensureDirSync(baseDir);

//     const entries = zip.getEntries();

//     for (const entry of entries) {
//         const name = entry.entryName;

//         // audio.mp3
//         if (name.endsWith("audio.mp3")) {
//             const target = path.join(baseDir, "audio.mp3");

//             if (!fs.existsSync(target)) {
//                 fs.writeFileSync(target, entry.getData());
//             }
//         }

//         // audiowaveform.json
//         if (name.endsWith("audiowaveform.json")) {
//             const target = path.join(baseDir, "audiowaveform.json");

//             if (!fs.existsSync(target)) {
//                 fs.writeFileSync(target, entry.getData());
//             }
//         }
//     }

//     // =====================
//     // 处理 mp4（在 zip 外）
//     // =====================
//     const files = fs.readdirSync(dirPath);

//     const mp4 = files.find((f) => f.endsWith(".mp4"));

//     if (mp4) {
//         const source = path.join(dirPath, mp4);
//         const target = path.join(baseDir, "video.mp4");

//         if (!fs.existsSync(target)) {
//             fs.copyFileSync(source, target);
//         }
//     } else {
//         console.warn(`⚠ 没找到 mp4: ${dirPath}`);
//     }

//     console.log(`✔ media done: video ${videoId}`);
// }

// const BASE_DATE = new Date("2026-04-25");
// function getChunkDate(index) {
//     const date = new Date(BASE_DATE);
//     // 每个 chunk 往前减 1 天
//     date.setDate(date.getDate() - index);
//     return date.toISOString().slice(0, 10);
// }

// // =====================
// // utils
// // =====================
// function parseTime(str) {
//     // "00:02:05,403" → ms
//     const [h, m, s] = str.split(":");
//     const [sec, ms] = s.split(",");
//     return Number(h) * 3600000 + Number(m) * 60000 + Number(sec) * 1000 + Number(ms);
// }

// // =====================
// // video
// // =====================
// function getVideoId(title) {
//     insertVideo.run(title);
//     return getVideo.get(title).id;
// }

// // =====================
// // MAIN
// // =====================
// async function run(dirPath) {
//     // ⭐ 每个视频独立缓存（关键！）
//     const roleMap = new Map();
//     const sceneMap = new Map();

//     const zipPath = path.join(dirPath, "data.zip");
//     if (!(await fs.pathExists(zipPath))) {
//         console.warn("⚠️ no zip:", dirPath);
//         return;
//     }

//     const zip = new AdmZip(zipPath);
//     const json = JSON.parse(zip.readAsText("script.json"));

//     const videoId = getVideoId(json.title);

//     console.log("\n=====================");
//     console.log("VIDEO:", json.title);

//     // ⭐ 2. 先处理文件（推荐顺序）
//     // extractVocabAssets(zip, videoId);
//     const assetsMap = extractVocabAssets(zip, videoId, json);
//     extractMediaAssets(zip, videoId, dirPath);

//     // =====================
//     // ROLE
//     // =====================
//     const roleTx = db.transaction(() => {
//         for (const name of json.roles || []) {
//             insertRole.run(videoId, name);
//             const row = getRole.get(videoId, name);
//             if (row) {
//                 roleMap.set(name, row.id);
//             }
//         }
//     });

//     roleTx();

//     // =====================
//     // SCENE
//     // =====================
//     const sceneTx = db.transaction(() => {
//         for (const s of json.scenes || []) {
//             insertScene.run(videoId, s.value);
//             const row = getScene.get(videoId, s.value);
//             if (row) {
//                 sceneMap.set(s.index, row.id);
//             }
//         }
//     });

//     sceneTx();

//     // =====================
//     // VOCABULARY
//     // =====================
//     // =====================
//     // VOCABULARY + MAPPING
//     // =====================
//     const vocabTx = db.transaction(() => {
//         for (const v of json.vocab || []) {
//             const definition = v.text;
//             // const image = v.image || null;
//             const image = v.image ? assetsMap.imageMap.get(v.image) || null : null;
//             // const speech = v.pronunciation || null;
//             const speech = v.pronunciation ? assetsMap.speechMap.get(v.pronunciation) || null : null;

//             const category = typeof v.type === "number" ? v.type : 7;

//             // 1️⃣ 插入 vocabulary（去重）
//             insertVocab.run(definition, image, speech, category);

//             // 2️⃣ 获取 vocab_id
//             const row = getVocab.get(definition);
//             if (!row) continue;

//             const vocabId = row.id;

//             // 3️⃣ 插入关联（防重复）
//             insertVocabMap.run(videoId, vocabId);
//         }
//     });

//     vocabTx();

//     // =====================
//     // PARAGRAPH + SENTENCE
//     // =====================
//     const paraTx = db.transaction(() => {
//         for (const p of json.paragraphs || []) {
//             const sceneId = sceneMap.get(p.scene) || null;

//             const roleName = p.roles?.[0];
//             const roleId = roleMap.get(roleName) || null;

//             const paraInfo = insertParagraph.run(videoId, sceneId, roleId);
//             const paragraphId = paraInfo.lastInsertRowid;

//             // sentences
//             for (const s of p.sentences || []) {
//                 insertSentence.run(videoId, paragraphId, parseTime(s.startTime), parseTime(s.endTime), s.texts?.join("\n") || "");
//             }
//         }
//     });

//     paraTx();

//     console.log("✔ DONE:", json.title);
// }

// // =====================
// // BATCH
// // =====================
// async function batch() {
//     const root = "./videos";

//     const dirs = await fs.readdir(root);

//     for (const d of dirs) {
//         const full = path.join(root, d);
//         const stat = await fs.stat(full);

//         if (!stat.isDirectory()) continue;

//         try {
//             await run(full);
//         } catch (e) {
//             console.error("❌ ERROR:", d, e.message);
//         }
//     }

//     db.close();
// }

// batch();
