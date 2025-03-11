import express from "express";
import { login, captcha, test } from "../controller/LoginController";
import { conGenerate } from "../controller/TtsController";
import { checkAuthorized } from "../middleware/AuthJWT";

const router = express.Router();

// router.get("/test", test);
router.get("/tts/gen", conGenerate);
// router.get("/captcha", captcha);
// router.post("/login", checkAuthorized, login);

export default router;
