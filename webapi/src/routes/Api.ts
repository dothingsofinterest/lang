import express, { Request, Response } from "express";
import { upload } from "../middleware/Upload";
import { create as scriptCreate, update as scriptUpdate, remove as scriptRemove, list as scriptList, read as ScriptRead } from "../controller/ScriptController";
// prettier-ignore
import { 
    list as ScriptParagraphList, 
    insert as ScriptParagraphInsert, 
    update as ScriptParagraphUpdate, 
    remove as ScriptParagraphRemove, 
    cut as ScriptParagraphCut
} from "../controller/ScriptParagraphController";
// prettier-ignore
import { 
    list as ScriptSentenceList, 
    insert as ScriptSentenceInsert, 
    insertBatch as ScriptSentenceInsertBatch, 
    remove as ScriptSentenceRemove, 
    update as ScriptSentenceUpdate ,
    search as ScriptSentenceSearch
} from "../controller/ScriptSentenceController";
import { list as videoVocabList, create as videoVocabCreate, remove as videoVocabRemove } from "../controller/ScriptVocabularyController";
import { list as scriptSceneList, create as scriptSceneCreate, update as scriptSceneUpdate, remove as scriptSceneRemove } from "../controller/ScriptSceneController";
import { list as scriptRoleList, create as scriptRoleCreate, update as scriptRoleUpdate, remove as scriptRoleRemove } from "../controller/ScriptRoleController";
// prettier-ignore
import { 
    create as vocabularyCreate, 
    update as vocabularyUpdate, 
    remove as vocabularyRemove, 
    list as vocabularyList,
    moveFile as vocabularyFileMove, 
    removeFile as vocabularyFileRemove, 
    uploadImage as vocabularyFileUploadImage, 
    exportSpeech as vocabularyFileExportSpeech,
} from "../controller/VocabularyController";
// prettier-ignore
import { 
    create as grammarCreate, 
    update as grammarUpdate, 
    remove as grammarRemove, 
    list as grammarList 
} from "../controller/GrammarController";
// prettier-ignore
import { 
    textToSpeech, 
    batchTranscodeToMp3, 
    upload as speechUpload
} from "../controller/SpeechController";
import { clip as audioClip } from "../controller/AudioController";

const router = express.Router();

// Index
router.get("/", (res: Response) => res.json({ code: 1, message: "success" }));

// Script
router.post("/script/create", upload, scriptCreate);
router.post("/script/update", scriptUpdate);
router.post("/script/remove", scriptRemove);
router.post("/script/list", scriptList);
router.post("/script/read", ScriptRead);
// Script

// Script Paragraph
router.post("/script_paragraph/list", ScriptParagraphList);
router.post("/script_paragraph/insert", ScriptParagraphInsert);
router.post("/script_paragraph/update", ScriptParagraphUpdate);
router.post("/script_paragraph/remove", ScriptParagraphRemove);
router.post("/script_paragraph/cut", ScriptParagraphCut);
// Script Paragraph

// Script Sentence
router.post("/script_sentence/list", ScriptSentenceList);
router.post("/script_sentence/insert", ScriptSentenceInsert);
router.post("/script_sentence/update", ScriptSentenceUpdate);
router.post("/script_sentence/insert_batch", ScriptSentenceInsertBatch);
router.post("/script_sentence/remove", ScriptSentenceRemove);
router.post("/script_sentence/search", ScriptSentenceSearch);
// Script Sentence

// Script Vocabulary
router.post("/script_vocab/list", videoVocabList);
router.post("/script_vocab/create", videoVocabCreate);
router.post("/script_vocab/remove", videoVocabRemove);
// Script Vocabulary

// Script Scene
router.post("/script_scene/list", scriptSceneList);
router.post("/script_scene/create", scriptSceneCreate);
router.post("/script_scene/update", scriptSceneUpdate);
router.post("/script_scene/remove", scriptSceneRemove);
// Script Scene

// Script Role
router.post("/script_role/list", scriptRoleList);
router.post("/script_role/create", scriptRoleCreate);
router.post("/script_role/update", scriptRoleUpdate);
router.post("/script_role/remove", scriptRoleRemove);
// Script Role

// Vocabulary
router.post("/vocabulary/create", vocabularyCreate);
router.post("/vocabulary/update", vocabularyUpdate);
router.post("/vocabulary/remove", vocabularyRemove);
router.post("/vocabulary/list", vocabularyList);
router.post("/vocabulary/file/move", vocabularyFileMove);
router.post("/vocabulary/file/remove", vocabularyFileRemove);
router.post("/vocabulary/file/image_upload", upload, vocabularyFileUploadImage);
router.post("/vocabulary/file/export_speech", upload, vocabularyFileExportSpeech);
// Vocabulary

// Grammar
router.post("/grammar/create", grammarCreate);
router.post("/grammar/update", grammarUpdate);
router.post("/grammar/remove", grammarRemove);
router.post("/grammar/list", grammarList);
// Grammar

// Speech
router.post("/speech/tts", textToSpeech);
router.post("/speech/upload", upload, speechUpload);
router.post("/speech/batch_transcode", batchTranscodeToMp3);
// Speech

// Audio
router.post("/audio/clip", audioClip);
// Audio

// User
router.post("/logout", (req: Request, res: Response) => res.json({ code: 1, message: "success" }));
// User

export default router;
