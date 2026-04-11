import { Layout } from "antd";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import Main from "./Main";
import { updateVideoExampleTranslationMatching } from "../../stores/reducers/status";
import "./Example.scss";

const ExampleTranslation = () => {
    const dispatch = useDispatch();
    const exampleList = useSelector((state: RootState) => state.data.scriptParsed.exampleTranslation);
    const exampleMatching = useSelector((state: RootState) => (state.status.videoExampleTranslationMatching >= exampleList.length ? exampleList.length - 1 : state.status.videoExampleTranslationMatching));
    const handlerOnChangeIndex = (index: number) => {
        dispatch(updateVideoExampleTranslationMatching(index));
    };
    return (
        <Layout className="main-inner" id="example">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <Main displayType={1} list={exampleList} matching={exampleMatching} onChangeIndex={handlerOnChangeIndex} />
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};

export default ExampleTranslation;
