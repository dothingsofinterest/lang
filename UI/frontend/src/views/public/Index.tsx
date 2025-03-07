import { Layout } from "antd";
import { Link } from "react-router-dom";
import "./Index.scss";
const { Header, Footer, Sider, Content } = Layout;
const Video = () => {
    return (
        <Layout>
            <Header>
                <div className="logo">Logo</div>
                <div className="nav">
                    <ul>
                        <li>nav1</li>
                        <li>nav2</li>
                    </ul>
                </div>
            </Header>
            <Layout className="body">
                <Sider>
                    <ul>
                        <li>
                            <Link to="/video">Video</Link>
                        </li>
                        <li>aa</li>
                        <li>bb</li>
                    </ul>
                </Sider>
                <Content>Content</Content>
            </Layout>
            <Footer>
                <div className="main">Footer</div>
            </Footer>
        </Layout>
    );
};

export default Video;
