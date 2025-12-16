import express, { Request, Response } from "express";
import { videoImport, videoDealWith } from "../controller/VideoController";
import { dataImport, dataExport, scriptSync, vocabImageUpload, vocabPronunciationGenerate, vocabPronunciationUpload, vocabImagePronunciationMove, vocabImagePronunciationRemove, audioConcat } from "../controller/DataController";
import { countVocabs, search } from "../controller/PlanController";
import { upload } from "../middleware/Upload";

const router = express.Router();

// Index
router.get("/", (res: Response) => res.json({ code: 1, message: "success" }));

// Video
router.post("/video/import", upload, videoImport);
router.post("/video/dealWith", videoDealWith);
// Video

// Data
router.post("/data/export", dataExport);
router.post("/data/import", upload, dataImport);
router.post("/data/script_sync", upload, scriptSync);
router.post("/data/vocab_image_upload", upload, vocabImageUpload);
router.post("/data/vocab_pronunciation_upload", upload, vocabPronunciationUpload);
router.post("/data/vocab_pronunciation_generate", vocabPronunciationGenerate);
router.post("/data/vocab_image_pronunciation_move", vocabImagePronunciationMove);
router.post("/data/vocab_image_pronunciation_remove", vocabImagePronunciationRemove);
router.post("/data/audio_concat", audioConcat);
// Data

// Plan
router.post("/plan/count_vocabs", countVocabs);
router.post("/plan/search", search);
// Plan

// User
router.post("/logout", (req: Request, res: Response) => res.json({ code: 1, message: "success" }));
// User

export default router;
