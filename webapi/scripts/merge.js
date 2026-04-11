const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");

const ROOT_DIR = "../data/all";
const OUTPUT_DIR = path.join(ROOT_DIR, "All");

const OUTPUT_IMAGES = path.join(OUTPUT_DIR, "vocab_images");
const OUTPUT_AUDIO = path.join(OUTPUT_DIR, "vocab_pronunciations");

const shuffle = (data) => {
    const arr = data.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

async function main() {
    await fs.remove(OUTPUT_DIR);
    await fs.ensureDir(OUTPUT_IMAGES);
    await fs.ensureDir(OUTPUT_AUDIO);

    const folders = await fs.readdir(ROOT_DIR);

    let allVocab = [];
    let ID = 1;

    for (const folder of folders) {
        const folderPath = path.join(ROOT_DIR, folder);

        if (!(await fs.stat(folderPath)).isDirectory()) continue;

        const zipPath = path.join(folderPath, "data.zip");
        if (!(await fs.pathExists(zipPath))) continue;

        // Clear temp fold
        const tempDir = path.join(folderPath, "temp");
        await fs.remove(tempDir);

        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tempDir, true);

        // Read script.json
        const scriptPath = path.join(tempDir, "script.json");
        const script = await fs.readJson(scriptPath);

        // Copy images
        const imagesDir = path.join(tempDir, "vocab_images");
        if (await fs.pathExists(imagesDir)) {
            const images = await fs.readdir(imagesDir);
            for (const img of images) {
                await fs.copy(path.join(imagesDir, img), path.join(OUTPUT_IMAGES, img));
            }
        }

        // Copy mp3
        const audioDir = path.join(tempDir, "vocab_pronunciations");
        if (await fs.pathExists(audioDir)) {
            const audios = await fs.readdir(audioDir);
            for (const audio of audios) {
                await fs.copy(path.join(audioDir, audio), path.join(OUTPUT_AUDIO, audio));
            }
        }

        // Merge vocab
        if (Array.isArray(script.vocab)) {
            allVocab.push(...script.vocab.map((v) => ({ ...v, id: ID++ })));
            console.log("Processing:", folder);
        }

        // Remove temp dir
        await fs.remove(tempDir);
    }

    // script.json
    const finalScript = {
        title: "All",
        roles: [],
        scenes: [],
        paragraphs: [],
        vocab: allVocab,
        grammar: [],
    };

    await fs.writeJson(path.join(OUTPUT_DIR, "script.json"), finalScript, { spaces: 4 });

    // Zip
    const zip = new AdmZip();
    zip.addLocalFolder(OUTPUT_DIR);
    zip.writeZip(path.join(OUTPUT_DIR, `data.zip`));

    console.log("✅ Done!");
}

main();
