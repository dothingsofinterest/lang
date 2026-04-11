import { Layout } from "antd";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import Main from "./Main";
import { updateVideoExampleRecognMatching } from "../../stores/reducers/status";
import "./Example.scss";

const ExampleRecogn = () => {
    const dispatch = useDispatch();
    const exampleList = useSelector((state: RootState) => state.data.scriptParsed.exampleRecogn);
    const exampleMatching = useSelector((state: RootState) => (state.status.videoExampleRecognMatching >= exampleList.length ? exampleList.length - 1 : state.status.videoExampleRecognMatching));
    const handlerOnChangeIndex = (index: number) => {
        dispatch(updateVideoExampleRecognMatching(index));
    };
    return (
        <Layout className="main-inner" id="example">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "64px 0 120px" }}>
                <Main displayType={0} list={exampleList} matching={exampleMatching} onChangeIndex={handlerOnChangeIndex} />
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};

export default ExampleRecogn;
