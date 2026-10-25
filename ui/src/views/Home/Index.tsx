import { useEffect } from "react";
import { Layout, Button } from "antd";
import { DownloadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { scriptList, scriptUpdate, scriptRead, scriptExportAudio, scriptSentenceList, scriptVocabList } from "../../api/requestAuth";
import { setList } from "../../stores/reducers/catalog";
import { useParams } from "react-router-dom";
import { RootState } from "../../stores";
import { updateScriptId, updateScript, updateScriptSentenceList, updateScriptVocabList } from "../../stores/reducers/script";
import "./Index.scss";
// prettier-ignore
import { 
    updateReadCurSentence, 
    updateVocabMeaningCur, 
    updateVocabMeaningCurIndex, 
    updateVocabListenCur, 
    updateVocabListenCurIndex,
    updateExampleCur, 
    updateExampleCurIndex, 
} from "../../stores/reducers/status";

interface CatalogListParams {
    page: number;
    pageSize: number;
    totalPages: number;
    keyword?: string;
}

const Index = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const catalogList = useSelector((state: RootState) => state.catalog.list);
    const catalogListParams = useSelector((state: RootState) => state.catalog.listParams);
    const catalogCur = catalogList.find((item: any) => item.id == id);
    const handlerExportAudio = async () => {
        try {
            const handle = await await (window as any).showSaveFilePicker({
                suggestedName: `${catalogCur?.name}.mp3`,
                types: [{ description: `${catalogCur?.name}.mp3`, accept: { "audio/mpeg": [".mp3"] } }],
            });
            const writable = await handle.createWritable();
            const resBlob = await scriptExportAudio({ scriptId: id });
            const blob = new Blob([resBlob], { type: "audio/mpeg" });
            await writable.write(blob);
            await writable.close();
        } catch (error) {
            console.error("save error: ", error);
        }
    };
    const handlerAddStudyCount = async () => {
        const confirmed = window.confirm("Do you confirm to do this?");
        if (confirmed) {
            const scriptId = Number(id);
            const item = catalogList.find(({ id }) => id === scriptId);
            if (item) {
                scriptUpdate({ ...item, studyCount: item.studyCount + 1 }).then((res) => {
                    if (res.code === 1) {
                        apiGetCatalog(catalogListParams);
                    } else {
                        alert("Failed.");
                    }
                });
            }
        }
    };
    const apiGetCatalog = async (catalogListParams: CatalogListParams) => {
        const res = await scriptList({
            page: catalogListParams.page,
            pageSize: catalogListParams.pageSize,
            keyword: catalogListParams.keyword,
        });
        if (res.code === 1) {
            dispatch(setList(res.data.list));
        }
    };
    useEffect(() => {
        dispatch(updateScriptId(Number(id)));
        dispatch(updateReadCurSentence(null));
        dispatch(updateVocabMeaningCur(null));
        dispatch(updateVocabMeaningCurIndex(0));
        dispatch(updateVocabListenCur(null));
        dispatch(updateVocabListenCurIndex(0));
        dispatch(updateExampleCur(null));
        dispatch(updateExampleCurIndex(0));
        scriptRead({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                dispatch(updateScript(res.data));
            }
        });
        scriptSentenceList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                dispatch(updateScriptSentenceList(res.data));
            }
        });
        scriptVocabList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                dispatch(updateScriptVocabList(res.data));
            }
        });
    }, [id]);
    return (
        <Layout className="main-inner" id="home-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main">
                <div className="panel">
                    <Button icon={<DownloadOutlined />} onClick={handlerExportAudio} className="btn-brass-dial">
                        Download Audio
                    </Button>
                    <Button icon={<PlusCircleOutlined />} onClick={handlerAddStudyCount} className="btn-brass-dial">
                        Add Study Count({catalogCur?.studyCount})
                    </Button>
                </div>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};

export default Index;
