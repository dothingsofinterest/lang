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
    const handlersUpdateTempLinking = (value: string) => {
        setTempLinking(value);
    };
    const handlersSubmitTempLinking = () => {
        const linking = tempLinking.split(" -> ");
        if (linking[0] && linking[1]) {
            const newLinkings = [...linkings];
            newLinkings.unshift(`${tempLinking}`);
            if (onSubmit !== undefined) {
                onSubmit(newLinkings);
                setTempLinking("");
            }
        }
    };
    const handlersUpdateLinkingItem = (index: number, value: string) => {
        const newLinkings = linkings.map((linking, k) => (k === index ? value : linking));
        if (onSubmit !== undefined) {
            onSubmit(newLinkings);
        }
    };
    const handlersRemoveLinkingItem = (index: number) => {
        const newLinkings = [...linkings];
        const a = newLinkings.slice(0, index);
        const b = newLinkings.slice(index);
        b.shift();
        if (onSubmit !== undefined) {
            onSubmit([...a, ...b]);
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
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
                    <Paragraph copyable={{ text: "əv" }}>of ➤ əv</Paragraph>
                </div>
                <div className="line">
                    <Paragraph copyable={{ text: "wen" }}>when ➤ wen</Paragraph>
                    <Paragraph copyable={{ text: "ɪts" }}>its ➤ ɪts</Paragraph>
                    <Paragraph copyable={{ text: "ɪn" }}>in ➤ ɪn</Paragraph>
                </div>
            </div>
            <div className="linking-temp">
                <Input value={tempLinking} onChange={(e) => handlersUpdateTempLinking(e.target.value)} placeholder="to their -> təðer" />
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubmitTempLinking} />
            </div>
            <div className="linkings-list">
                {linkings.map((v, k) => {
                    return (
                        <div key={Math.random()} className="linkings-item">
                            <Input defaultValue={v} onBlur={(e) => handlersUpdateLinkingItem(k, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersRemoveLinkingItem(k)} />
                        </div>
                    );
                })}
            </div>
        </Drawer>
    );
};

export default CommonEditorLinkings;
