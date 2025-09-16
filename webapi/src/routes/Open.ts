import express from "express";
import { login, captchaFake } from "../controller/LoginController";
import { checkAuthorized } from "../middleware/AuthJWT";

const router = express.Router();

router.get("/captcha", captchaFake);
router.post("/login", checkAuthorized, login);

export default router;
