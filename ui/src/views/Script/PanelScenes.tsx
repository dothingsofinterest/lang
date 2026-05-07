import React, { useState, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { ScriptScene } from "../../types/Data";
import "./PanelScenes.scss";

interface Props {
    scenes: ScriptScene[];
    open: boolean;
    onCreate?: (name: string) => void;
    onUpdate?: (id: number, name: string) => void;
    onRemove?: (id: number) => void;
    onClose?: () => void;
}

const PanelScenes: React.FC<Props> = ({ scenes, open, onCreate, onUpdate, onRemove, onClose }) => {
    const [name, setName] = useState<string>("");
    const handlerSceneCreate = async () => {
        if (name) {
            if (onCreate) {
                setName("");
                onCreate(name);
            }
        }
    };
    const handlerSceneUpdate = (id: number, name: string) => {
        if (name) {
            if (onUpdate) {
                onUpdate(id, name);
            }
        }
    };
    const handlerSceneRemove = (id: number) => {
        const confirmed = window.confirm("Are you confirmed to delete?");
        if (confirmed) {
            if (onRemove) {
                onRemove(id);
            }
        }
    };
    const handlerOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="script-panel-scenes" title="Edit Scenes" width={800} onClose={handlerOnClose} open={open}>
            <div className="scene-temp">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Scenes" />
                <Button icon={<PlusSquareOutlined />} onClick={handlerSceneCreate} />
            </div>
            <div className="scenes-list">
                {scenes.map((item) => {
                    return (
                        <div key={item.id} className="scenes-item">
                            <Input value={item.name} onChange={(e) => handlerSceneUpdate(item.id, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(_) => handlerSceneRemove(item.id)} />
                        </div>
                    );
                })}
            </div>
        </Drawer>
    );
};

export default PanelScenes;
