import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { LoggerSystem } from "../lib/Log";
import { execSync } from "child_process";

const ffmepgBin = process.env.FFMPEG_PATH;
const ffprobeBin = process.env.FFMPEG_FFPROBE_PATH;

// Set FFmpeg base path
ffmpeg.setFfmpegPath(`${ffmepgBin}`);

/*
 * Original Command:
 *
 * ffmpeg -i "input.mp4" -y -vf scale=600:-2 -c:v libx264 -b:v 600k -profile:v baseline -level 3.0 -g 24 -c:a copy -r 24 -video_track_timescale 24 -vsync 1 -shortest -movflags faststart "output.mp4"
 */
export const compressVideo = (input: string, output: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .inputOptions(["-analyzeduration 2147483647", "-probesize 2147483647"]) // 提高分析时长与探测缓冲，防止大文件或长视频探测失败，以提高对大文件或高码率文件的容错能力。
            .videoFilter("scale=600:-2") // -vf scale=600:-2
            .videoCodec("libx264") // -c:v libx264
            .videoBitrate("600k") // -b:v 600k
            .outputOptions([
                "-profile:v baseline", // -profile:v baseline
                "-level 3.0", // -level 3.0
                "-g 24", // -g 24
                "-c:a copy", // -c:a copy
                "-r 24", // -r 24
                "-video_track_timescale 24", // -video_track_timescale 24
                "-vsync 1", // -vsync 1
                "-shortest", // -shortest
                "-movflags faststart", // -movflags faststart
            ])
            .save(output)
            .on("start", (commandLine) => {
                LoggerSystem.info(`fluent-ffmpeg compress video command: ${commandLine}`);
            })
            .on("end", () => {
                LoggerSystem.info("fluent-ffmpeg compress video command succeed");
                resolve();
            })
            .on("error", (err) => {
                LoggerSystem.error(`fluent-ffmpeg error: ${err.message}`);
                reject();
            });
    });
};

/*
 * Extract audio
 *
 * ffmpeg -i input.mp4 -vn -c:a libmp3lame -q:a 2 output.mp3
 *
 * -vn --------------------------------- 禁用视频输出，只保留音频
 * -c:a libmp3lame --------------------- 使用 libmp3lame 编码器，将音频转成 MP3 格式
 * -q:a 2 ------------------------------ 设置音频质量（越小越高质量，范围 0–9，一般推荐 2）
 */
export const extractAudio = (input: string, output: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .noVideo()
            .audioCodec("libmp3lame")
            .audioQuality(2)
            .save(output)
            .on("start", (commandLine) => {
                LoggerSystem.info(`fluent-ffmpeg extractAudio command: ${commandLine}`);
            })
            .on("end", () => {
                LoggerSystem.info(`fluent-ffmpeg extractAudio command succeed`);
                resolve();
            })
            .on("error", (err) => {
                LoggerSystem.error(`fluent-ffmpeg error: ${err.message}`);
                reject();
            });
    });
};

/*
 * Clip Audio
 *
 * ffmpeg -i audio.mp3 -ss 643.64 -to 644.21 output.mp3
 */
export const clipAudio = (input: string, startTime: number, endTime: number, output: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .audioCodec("libmp3lame") // recode
            .save(output)
            .on("start", (commandLine) => {
                LoggerSystem.info(`✅ fluent-ffmpeg clip audio command: ${commandLine}`);
            })
            .on("end", () => {
                LoggerSystem.info("✅ fluent-ffmpeg clip audio command succeed");
                resolve();
            })
            .on("error", (err) => {
                LoggerSystem.error(`fluent-ffmpeg error: ${err.message}`);
                reject();
            });
    });
};

/*
 * Enhance Dialogue and Extract audio
 *
 * ffmpeg -analyzeduration 2147483647 -probesize 2147483647 -i input.mp4 \
 * -ac 2 \
 * -af "highpass=f=200, lowpass=f=3000, acompressor=threshold=-30dB:ratio=7:attack=5:release=200:makeup=12, equalizer=f=1000:t=q:w=1:g=6, loudnorm=I=-16:TP=-1.5:LRA=11" \
 * -vn
 * -c:a libmp3lame \
 * -q:a 2 \
 * output.mp3
 *
 * -analyzeduration -probesize --------- 提高分析时长与探测缓冲，防止大文件或长视频探测失败，以提高对大文件或高码率文件的容错能力。
 * highpass=f=200 ---------------------- 去掉低频（如风声、隆隆声）
 * lowpass=f=3000 ---------------------- 去掉高频嘶嘶声和背景噪音
 * acompressor ------------------------- 压制大音量背景，让对白浮上来
 * equalizer=f=1000:g=6	---------------- 强调 1kHz 附近的人声频率
 * loudnorm	---------------------------- 最后平衡整体响度，防止爆音
 * -vn --------------------------------- 禁用视频输出，只保留音频
 * -c:a libmp3lame --------------------- 使用 libmp3lame 编码器，将音频转成 MP3 格式
 * -q:a 2 ------------------------------ 设置音频质量（越小越高质量，范围 0–9，一般推荐 2）
 */
