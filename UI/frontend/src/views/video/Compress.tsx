import { useRef } from "react";
import { APIPrefix } from "../../settings.js";
const Compress = () => {
    const apiUpload = useRef(`${APIPrefix}video/upload`);
    const apiCompress = useRef(`${APIPrefix}video/compress`);
    console.log("----------Compress Component Loaded----------");
    return (
        <>
            <div>
                <h1>Upload</h1>
                <form method="post" action={apiUpload.current} encType="multipart/form-data">
                    <input type="file" name="video" />
                    <input type="submit" />
                </form>
            </div>
            <br /> <br /> <br />
            <div>
                <h1>Compress</h1>
                <form method="get" action={apiCompress.current}>
                    <input type="text" name="video" />
                    <input type="submit" />
                </form>
            </div>
        </>
    );
};
export default Compress;
