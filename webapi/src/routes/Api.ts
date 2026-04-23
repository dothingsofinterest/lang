import express, { Request, Response } from "express";
import { create as videoCreate, update as videoUpdate, remove as videoRemove, list as videoList } from "../controller/VideoController";
import { countVocab, search } from "../controller/StatisticsController";
import { upload } from "../middleware/Upload";
import { create as vocabCreate, update as vocabUpdate, remove as vocabRemove, list as vocabList } from "../controller/VocabularyController";
import { moveFile as vocabFileMove, removeFile as vocabFileRemove, uploadImage as vocabFileUploadImage } from "../controller/VocabularyFileController";
import { textToSpeech, batchTranscodeToMp3, upload as speechUpload, concat as speechConcat } from "../controller/SpeechController";
import { clip as audioClip } from "../controller/AudioController";

const router = express.Router();

// Index
router.get("/", (res: Response) => res.json({ code: 1, message: "success" }));

// Video
router.post("/video/create", upload, videoCreate);
router.post("/video/update", videoUpdate);
router.post("/video/remove", videoRemove);
router.post("/video/list", videoList);
// Video

// Speech
router.post("/speech/tts", textToSpeech);
router.post("/speech/upload", upload, speechUpload);
router.post("/speech/batch_transcode", batchTranscodeToMp3);
router.post("/speech/concat", speechConcat);
// Speech

// Statistics
router.post("/statistics/count_vocab", countVocab);
router.post("/statistics/search", search);
// Statistics

// Vocab
router.post("/vocab/create", vocabCreate);
router.post("/vocab/update", vocabUpdate);
router.post("/vocab/remove", vocabRemove);
router.post("/vocab/list", vocabList);
router.post("/vocab/file/move", vocabFileMove);
router.post("/vocab/file/remove", vocabFileRemove);
router.post("/vocab/file/image_upload", upload, vocabFileUploadImage);
// Vocab

// Audio
router.post("/audio/clip", audioClip);
// Audio

// User
router.post("/logout", (req: Request, res: Response) => res.json({ code: 1, message: "success" }));
// User

export default router;
