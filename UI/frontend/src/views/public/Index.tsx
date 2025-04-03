import { Link } from "react-router-dom";
import { Flex } from "antd";
import "./Index.scss";
const Index = () => {
    return (
        <Flex style={{ height: "100%", alignItems: "stretch" }}>
            <Link to="/edit" className="item" style={{ backgroundColor: "blue" }}>
                edit
            </Link>
            <Link to="/view" className="item" style={{ backgroundColor: "red" }}>
                view
            </Link>
            <Link to="/clip" className="item" style={{ backgroundColor: "green" }}>
                clip
            </Link>
            <Link to="/video/compress" className="item" style={{ backgroundColor: "purple" }}>
                compress
            </Link>
        </Flex>
    );
};

export default Index;
