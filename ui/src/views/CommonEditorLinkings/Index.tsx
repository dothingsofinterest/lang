import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer, Typography } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, ReloadOutlined } from "@ant-design/icons";
import "./Index.scss";

const { Paragraph } = Typography;

interface CommonEditorLinkingsProps {
    open: boolean;
    linkings: string[];
    onClose?: () => void;
    onSubmit?: (linkings: string[]) => void;
}

const CommonEditorLinkings: React.FC<CommonEditorLinkingsProps> = ({ linkings, open, onClose, onSubmit }) => {
    const [tempLinking, setTempLinking] = useState<string>("");
    const [linkingList, setLinkingList] = useState<string[]>(linkings);
    const handlersUpdateTempLinking = (value: string) => {
        setTempLinking(value);
    };
    const handlersSubmitTempLinking = () => {
        const linking = tempLinking.split(" -> ");
        if (linking[0] && linking[1]) {
            const linkingListNew = [...linkingList];
            linkingListNew.unshift(`${tempLinking}`);
            setTempLinking("");
            setLinkingList(linkingListNew);
        }
    };
    const handlersUpdateLinkingItem = (index: number, value: string) => {
        const linkingListNew = linkingList.map((v, k) => (k === index ? value : v));
        setLinkingList(linkingListNew);
    };
    const handlersRemoveLinkingItem = (index: number) => {
        const a = linkingList.slice(0, index);
        const b = linkingList.slice(index);
        b.shift();
        setLinkingList([...a, ...b]);
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    const handlersOnSubmit = () => {
        if (onSubmit !== undefined) {
            onSubmit(linkingList);
        }
        if (onClose !== undefined) {
            setTempLinking("");
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="common-editor-linkings-index" title="Edit Linkings" size="large" onClose={handlersOnClose} open={open}>
            <div className="linking-symbols">
                <div className="line">
                    <Paragraph copyable={{ text: "tə" }}>to ➤ tə</Paragraph>
                    <Paragraph copyable={{ text: "ðer" }}>their ➤ ðer</Paragraph>
                    <Paragraph copyable={{ text: "ðə" }}>the ➤ ðə</Paragraph>
                    <Paragraph copyable={{ text: "ɪf" }}>if ➤ ɪf</Paragraph>
                </div>
                <div className="line">
                    <Paragraph copyable={{ text: "ðæt" }}>that ➤ ðæt</Paragraph>
                    <Paragraph copyable={{ text: "ɪt" }}>it ➤ ɪt</Paragraph>
                    <Paragraph copyable={{ text: "ɪz" }}>is ➤ ɪz</Paragraph>
                    <Paragraph copyable={{ text: "wen" }}>wen ➤ wen</Paragraph>
                </div>
            </div>
            <div className="linking-temp">
                <Input value={tempLinking} onChange={(e) => handlersUpdateTempLinking(e.target.value)} placeholder="to their -> təðer" />
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubmitTempLinking} />
            </div>
            <div className="linkings-list">
                {linkingList.map((v, k) => {
                    return (
                        <div key={k} className="linkings-item">
                            <Input value={v} onChange={(e) => handlersUpdateLinkingItem(k, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersRemoveLinkingItem(k)} />
                        </div>
                    );
                })}
            </div>
            <div className="linkings-submit">
                <Button icon={<ReloadOutlined />} onClick={handlersOnSubmit} />
            </div>
        </Drawer>
    );
};

export default CommonEditorLinkings;
