import express, { Request, Response } from "express";
import { videoImport, waveformCreate } from "../controller/VideoController";
import { dataImport, dataExport, scriptSync, vocabImageUpload, vocabPronunciationGenerate, vocabPronunciationUpload, vocabImagePronunciationMove, vocabImagePronunciationRemove } from "../controller/DataController";
import { upload } from "../middleware/Upload";

const router = express.Router();

// Index
router.get("/", (res: Response) => res.json({ code: 1, message: "success" }));

// Video
router.post("/video/import", upload, videoImport);
router.post("/video/waveformCreate", waveformCreate);
// Video

// Data
router.post("/data/export", dataExport);
router.post("/data/import", upload, dataImport);
router.post("/data/script_sync", upload, scriptSync);
router.post("/data/vocab_image_upload", upload, vocabImageUpload);
router.post("/data/vocab_pronunciation_upload", upload, vocabPronunciationUpload);
router.post("/data/vocab_pronunciation_generate", upload, vocabPronunciationGenerate);
router.post("/data/vocab_image_pronunciation_move", upload, vocabImagePronunciationMove);
router.post("/data/vocab_image_pronunciation_remove", upload, vocabImagePronunciationRemove);
// Data

// User
router.post("/logout", (req: Request, res: Response) => res.json({ code: 1, message: "success" }));
// User

export default router;
