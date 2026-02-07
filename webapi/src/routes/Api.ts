import express, { Request, Response } from "express";
import { countVocabs, search } from "../controller/PlanController";
import { videoImport, videoInit } from "../controller/PlanVideoController";
import { dataImport, dataExport, dataSync, vocabImageUpload, vocabPronunciationGenerate, vocabPronunciationUpload, vocabImagePronunciationMove, vocabImagePronunciationRemove, audioConcat, audioClip, audioClipMove, audioClipRemove } from "../controller/PlanDataController";
import { upload } from "../middleware/Upload";

const router = express.Router();

// Index
router.get("/", (res: Response) => res.json({ code: 1, message: "success" }));

// Plan Video
router.post("/plan/video/import", upload, videoImport);
router.post("/plan/video/init", videoInit);
// Plan Video

// Plan Data
router.post("/plan/data/import", upload, dataImport);
router.post("/plan/data/export", dataExport);
router.post("/plan/data/sync", upload, dataSync);
router.post("/plan/data/vocab_image_upload", upload, vocabImageUpload);
router.post("/plan/data/vocab_pronunciation_upload", upload, vocabPronunciationUpload);
router.post("/plan/data/vocab_pronunciation_generate", vocabPronunciationGenerate);
router.post("/plan/data/vocab_image_pronunciation_move", vocabImagePronunciationMove);
router.post("/plan/data/vocab_image_pronunciation_remove", vocabImagePronunciationRemove);
router.post("/plan/data/audio_concat", audioConcat);
router.post("/plan/data/audio_clip", audioClip);
router.post("/plan/data/audio_clip_move", audioClipMove);
router.post("/plan/data/audio_clip_remove", audioClipRemove);
// Plan Data

// Statistics
router.post("/statistics/count_vocabs", countVocabs);
router.post("/statistics/search", search);
// Statistics

// User
router.post("/logout", (req: Request, res: Response) => res.json({ code: 1, message: "success" }));
// User

export default router;
