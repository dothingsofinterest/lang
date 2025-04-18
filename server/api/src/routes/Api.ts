import express, { Request, Response } from "express";
import { conGenerate } from "../controller/TtsController";
import { upload as videoUpload, stream as videoStream, compress as videoCompress, subtitle as videoSubtitle, subtitlePreview as videoSubtitlePreview, download as videoDownload } from "../controller/VideoController";
import { upload as scriptUpload, updateAss as scriptUpdateAss } from "../controller/ScriptController";
import { uploadFile as uploadFileMiddleware, uploadVideo as uploadVideoMiddleware } from "../middleware/Upload";

const router = express.Router();

// Index
router.get("/", (res: Response) => {
    res.json({ code: 1, message: "success" });
});
// Index

// Video
router.post("/video/upload", uploadVideoMiddleware, videoUpload);
router.get("/video/download", videoDownload);
router.get("/video/stream", videoStream);
router.get("/video/compress", videoCompress);
router.get("/video/subtitle", videoSubtitle);
router.get("/video/subtitle-preview", videoSubtitlePreview);
// Video

// Script
router.post("/script/upload", uploadFileMiddleware, scriptUpload);
router.post("/script/update-ass", scriptUpdateAss);
// Script

// TTS
router.get("/tts/gen", conGenerate);
// TTS

// User
router.post("/logout", (req: Request, res: Response) => {
    res.json({ code: 1, message: "success" });
});
// User

export default router;
