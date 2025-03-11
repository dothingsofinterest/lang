import express from "express";
import { login, captcha, test } from "../controller/LoginController";
import { conGenerate } from "../controller/TtsController";
import { checkAuthorized } from "../middleware/AuthJWT";

const router = express.Router();

router.get("/test", test);
router.get("/captcha", captcha);
router.post("/login", checkAuthorized, login);

router.get("/tts/gen", conGenerate);

export default router;
