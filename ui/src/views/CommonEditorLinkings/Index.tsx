import React, { useState, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import CommonPronunciationSymbols from "../Public/PronunciationSymbols";
import "./Index.scss";

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
            <CommonPronunciationSymbols />
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
