import React, { useState } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { ScriptRole } from "../../types/Data";
import "./PanelRoles.scss";

interface Props {
    roles: ScriptRole[];
    open: boolean;
    onCreate?: (name: string) => void;
    onUpdate?: (id: number, name: string) => void;
    onRemove?: (id: number) => void;
    onClose?: () => void;
}

const PanelRoles: React.FC<Props> = ({ roles, open, onCreate, onUpdate, onRemove, onClose }) => {
    const [name, setName] = useState<string>("");
    const handlerRoleCreate = async () => {
        if (name) {
            if (onCreate) {
                setName("");
                onCreate(name);
            }
        }
    };
    const handlerRoleUpdate = (id: number, name: string) => {
        if (name) {
            if (onUpdate) {
                onUpdate(id, name);
            }
        }
    };
    const handlerRoleRemove = (id: number) => {
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
    return (
        <Drawer id="script-panel-roles" title="Edit Roles" width={800} onClose={handlerOnClose} open={open}>
            <div className="role-temp">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Role" />
                <Button icon={<PlusSquareOutlined />} onClick={handlerRoleCreate} />
            </div>
            <div className="roles-list">
                {roles.map((item) => {
                    return (
                        <div key={item.id} className="roles-item">
                            <Input value={item.name} onChange={(e) => handlerRoleUpdate(item.id, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(_) => handlerRoleRemove(item.id)} />
                        </div>
                    );
                })}
            </div>
        </Drawer>
    );
};

export default PanelRoles;
