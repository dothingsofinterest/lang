import express from "express";
import { login, captcha } from "../controller/LoginController";
import { conGenerate } from "../controller/TtsController";
import { upload, download, stream, streamSubtitle, compress } from "../controller/VideoController";
import { upload as uploadScript } from "../controller/ScriptController";
import { checkAuthorized } from "../middleware/AuthJWT";

const router = express.Router();

// Video
router.post("/video/upload", upload);
router.get("/video/stream", stream);
router.get("/video/stream-subtitle", streamSubtitle);
router.get("/video/compress", compress);
router.get("/video/download", download);
// Video

// Script
router.post("/script/upload", uploadScript);
// Script

// TTS
router.get("/tts/gen", conGenerate);
// TTS

// router.get("/captcha", captcha);
// router.post("/login", checkAuthorized, login);

export default router;
