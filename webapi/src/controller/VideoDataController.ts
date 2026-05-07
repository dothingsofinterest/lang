// import fs, { promises as fsPromise } from "fs";
// import path from "path";
// import Joi from "joi";
// import AdmZip from "adm-zip";
// import { Request, Response } from "express";
// import { LoggerSystem } from "../lib/Log";
// import { concatSpeech, clipAudio } from "../utils/FFmpeg";
// import { Script as DataScript } from "../types/Script";

// const basePath = process.env.UPLOAD_PATH;

// export const dataImport = async (req: Request, res: Response) => {
//     if (!req.file) {
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
//     try {
//         const zip = new AdmZip(req.file.path);
//         zip.extractAllTo(path.join(`${req.file.destination}`), true);
//         fs.unlinkSync(req.file.path);
//         return res.status(200).json({
//             code: 1,
//             message: `Succeed.`,
//         });
//     } catch (error: any) {
//         console.error(error.message, error);
//         LoggerSystem.error(error.message);
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };

// export const dataExport = async (req: Request, res: Response) => {
//     const schema = Joi.object({
//         hash: Joi.string().required(),
//     });
//     const { error, value } = schema.validate(req.query);
//     if (error) {
//         console.error("Failed to validate params: ", error.message);
//         return res.status(200).json({
//             code: 0,
//             message: error.message,
//         });
//     }
//     try {
//         const zipFolder = path.join(`${basePath}`, value.hash);
//         const zipFile = path.join(zipFolder, `data.zip`);
//         const zip = new AdmZip();
//         zip.addLocalFolder(zipFolder);
//         zip.writeZip(zipFile);
//         const stat = fs.statSync(zipFile);
//         const fileSize = stat.size;
//         res.setHeader("Content-Length", fileSize);
//         res.setHeader("Content-Type", "application/zip");
//         const videoStream = fs.createReadStream(zipFile);
//         videoStream.pipe(res);
//         res.on("finish", () => {
//             fs.unlinkSync(zipFile);
//         });
//         videoStream.on("error", (err) => {
//             console.error(err);
//             LoggerSystem.error(err.message);
//             return res.status(200).json({
//                 code: 0,
//                 message: `Failed.`,
//             });
//         });
//     } catch (error: any) {
//         console.error(error);
//         LoggerSystem.error(error.message);
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };

// export const dataSync = async (req: Request, res: Response) => {
//     if (!req.file) {
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
//     if (!fs.existsSync(req.file.path)) {
//         return res.status(200).json({
//             code: 0,
//             message: `Data file does not exist.`,
//         });
//     }
//     const scriptBinary = await fsPromise.readFile(req.file.path);
//     const scriptString = Buffer.from(scriptBinary).toString();
//     const scriptObject: DataScript = JSON.parse(scriptString);
//     const vocabImages = scriptObject.vocab.filter((v: any) => v.image).map((v: any) => v.image);
//     const vocabPronunciations = scriptObject.vocab.map((v: any) => v.pronunciation);
//     if (vocabImages.length > 0) {
//         const pathVocabImages = path.join(req.file.destination, "vocab_images");
//         const filesVocabImages = await fsPromise.readdir(pathVocabImages);
//         for (const image of filesVocabImages) {
//             if (!vocabImages.includes(image)) {
//                 fs.unlinkSync(path.join(pathVocabImages, image));
//             }
//         }
//     }
//     if (vocabPronunciations.length > 0) {
//         const pathVocabPronunciations = path.join(req.file.destination, "vocab_pronunciations");
//         const filesVocabPronunciations = await fsPromise.readdir(pathVocabPronunciations);
//         for (const pronunciation of filesVocabPronunciations) {
//             if (!vocabPronunciations.includes(pronunciation)) {
//                 fs.unlinkSync(path.join(pathVocabPronunciations, pronunciation));
//             }
//         }
//     }
//     res.status(200).json({
//         code: 1,
//         message: `Succeed.`,
//     });
// };

// export const vocabImageUpload = (req: Request, res: Response) => {
//     if (!req.file) {
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
//     res.status(200).json({
//         code: 1,
//         message: `Succeed.`,
//         data: { filename: req.file.originalname },
//     });
// };

