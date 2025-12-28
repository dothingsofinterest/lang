import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, ReloadOutlined } from "@ant-design/icons";
import "./EditorScenes.scss";

interface EditorScenesProps {
    scenes: string[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (scenes: string[]) => void;
}

const EditorScenes: React.FC<EditorScenesProps> = ({ scenes, open, onClose, onSubmit }) => {
    const [tempScene, setTempScene] = useState<string>("");
    const [scenesList, setScenesList] = useState<string[]>(scenes);
    const handlersUpdateTempScene = (value: string) => {
        setTempScene(value);
    };
    const handlersSubmitTempScene = () => {
        if (tempScene) {
            const scenesListNew = [...scenesList];
            scenesListNew.unshift(`${tempScene}`);
            setScenesList(scenesListNew);
        }
    };
    const handlersUpdateSceneItem = (index: number, value: string) => {
        const scenesListNew = scenesList.map((v, k) => (k === index ? value : v));
        setScenesList(scenesListNew);
    };
    const handlersRemoveSceneItem = (index: number) => {
        const a = scenesList.slice(0, index);
        const b = scenesList.slice(index);
        b.shift();
        setScenesList([...a, ...b]);
    };
    const handlersOnSubmit = async () => {
        if (onSubmit !== undefined) {
            onSubmit(scenesList);
        }
        if (onClose !== undefined) {
            setTempScene("");
            onClose();
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            setTempScene("");
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="video-script-editor-scenes" title="Edit Scenes" size="large" onClose={handlersOnClose} open={open}>
            <div className="scene-temp">
                <Input value={tempScene} onChange={(e) => handlersUpdateTempScene(e.target.value)} placeholder="Scene-场景" />
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubmitTempScene} />
            </div>
            <div className="scenes-list">
                {scenesList.map((value, k) => {
                    return (
                        <div key={k} className="scenes-item">
                            <Input value={value} onChange={(e) => handlersUpdateSceneItem(k, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersRemoveSceneItem(k)} />
                        </div>
                    );
                })}
            </div>
            <div className="scenes-submit">
                <Button icon={<ReloadOutlined />} onClick={handlersOnSubmit} />
            </div>
        </Drawer>
    );
};

export default EditorScenes;
