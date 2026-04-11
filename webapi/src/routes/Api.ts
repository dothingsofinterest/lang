import express, { Request, Response } from "express";
import { videoImport, videoInit } from "../controller/VideoController";
import { dataImport, dataExport, dataSync, vocabImageUpload, vocabImagePronunciationMove, vocabImagePronunciationRemove, audioConcat, audioClip } from "../controller/VideoDataController";
import { textToSpeech, uploadSpeech, batchTranscodeToMp3 } from "../controller/TTSController";
import { countVocab, search } from "../controller/StatisticsController";
import { upload } from "../middleware/Upload";

const router = express.Router();

// Index
router.get("/", (res: Response) => res.json({ code: 1, message: "success" }));

// Video
router.post("/video/import", upload, videoImport);
router.post("/video/init", videoInit);
// Video

// Video Data
router.post("/video/data/import", upload, dataImport);
router.post("/video/data/export", dataExport);
router.post("/video/data/sync", upload, dataSync);
router.post("/video/data/vocab_image_upload", upload, vocabImageUpload);
router.post("/video/data/vocab_image_pronunciation_move", vocabImagePronunciationMove);
router.post("/video/data/vocab_image_pronunciation_remove", vocabImagePronunciationRemove);
router.post("/video/data/audio_concat", audioConcat);
router.post("/video/data/audio_clip", audioClip);
// Video Data

// Speech
router.post("/speech/tts", textToSpeech);
router.post("/speech/upload", upload, uploadSpeech);
router.post("/speech/batch_transcode", batchTranscodeToMp3);
// Speech

// Statistics
router.post("/statistics/count_vocab", countVocab);
router.post("/statistics/search", search);
// Statistics

// User
router.post("/logout", (req: Request, res: Response) => res.json({ code: 1, message: "success" }));
// User

export default router;
