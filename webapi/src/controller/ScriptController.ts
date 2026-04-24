import fs from "fs";
import Joi from "joi";
import path from "path";
import { Request, Response } from "express";
import { LoggerSystem } from "../lib/Log";
import Database from "better-sqlite3";
import { getPagination } from "../utils/Page";
import { enhanceDialogueAndExtractMP3, extractAudio } from "../utils/FFmpeg";
import { waveformCreate as waveformCreateService } from "../service/BBCAudioWaveform";

const dataPath = process.env.DATA_PATH;
const dbFile = path.join(`${dataPath}`, `${process.env.DATA_DATABASE}`);
const db = new Database(dbFile);

interface Video {
    id: number;
    name: string;
}

interface Scene {
    id: number;
    video_id: number;
    name: string;
}

interface Role {
    id: number;
    video_id: number;
    name: string;
}

interface Paragraph {
    id: number;
    video_id: number;
    scene_id: number;
    role_id: number;
}

interface Sentence {
    id: number;
    paragraph_id: number;
    start_time: number;
    end_time: number;
    text: string;
}

export const detail = (req: Request, res: Response) => {
    const schema = Joi.object({
        videoId: Joi.number().required(),
    });
    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(200).json({
            code: 0,
            message: error.message,
        });
    }
    try {
        // prettier-ignore
        const video = db.prepare<[number], Video>(`
            SELECT id, name FROM \`video\` 
            WHERE id = ?
        `).get(value.videoId);
        if (!video) {
            return res.status(200).json({
                code: 0,
                message: `Failed`,
            });
        }

        // prettier-ignore
        const roles = db.prepare<[number], Role>(`
                SELECT id, video_id, name FROM \`role\` 
                WHERE video_id = ?
            `).all(value.videoId);
        const roleMap = new Map<number, { id: number; name: string }>();
        roles.forEach((s: Role) => roleMap.set(s.id, s));

        // prettier-ignore
        const scenes = db.prepare<[number], Scene>(`
            SELECT id, video_id, name FROM \`scene\` 
            WHERE video_id = ?
        `).all(value.videoId);
        const sceneMap = new Map<number, { id: number; name: string }>();
        scenes.forEach((s: Scene) => sceneMap.set(s.id, s));

        // prettier-ignore
        const paragraphs = db.prepare<[number], Paragraph>(`
            SELECT id, video_id, scene_id, role_id FROM \`paragraph\` 
            WHERE video_id = ?
        `).all(value.videoId);
        const paragraphIds = paragraphs.map((p: any) => p.id);

        // prettier-ignore
        const sentences = db.prepare<[...number[]], Sentence>(`
            SELECT id, paragraph_id, start_time, end_time, text
            FROM sentence
            WHERE paragraph_id IN (${paragraphIds.map(() => "?").join(",")})
            ORDER BY id ASC
        `).all(...paragraphIds);
        const sentenceMap = new Map<number, { id: number; startTime: number; endTime: number; text: string }[]>();
        sentences.forEach((s: Sentence) => {
            if (!sentenceMap.has(s.paragraph_id)) {
                sentenceMap.set(s.paragraph_id, []);
            }
            sentenceMap.get(s.paragraph_id)!.push({
                id: s.id,
                startTime: s.start_time,
                endTime: s.end_time,
                text: s.text,
            });
        });

        const dataMap = new Map<number, { name: string; paragraphs: Sentence[] }>();
        paragraphs.forEach((p: Paragraph) => {
            const sceneId = p.scene_id ? p.scene_id : 0;
            if (!dataMap.has(sceneId)) {
                dataMap.set(sceneId, {
                    name: sceneMap.get(sceneId)?.name || "",
                    paragraphs: [],
                });
            }
            dataMap.get(sceneId)!.paragraphs.push({
                id: p.id,
                sentences: sentenceMap.get(p.id) || [],
            });
        });

        res.status(200).json({
            code: 1,
            message: `Succeed`,
            data: {
                videoId: video.id,
                title: video.name,
                scenes: Array.from(dataMap.values()),
            },
        });
    } catch (error: any) {
        LoggerSystem.error(error.message);
        return res.status(200).json({
            code: 0,
            message: `Failed`,
        });
    }
};
