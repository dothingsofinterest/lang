import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { HomeOutlined, CustomerServiceFilled, EditOutlined, ReadFilled, FileWordFilled, GoogleOutlined, HighlightOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../stores";
import PanelVocab from "../Vocabulary/Index";
import PanelGrammar from "../Grammar/Index";
import PanelSentence from "../ScriptSentence/Index";
import "./Nav.scss";

interface RouteItem {
    url: string;
    icon: JSX.Element;
}

const navs: RouteItem[] = [
    { url: "/home", icon: <HomeOutlined /> },
    { url: "/read", icon: <ReadFilled /> },
    { url: "/listen", icon: <CustomerServiceFilled /> },
    { url: "/skeleton", icon: <HighlightOutlined /> },
    { url: "/script", icon: <EditOutlined /> },
];

const Nav = () => {
    const { id } = useParams();
    const catalogFolding = useSelector((state: RootState) => state.status.catalogFolding);
    const { pathname } = useLocation();
    const firstPath = pathname.split("/").filter(Boolean)[0] ?? "";
    const [vocabPanel, setVocabPanel] = useState(false);
    const [grammarPanel, setGrammarPanel] = useState(false);
    const [sentencePanel, setSentencePanel] = useState(false);
    return (
        <nav id="nav" className={catalogFolding ? `folding` : ``}>
            <div className="navs">
                {navs.map((nav, key) => {
                    return (
                        <Link to={`${nav.url}/${Number(id)}`} key={key} className={`item${nav.url.slice(1) === firstPath ? " active" : ""}`}>
                            <Button icon={nav.icon} />
                        </Link>
                    );
                })}
                <div className="item">
                    <Button icon={<UnorderedListOutlined />} onClick={() => setSentencePanel(true)} />
                </div>
                <div className="item">
                    <Button icon={<GoogleOutlined />} onClick={() => setGrammarPanel(true)} />
                </div>
                <div className="item">
                    <Button icon={<FileWordFilled />} onClick={() => setVocabPanel(true)} />
                </div>
            </div>
            <PanelVocab open={vocabPanel} onClose={() => setVocabPanel(false)} />
            <PanelGrammar open={grammarPanel} onClose={() => setGrammarPanel(false)} />
            <PanelSentence open={sentencePanel} onClose={() => setSentencePanel(false)} />
        </nav>
    );
};

export default Nav;
