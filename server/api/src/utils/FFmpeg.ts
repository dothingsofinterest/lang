import ffmpeg from "fluent-ffmpeg";
import { LoggerSystem } from "../lib/Log";
import { execSync } from "child_process";

const ffmepgBin = process.env.FFMPEG_PATH;
const ffprobeBin = process.env.FFMPEG_FFPROBE_PATH;

/*
 * Original Command:
 *
 * ffmpeg -i "input.mp4" -y -vf scale=600:-2 -c:v libx264 -b:v 600k -profile:v baseline -level 3.0 -g 24 -c:a copy -r 24 -video_track_timescale 24 -vsync 1 -shortest -movflags faststart "output.mp4"
 */
export const compressVideo = (input: string, output: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || "");
        ffmpeg(input)
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
                console.log("fluent-ffmpeg compress video command: ", commandLine);
                LoggerSystem.info(commandLine);
            })
            .on("end", () => {
                console.log("fluent-ffmpeg: succeed to compress video.");
                resolve();
            })
            .on("error", (err) => {
                console.error(`fluent-ffmpeg error: ${err.message}`);
                reject();
            });
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
 * ffmpeg -y -i "D:/Github/lang/server/api/uploads/1743851933073/origin_bg.mp4" -vf "ass='D\:/Github/lang/server/api/uploads/1743851933073/origin.ass'" -c:a copy "D:/Github/lang/server/api/uploads/1743851933073/origin_bg_ass.mp4"
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
        const commandFrame = `${ffmepgBin} -y -ss 00:00:05 -i \"${inputVideo}\" -frames:v 1 origin_frame.png`;
        console.log("commandFrame", commandFrame);
        const command = `${ffmepgBin} -y -i origin_frame.png -vf "ass='${inputASS.replace(":", "\\:")}'" \"${output}\"`;
        console.log("command", command);
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
