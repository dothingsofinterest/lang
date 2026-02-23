import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusSquareOutlined, ReloadOutlined } from "@ant-design/icons";
import { Scene as DataScene } from "../../types/Data";
import { fnRandom } from "../../utils/util";
import "./EditorScenes.scss";

interface EditorScenesProps {
    scenes: DataScene[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (scenes: DataScene[]) => void;
}

const EditorScenes: React.FC<EditorScenesProps> = ({ scenes, open, onClose, onSubmit }) => {
    const [tempScene, setTempScene] = useState<DataScene | null>(null);
    const handlersUpdateTempScene = (value: string) => {
        const excluded = scenes.map((scene) => scene.index);
        const index = fnRandom(0, 65535, excluded);
        setTempScene({ index, value });
    };
    const handlersSubmitTempScene = () => {
        if (tempScene?.index && tempScene?.value) {
            const newScenes = [...scenes];
            newScenes.unshift(tempScene);
            if (onSubmit !== undefined) {
                onSubmit(newScenes);
                setTempScene(null);
            }
        }
    };
    const handlersUpdateSceneItem = (index: number, value: string) => {
        const newScenes = scenes.map((scene) => (scene.index === index ? { ...scene, value: value } : scene));
        if (onSubmit !== undefined) {
            onSubmit(newScenes);
        }
    };
    const handlersRemoveSceneItem = (index: number) => {
        const newScenes = scenes.filter((scene) => scene.index !== index);
        if (onSubmit !== undefined) {
            onSubmit(newScenes);
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            setTempScene(null);
            onClose();
        }
    };
    const handlersIndexPlus = (index: number) => {
        const newScenes = [...scenes];
        const a = newScenes.slice(0, index);
        const b = newScenes.slice(index);
        const upOne = a.pop();
        const theOne = b.shift();
        if (theOne) {
            a.push(theOne);
        }
        if (upOne) {
            b.unshift(upOne);
        }
        if (onSubmit !== undefined) {
            onSubmit([...a, ...b]);
        }
    };
    const handlersIndexMinus = (index: number) => {
        const newScenes = [...scenes];
        const a = newScenes.slice(0, index);
        const b = newScenes.slice(index);
        const theOne = b.shift();
        const downOne = b.shift();
        if (theOne) {
            b.unshift(theOne);
        }
        if (downOne) {
            b.unshift(downOne);
        }
        if (onSubmit !== undefined) {
            onSubmit([...a, ...b]);
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="video-script-editor-scenes" title="Edit Scenes" width={800} onClose={handlersOnClose} open={open}>
            <div className="scene-temp">
                <Input value={tempScene?.value} onChange={(e) => handlersUpdateTempScene(e.target.value)} placeholder="Scene-场景" />
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubmitTempScene} />
            </div>
            <div className="scenes-list">
                {scenes.map((scene, k) => {
                    return (
                        <div key={scene.index} className="scenes-item">
                            <Input defaultValue={scene.value} onBlur={(e) => handlersUpdateSceneItem(scene.index, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersRemoveSceneItem(scene.index)} />
                            <Button icon={<ArrowUpOutlined />} onClick={(e) => handlersIndexPlus(k)} />
                            <Button icon={<ArrowDownOutlined />} onClick={(e) => handlersIndexMinus(k)} />
                        </div>
                    );
                })}
            </div>
        </Drawer>
    );
};

export default EditorScenes;
