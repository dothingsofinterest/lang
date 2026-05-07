import { Link } from "react-router-dom";
import { Button, Upload, Input } from "antd";
import { PlusCircleOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { Script as DataScript } from "../../types/Data";
import { videoList, videoCreate } from "../../api/requestAuth";
import { useParams } from "react-router-dom";
import { updateCatalogFolding } from "../../stores/reducers/status";
import { Scrollbars } from "react-custom-scrollbars-2";
import "./Catalog.scss";

interface ListParams {
    page: number;
    pageSize: number;
    totalPages: number;
    keyword?: string;
}

const Catalog = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const catalogFolding = useSelector((state: RootState) => state.status.catalogFolding);
    const [list, setList] = useState<DataScript[]>([]);
    const [listParams, setListParams] = useState<ListParams>({ page: 1, pageSize: 100, totalPages: 0, keyword: "" });
    const handlerCreate = async (file: any) => {
        if (/^(.+?)\.(mp4)$/g.test(file.name) && file.type === "video/mp4") {
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await videoCreate(formData);
                if (res.code !== 1) {
                    alert(res.message);
                }
            } catch (e: any) {
                alert(e.message);
            }
        } else {
            alert("Please upload mp4 format video.");
        }
        return false;
    };
    const handlerSearch = async (value: string) => {
        const listParamsNew = { ...listParams, keyword: value };
        setListParams(listParamsNew);
        apiGetList(listParamsNew);
    };
    const handlerMenuFold = () => {
        dispatch(updateCatalogFolding(!catalogFolding));
    };
    const apiGetList = async (listParams: ListParams) => {
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
        apiGetList(listParams);
    }, []);
    return (
        <aside id="catalog" className={catalogFolding ? `folding` : ``}>
            <Upload className="create-btn" showUploadList={false} beforeUpload={handlerCreate}>
                <Button icon={<PlusCircleOutlined />} />
            </Upload>
            <div className="search">
                <Input className="search-btn" value={listParams.keyword} onChange={(e) => handlerSearch(e.target.value)} allowClear />
                <Button icon={<MenuFoldOutlined />} onClick={handlerMenuFold} />
            </div>
            <Scrollbars className="menu" style={{ height: "calc(100vh - 100px)" }}>
                {list.map((item, key) => {
                    return (
                        <Link to={`/home/${item.id}`} key={key} className={item.id === Number(id) ? `item active` : `item`}>
                            {catalogFolding ? `` : `[${item.studyCount}] ${item.name}`}
                        </Link>
                    );
                })}
            </Scrollbars>
        </aside>
    );
};

export default Catalog;