// export const vocabImagePronunciationMove = (req: Request, res: Response) => {
//     const schema = Joi.object({
//         hash: Joi.string().required(),
//         vocabImage: Joi.string().allow(null, ""),
//         vocabPronunciation: Joi.string().allow(null, ""),
//     });
//     const { error, value } = schema.validate(req.query);
//     if (error) {
//         console.error("Failed to validate params: ", error.message);
//         return res.status(200).json({
//             code: 0,
//             message: error.message,
//         });
//     }
//     try {
//         const videoFolder = path.join(`${basePath}`, value.hash);
//         if (!fs.existsSync(videoFolder)) {
//             return res.status(200).json({
//                 code: 0,
//                 message: `Video folder does not exist.`,
//             });
//         }
//         const tempPath = path.join(`${basePath}`, `temp`);
//         if (!fs.existsSync(tempPath)) {
//             fs.mkdirSync(tempPath, { recursive: true });
//         }
//         if (value.vocabPronunciation) {
//             const pronunciationTempFile = path.join(tempPath, value.vocabPronunciation);
//             if (fs.existsSync(pronunciationTempFile)) {
//                 const fileDestination = path.join(videoFolder, "vocab_pronunciations", value.vocabPronunciation);
//                 if (fs.existsSync(fileDestination)) {
//                     fs.unlinkSync(fileDestination);
//                 }
//                 fs.renameSync(pronunciationTempFile, fileDestination);
//             }
//         }
//         if (value.vocabImage) {
//             const imageTempFile = path.join(tempPath, value.vocabImage);
//             if (fs.existsSync(imageTempFile)) {
//                 const fileDestination = path.join(videoFolder, "vocab_images", value.vocabImage);
//                 if (fs.existsSync(fileDestination)) {
//                     fs.unlinkSync(fileDestination);
//                 }
//                 fs.renameSync(imageTempFile, fileDestination);
//             }
//         }
//         res.status(200).json({
//             code: 1,
//             message: `Succeed.`,
//         });
//     } catch (error: any) {
//         console.error(error);
//         LoggerSystem.error(error.message);
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };

// export const vocabImagePronunciationRemove = (req: Request, res: Response) => {
//     const schema = Joi.object({
//         hash: Joi.string().required(),
//         vocabImage: Joi.string().allow(null, ""),
//         vocabPronunciation: Joi.string().allow(null, ""),
//     });
//     const { error, value } = schema.validate(req.query);
//     if (error) {
//         console.error("Failed to validate params: ", error.message);
//         return res.status(200).json({
//             code: 0,
//             message: error.message,
//         });
//     }
//     try {
//         const videoFolder = path.join(`${basePath}`, value.hash);
//         if (!fs.existsSync(videoFolder)) {
//             return res.status(200).json({
//                 code: 0,
//                 message: `Video folder does not exist.`,
//             });
//         }
//         if (value.vocabImage) {
//             const imageFile = path.join(videoFolder, "vocab_images", value.vocabImage);
//             if (fs.existsSync(imageFile)) {
//                 fs.unlinkSync(imageFile);
//             }
//         }
//         if (value.vocabPronunciation) {
//             const pronunciationFile = path.join(videoFolder, "vocab_pronunciations", value.vocabPronunciation);
//             if (fs.existsSync(pronunciationFile)) {
//                 fs.unlinkSync(pronunciationFile);
//             }
//         }
//         res.status(200).json({
//             code: 1,
//             message: `Succeed.`,
//         });
//     } catch (error: any) {
//         console.error(error);
//         LoggerSystem.error(error.message);
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };

// export const audioConcat = async (req: Request, res: Response) => {
//     const schema = Joi.object({
//         hash: Joi.string().required(),
//     });
//     const { error, value } = schema.validate(req.query);
//     if (error) {
//         console.error("Failed to validate params: ", error.message);
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
//     try {
//         const output = path.join(videoFolder, "concat.mp3");
//         await concatSpeech(videoFolder, output);
//         const stat = fs.statSync(output);
//         const fileSize = stat.size;
//         res.setHeader("Content-Length", fileSize);
//         res.setHeader("Content-Type", "audio/mpeg");
//         const stream = fs.createReadStream(output);
//         stream.pipe(res);
//         res.on("finish", () => {
//             fs.unlinkSync(output);
//         });
//         stream.on("error", (err) => {
//             return res.status(200).json({
//                 code: 0,
//                 message: `Failed.`,
//             });
//         });
//     } catch (error: any) {
//         LoggerSystem.error(error.message);
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };

// export const audioClip = async (req: Request, res: Response) => {
//     const schema = Joi.object({
//         hash: Joi.string().required(),
//         name: Joi.string().required(),
//         start: Joi.number().required(),
//         end: Joi.number().required(),
//     });
//     const { error, value } = schema.validate(req.query);
//     if (error) {
//         console.error("Failed to validate params: ", error.message);
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
//     const audioPath = path.join(videoFolder, `audio.mp3`);
//     if (!fs.existsSync(audioPath)) {
//         return res.status(200).json({
//             code: 0,
//             message: `Audio does not exist.`,
//         });
//     }
//     try {
//         const outputPath = path.join(`${basePath}`, `temp`, `${value.name}.mp3`);
//         await clipAudio(audioPath, value.start, value.end, outputPath);
//         res.status(200).json({
//             code: 1,
//             message: `Succeed.`,
//         });
//     } catch (error: any) {
//         LoggerSystem.error(error.message);
//         return res.status(200).json({
//             code: 0,
//             message: `Failed.`,
//         });
//     }
// };
