import { Link } from "react-router-dom";
import { Layout, Input, Button, Upload } from "antd";
import { EyeFilled, TranslationOutlined, ExpandOutlined, SettingFilled, CustomerServiceFilled, ProfileFilled, ReadFilled, BulbFilled, EditFilled } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { PlusCircleOutlined, UploadOutlined, DownloadOutlined, LineChartOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Video as DataVideo } from "../../types/Data";
import { videoList, videoCreate } from "../../api/requestAuth";
import { useSelector, useDispatch } from "react-redux";
import { updateLoadingUploadVideo, updateLoadingImportData } from "../../stores/reducers/status";
import { updateVideoURL, updateVideoAudioWaverURL, updateVideoAudioURL } from "../../stores/reducers/video";
import { useParams } from "react-router-dom";
import "./Menu.scss";

interface RouteItem {
    url: string;
    icon: JSX.Element;
}

interface ListParams {
    page: number;
    pageSize: number;
    totalPages: number;
    keyword?: string;
}

const routes: RouteItem[] = [
    { url: "/settings", icon: <SettingFilled /> },
    { url: "/video-script", icon: <ProfileFilled /> },
    { url: "/following", icon: <ReadFilled /> },
    { url: "/vocab-listen", icon: <CustomerServiceFilled /> },
    { url: "/vocab-watch", icon: <EyeFilled /> },
    { url: "/vocab-meaning", icon: <BulbFilled /> },
    { url: "/example-recogn", icon: <ExpandOutlined /> },
    { url: "/example-translation", icon: <TranslationOutlined /> },
    { url: "/impression", icon: <EditFilled /> },
];
const Menu = () => {
    const { id } = useParams();
    const videoId = Number(id);
    console.log("id22", id);
    const location = useLocation();
    const dispatch = useDispatch();
    console.log(location);
    const [list, setList] = useState<DataVideo[]>([]);
    const [listParams, setListParams] = useState<ListParams>({ page: 1, pageSize: 10, totalPages: 0 });
    const handlerImportVideo = async (file: any) => {
        if (/^(.+?)\.(mp4)$/g.test(file.name) && file.type === "video/mp4") {
            dispatch(updateLoadingUploadVideo(1));
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await videoCreate(formData);
                if (res.code === 1) {
                    dispatch(updateVideoURL(URL.createObjectURL(file)));
                    dispatch(updateVideoAudioWaverURL("audiowaveform.json"));
                } else {
                    alert(res.message);
                }
                dispatch(updateLoadingUploadVideo(0));
            } catch (e: any) {
                alert(e.message);
                dispatch(updateLoadingUploadVideo(0));
            }
        } else {
            alert("Please upload mp4 format video.");
        }
        return false;
    };
    const apiGetVideoList = async (listParams: ListParams) => {
        const res = await videoList({
            page: listParams.page,
            pageSize: listParams.pageSize,
            keyword: listParams.keyword,
        });
        if (res.code === 1) {
            setList(res.data.list);
            setListParams(res.data.listParams);
        }
    };
    useEffect(() => {
        apiGetVideoList(listParams);
        return () => {};
    }, []);
    return (
        <aside id="menu">
            <Upload className="create-btn" showUploadList={false} beforeUpload={handlerImportVideo}>
                <Button icon={<PlusCircleOutlined />} />
            </Upload>
            {list.map((item, key) => {
                return (
                    <Link to={`/read/${item.id}`} key={key} className={item.id === videoId ? `menu-item active` : `menu-item`}>
                        {item.name}
                    </Link>
                );
            })}
        </aside>
    );
};

export default Menu;
