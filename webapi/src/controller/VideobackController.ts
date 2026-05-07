// import fs from "fs";
// import path from "path";
// import Joi from "joi";
// import { Request, Response, NextFunction } from "express";
// import { enhanceDialogueAndExtractMP3, extractAudio } from "../utils/FFmpeg";
// import { waveformCreate as waveformCreateService } from "../service/BBCAudioWaveform";
// import { Script as DataScript } from "../types/Script";

// const basePath = process.env.UPLOAD_PATH;
// const fileNameVideoFile = "video.mp4";
// const fileNameAudioEnhanced = "audio_enhanced.mp3";
// const fileNameAudio = "audio.mp3";
// const fileNameAudiowaveform = "audiowaveform.json";
// const fileNameScript = "script.json";

// export const videoImport = (req: Request, res: Response) => {
//     if (!req.file) {
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
//     res.status(200).json({
//         code: 1,
//         message: `Succeed.`,
//         data: { hash: path.basename(req.file?.destination) },
//     });
// };

// export const videoInit = async (req: Request, res: Response, next: NextFunction) => {
//     const schema = Joi.object({
//         hash: Joi.string().required(),
//     });
//     const { error, value } = schema.validate(req.query);
//     if (error) {
//         return res.status(200).json({
//             code: 0,
//             message: error.message,
//         });
//     }
//     const videoFolder = path.join(`${basePath}`, value.hash);
//     if (!fs.existsSync(videoFolder)) {
//         return res.status(200).json({
//             code: 0,
//             message: `Video folder does not exist.`,
//         });
//     }
//     const videoPath = path.join(videoFolder, fileNameVideoFile);
//     if (!fs.existsSync(videoPath)) {
//         return res.status(200).json({
//             code: 0,
//             message: `Video does not exist.`,
//         });
//     }
//     try {
//         // Create folder vocab images
//         const vocabImagesFolder = path.join(videoFolder, "vocab_images");
//         if (!fs.existsSync(vocabImagesFolder)) {
//             fs.mkdirSync(vocabImagesFolder, { recursive: true });
//         }
//         // Create folder vocab pronunciations
//         const vocabPronunciationsFolder = path.join(videoFolder, "vocab_pronunciations");
//         if (!fs.existsSync(vocabPronunciationsFolder)) {
//             fs.mkdirSync(vocabPronunciationsFolder, { recursive: true });
//         }
//         // Create script file
//         const scriptContent: DataScript = {
//             title: "",
//             roles: [],
//             scenes: [],
//             paragraphs: [],
//             vocab: [],
//             grammar: [],
//             impression: {
//                 content: "",
//                 grammar: [],
//             },
//         };
//         const scriptPath = path.join(videoFolder, fileNameScript);
//         if (!fs.existsSync(scriptPath)) {
//             fs.writeFileSync(scriptPath, JSON.stringify(scriptContent, null, 4));
//         }
//         // Create file waveform
//         const audiowaveform = path.join(videoFolder, fileNameAudiowaveform);
//         if (!fs.existsSync(audiowaveform)) {
//             const outputAudio = path.join(videoFolder, fileNameAudioEnhanced);
//             await enhanceDialogueAndExtractMP3(videoPath, outputAudio);
//             await waveformCreateService(`${outputAudio}`, `${audiowaveform}`);
//             fs.unlinkSync(outputAudio);
//         }
//         // Create file audio
//         const audio = path.join(videoFolder, fileNameAudio);
//         if (!fs.existsSync(audio)) {
//             await extractAudio(videoPath, audio);
//         }
//         fs.unlinkSync(videoPath);
//         res.status(200).json({
//             code: 1,
//             message: `Succeed.`,
//             data: {
//                 audio: `${fileNameAudio}`,
//                 audiowaveform: `${fileNameAudiowaveform}`,
//             },
//         });
//     } catch (error: any) {
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };
