import fs, { promises as fsPromise } from "fs";
import path from "path";

export const clear = () => {
    const folderPath = path.join("./", "uploads", "videos");
    fs.readdir(folderPath, (err, files) => {
        if (!err) {
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                fs.unlink(filePath, (err) => {});
            });
        }
    });
};
