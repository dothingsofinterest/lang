import { useEffect, useState } from "react";
import { Layout, Button } from "antd";
// prettier-ignore
import { 
    scriptRead, 
    scriptSentenceList, 
    scriptVocabList,
    scriptExampleSentenceList
} from "../../api/requestAuth";
import { useDispatch } from "react-redux";
// prettier-ignore
import { 
    updateScriptId, 
    updateScript, 
    updateScriptSentenceList, 
    updateScriptVocabList,
    updateScriptExampleSentenceList 
} from "../../stores/reducers/script";
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
import { useParams } from "react-router-dom";

const Index = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
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
        scriptExampleSentenceList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                dispatch(updateScriptExampleSentenceList(res.data));
            }
        });
    }, [id]);
    return (
        <Layout className="main-inner" id="vocab-meaning-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main"></div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};

export default Index;
