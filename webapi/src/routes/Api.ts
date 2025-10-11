import express, { Request, Response } from "express";
import { conGenerate, importTts, streamTts } from "../controller/TtsController";
import { importVideo, streamVideo, compressVideo } from "../controller/VideoController";
import { importScript, importVocabImg, streamVocabImg, uploadVocabImg } from "../controller/ScriptController";
import { uploadJson as uploadJsonMiddleware, uploadVideo as uploadVideoMiddleware, uploadZip as uploadZipMiddleware, uploadImg as uploadImgMiddleware } from "../middleware/Upload";

const router = express.Router();

// Index
router.get("/", (res: Response) => {
    res.json({ code: 1, message: "success" });
});
// Index

// Video
router.post("/video/importVideo", uploadVideoMiddleware, importVideo);
router.get("/video/streamVideo", streamVideo);
router.get("/video/compressVideo", compressVideo);
// Video

// Script
router.get("/script/streamVocabImg", streamVocabImg);
router.post("/script/importScript", uploadJsonMiddleware, importScript);
router.post("/script/importVocabImg", uploadZipMiddleware, importVocabImg);
router.post("/script/uploadVocabImg", uploadImgMiddleware, uploadVocabImg);
// Script

// TTS
router.get("/tts/gen", conGenerate);
router.get("/tts/streamTts", streamTts);
router.post("/tts/importTts", uploadZipMiddleware, importTts);
// TTS

// User
router.post("/logout", (req: Request, res: Response) => {
    res.json({ code: 1, message: "success" });
});
// User

export default router;