export const enhanceDialogueAndExtractMP3 = (input: string, output: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .inputOptions(["-analyzeduration", "2147483647", "-probesize", "2147483647"])
            .audioChannels(2)
            .audioFilters(["highpass=f=200", "lowpass=f=3000", "acompressor=threshold=-30dB:ratio=7:attack=5:release=200:makeup=12", "equalizer=f=1000:t=q:w=1:g=6", "loudnorm=I=-16:TP=-1.5:LRA=11"])
            .noVideo()
            .audioCodec("libmp3lame")
            .audioQuality(2)
            .save(output)
            .on("start", (commandLine) => {
                LoggerSystem.info(`fluent-ffmpeg enhanceDialogueAndExtractMP3 command: ${commandLine}`);
            })
            .on("end", () => {
                LoggerSystem.info(`fluent-ffmpeg enhanceDialogueAndExtractMP3 command succeed.`);
                resolve();
            })
            .on("error", (err) => {
                LoggerSystem.error(`fluent-ffmpeg error: ${err.message}`);
                reject();
            });
    });
};

/*
 * Concat audio
 *
 * ffmpeg -i audio.mp3 -i vocab_pronunciations/a_pair_of_c05803e.mp3 -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[a]" -map "[a]" -c:a libmp3lame -b:a 192k output.mp3
 *
 * [0:a][1:a]
 * 0:a → 第 1 个文件的音频流
 * 1:a → 第 2 个文件的音频流
 *
 * concat=n=2:v=0:a=1
 * n=2 → 拼接 2 段音频
 * v=0 → 没有视频
 * a=1 → 输出一条音频流
 *
 * [a] 表示刚刚拼接出来的音频流 [a] 输出到最终文件
 */
export const concatAudio = (planFolder: string, output: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(planFolder)) {
            const pronunciationsFolder = path.join(planFolder, "vocab_pronunciations");
            const pronunciations = fs
                .readdirSync(pronunciationsFolder)
                .filter((f) => f.endsWith(".mp3"))
                .map((f) => path.join(pronunciationsFolder, f));
            if (pronunciations.length > 0) {
                const command = ffmpeg();
                command.input(path.join(planFolder, "audio.mp3"));
                pronunciations.forEach((p) => command.input(p));
                command
                    .noVideo()
                    .complexFilter([
                        {
                            filter: "concat",
                            options: { n: pronunciations.length, v: 0, a: 1 },
                            inputs: pronunciations.map((_, i) => `${i}:a`),
                            outputs: "a",
                        },
                    ])
                    .outputOptions(["-map [a]", "-c:a libmp3lame", "-b:a 192k"])
                    .save(output)
                    .on("start", (commandLine) => {
                        LoggerSystem.info(`fluent-ffmpeg concatAudio command: ${commandLine}`);
                    })
                    .on("end", () => {
                        LoggerSystem.info("✅ fluent-ffmpeg concatAudio command succeed");
                        resolve();
                    })
                    .on("error", (err) => {
                        LoggerSystem.error(`fluent-ffmpeg error: ${err.message}`);
                        reject();
                    });
            }
        }
    });
};

/*
 * Alpha Background Video
 * 1080x1920 尺寸下
 * Font Family: EN-Bebas Neue / CN-ZCOOL QingKe HuangYou
 * Font Size: 52 / 50
 * From Top: 40 / 100
 * Border: 10
 */
export const generateAlphaBgVideo = (duration: number, output: string): void => {
    try {
        const command = `"${ffmepgBin}" -y -f lavfi -i color=c=0x00000000:s=1080x1920 -t ${duration} -an "${output}"`;
        execSync(command, { encoding: "utf8" });
        console.log("Generating alpha background video completed: ", command);
    } catch (error) {
        console.error(`Failed to generate alpha bg video: ${(error as Error).message}`);
        throw new Error(`Failed to generate alpha bg video: ${(error as Error).message}`);
    }
};

/*
 * Background With Title
 * 1080x1920 尺寸下
 * Font Family: EN-Bebas Neue / CN-ZCOOL QingKe HuangYou
 * Font Size: 52 / 50
 * From Top: 40 / 100
 * Border: 10
 */
