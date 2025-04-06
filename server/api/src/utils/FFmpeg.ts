import ffmpeg from "fluent-ffmpeg";
import { SystemLogger } from "../lib/Log";
import { execSync } from "child_process";

/*
 * Original Command:
 *
 * ffmpeg -i "input.mp4" -y -vf scale=600:-2 -c:v libx264 -b:v 600k -profile:v baseline -level 3.0 -g 24 -c:a copy -r 24 -video_track_timescale 24 -vsync 1 -shortest -movflags faststart "output.mp4"
 */
export const compressVideo = (input: string, output: string) => {
    return new Promise((resolve, reject) => {
        // If do not set ffmpeg env variable
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
                SystemLogger.info(commandLine);
            })
            .on("end", () => {
                console.log("fluent-ffmpeg succeed.");
                resolve("");
            })
            .on("error", (err) => {
                console.error(`fluent-ffmpeg error: ${err.message}`);
                reject(err);
            });
    });
};

/*
 * Background Video
 */
export const generateBgVideo = async (duration: number, title: string[], output: string) => {
    return new Promise((resolve, reject) => {
        const command = `${process.env.FFMPEG_PATH} -y -f lavfi -i color=c=0x002A51:s=2160x3840 -t ${duration} -vf "\
drawtext=\
fontfile='Bebas Neue':\
text='${filterOptionText(title[0])}':\
borderw=10:\
bordercolor=0xDC1735:\
fontcolor=white:\
fontsize=95:\
x=(w-text_w)/2:\
y=80,\
drawtext=\
fontfile='ZCOOL QingKe HuangYou':\
text='${filterOptionText(title[1])}':\
borderw=10:\
bordercolor=0xDC1735:\
fontcolor=white:\
fontsize=95:\
x=(w-text_w)/2:\
y=184" \
-an \"${output}\"`;
        execSync(command, { encoding: "utf8" });
        console.log("Generating background video completed: ", command);
        resolve("");
    });
};

/*
 * Original Command:
 *
 * ffprobe -i "input.mp4" -show_entries format=duration -v quiet -of csv=p=0
 */
export const getDuration = async (input: string) => {
    return new Promise((resolve, reject) => {
        const command = `${process.env.FFMPEG_FFPROBE_PATH} -i \"${input}\" -show_entries format=duration -v quiet -of csv=p=0`;
        const duration = execSync(command, { encoding: "utf8" }).trim();
        resolve(parseFloat(duration) || 0);
    });
};

/*
 * If video require to be compressd
 */
export const compressVideoBefore = async (input: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const command = `${process.env.FFMPEG_FFPROBE_PATH} -v error -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "${input}"`;
        const stdout = execSync(command);
        const width = stdout.toString().trim();
        console.log("Frame Width:", width);
        const command2 = `${process.env.FFMPEG_FFPROBE_PATH} -v error -show_entries stream=bit_rate -of default=noprint_wrappers=1:nokey=1 "${input}"`;
        const stdout2 = execSync(command2);
        const bitrate = stdout2.toString().trim();
        const videoBitrate = bitrate.split("\n")[0];
        console.log("Data Rate:", videoBitrate);
        if (parseInt(width) < 800 || parseInt(videoBitrate) < 600000) {
            resolve(false);
        } else {
            resolve(true);
        }
    });
};

/*
 * Original Command:
 *
 * ffmpeg -y -i "input.mp4" -vf "ass='test.ass'" -c:a copy "output_ass.mp4"
 * ffmpeg -y -i "D:/Github/lang/server/api/uploads/1743851933073/origin_bg.mp4" -vf "ass='D\:/Github/lang/server/api/uploads/1743851933073/origin.ass'" -c:a copy "D:/Github/lang/server/api/uploads/1743851933073/origin_bg_ass.mp4"
 */
export const bakeSubtitle = async (input: string, output: string, assFile: string) => {
    return new Promise((resolve, reject) => {
        const command = `${process.env.FFMPEG_PATH} -y -i \"${input}\" -vf "ass='${assFile.replace(":", "\\:")}'" -c:a copy \"${output}\"`;
        execSync(command, { encoding: "utf8" });
        console.log("Baking subtitle completed.");
        resolve("");
    });
};

/*
 * Original Command:
 *
 * ffmpeg -i input.mp4 -c copy output.mp4
 */
export const copyVideo = async (input: string, output: string) => {
    return new Promise((resolve, reject) => {
        const command = `${process.env.FFMPEG_PATH} -y -i \"${input}\" -c copy \"${output}\"`;
        execSync(command, { encoding: "utf8" });
        console.log("Copying video completed.");
        resolve("");
    });
};

export const filterOptionText = (text: string) => {
    let reStr = ``;
    const regDoubleQuote = /\"+/g;
    const regSingleQuote = /\'+/g;
    reStr = text.replace(regDoubleQuote, "");
    reStr = reStr.replaceAll(regSingleQuote, "");
    return reStr;
};
