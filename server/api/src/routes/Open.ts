import express from "express";
import { login, captcha } from "../controller/LoginController";
import { conGenerate } from "../controller/TtsController";
import { videoUpload, videoCompress } from "../controller/VideoController";
import { checkAuthorized } from "../middleware/AuthJWT";

const router = express.Router();

router.post("/video/upload", videoUpload);
router.get("/video/compress", videoCompress);
router.get("/tts/gen", conGenerate);
// router.get("/captcha", captcha);
// router.post("/login", checkAuthorized, login);

export default router;