export const generateBlueBgVideo = (duration: number, output: string, title: string[]): void => {
    try {
        const command = `${ffmepgBin} -y -f lavfi -i color=c=0x002A51:s=1080x1920 -t ${duration} -an \"${output}\"`;
        const commandTitle = `${ffmepgBin} -y -f lavfi -i color=c=0x002A51:s=1080x1920 -t ${duration} -vf "\
    drawtext=\
    fontfile='Bebas Neue':\
    text='${filterOptionText(title[0])}':\
    borderw=10:\
    bordercolor=black:\
    fontcolor=white:\
    fontsize=52:\
    x=(w-text_w)/2:\
    y=40,\
    drawtext=\
    fontfile='ZCOOL QingKe HuangYou':\
    text='${filterOptionText(title[1])}':\
    borderw=10:\
    bordercolor=black:\
    fontcolor=white:\
    fontsize=50:\
    x=(w-text_w)/2:\
    y=100" \
    -an \"${output}\"`;
        execSync(title.length === 2 ? commandTitle : command, { encoding: "utf8" });
        console.log("Generating blue background video completed: ", command);
    } catch (error) {
        console.error(`Failed to generate blue bg video: ${(error as Error).message}`);
        throw new Error(`Failed to generate blue bg video: ${(error as Error).message}`);
    }
};

/*
 * Get Duration
 *
 * ffprobe -i "input.mp4" -show_entries format=duration -v quiet -of csv=p=0
 */
export const getDuration = (input: string): number => {
    try {
        const command = `${ffprobeBin} -i \"${input}\" -show_entries format=duration -v quiet -of csv=p=0`;
        const duration = execSync(command, { encoding: "utf8" }).trim();
        return parseFloat(duration) || 0;
    } catch (error) {
        console.error(`Failed to get duration: ${(error as Error).message}`);
        throw new Error(`Failed to get duration: ${(error as Error).message}`);
    }
};

/*
 * Whether or not a video require to be compressd
 */
export const compressVideoBefore = (input: string): boolean => {
    try {
        const command = `${ffprobeBin} -v error -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "${input}"`;
        const stdout = execSync(command);
        const width = stdout.toString().trim();
        console.log("Frame Width:", width);
        const command2 = `${ffprobeBin} -v error -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "${input}"`;
        const stdout2 = execSync(command2);
        const bitrate = stdout2.toString().trim();
        const videoBitrate = bitrate.split("\n")[0];
        console.log("Data Rate:", videoBitrate);
        if (parseInt(width) < 800 || parseInt(videoBitrate) < 600000) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error(`compressVideoBefore: ${(error as Error).message}`);
        throw new Error(`compressVideoBefore: ${(error as Error).message}`);
    }
};

/*
 * Generate Subtitle for Video
 *
 * ffmpeg -y -i "input.mp4" -vf "ass='test.ass'" -c:a copy "output_ass.mp4"
 * ffmpeg -y -i "D:/Github/lang/server/api/data/1743851933073/origin_bg.mp4" -vf "ass='D\:/Github/lang/server/api/data/1743851933073/origin.ass'" -c:a copy "D:/Github/lang/server/api/data/1743851933073/origin_bg_ass.mp4"
 */
export const rasterizeSubtitleOnVideo = (inputVideo: string, inputASS: string, output: string): void => {
    try {
        const command = `${ffmepgBin} -y -i \"${inputVideo}\" -vf "ass='${inputASS.replace(":", "\\:")}'" -c:a copy \"${output}\"`;
        execSync(command, { encoding: "utf8" });
        console.log("rasterizing subtitle on video completed.", command);
    } catch (error) {
        console.error(`Failed to rasterizing subtitle: ${(error as Error).message}`);
        throw new Error(`Failed to rasterizing subtitle: ${(error as Error).message}`);
    }
};

/*
 * Generate Subtitle for Frame
 */
export const rasterizeSubtitleOnFrame = (inputVideo: string, inputASS: string, output: string): void => {
    try {
        const dirPath = path.dirname(output);
        const commandFrame = `${ffmepgBin} -y -ss 00:00:05 -i \"${inputVideo}\" -frames:v 1 \"${dirPath}/origin_frame.png\"`;
        const command = `${ffmepgBin} -y -i \"${dirPath}/origin_frame.png\" -vf "ass='${inputASS.replace(":", "\\:")}'" \"${output}\"`;
        execSync(commandFrame, { encoding: "utf8" });
        execSync(command, { encoding: "utf8" });
        console.log("rasterizing subtitle on frame completed.", command);
    } catch (error) {
        console.error(`Failed to rasterizing subtitle: ${(error as Error).message}`);
        throw new Error(`Failed to rasterizing subtitle: ${(error as Error).message}`);
    }
};

/*
 * Copy video simplyly
 *
 * ffmpeg -i input.mp4 -c copy output.mp4
 */
export const copyVideo = (input: string, output: string): void => {
    try {
        const command = `${ffmepgBin} -y -i \"${input}\" -c copy \"${output}\"`;
        execSync(command, { encoding: "utf8" });
        console.log("Copying video completed.");
    } catch (error) {
        console.error(`Failed to copy video: ${(error as Error).message}`);
        throw new Error(`Failed to copy video: ${(error as Error).message}`);
    }
};

export const filterOptionText = (text: string) => {
    let reStr = ``;
    const regDoubleQuote = /\"+/g;
    const regSingleQuote = /\'+/g;
    reStr = text.replace(regDoubleQuote, "");
    reStr = reStr.replaceAll(regSingleQuote, "");
    return reStr;
};
