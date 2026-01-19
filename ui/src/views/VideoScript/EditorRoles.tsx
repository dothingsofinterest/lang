import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, ReloadOutlined } from "@ant-design/icons";
import "./EditorRoles.scss";

interface EditorRolesProps {
    roles: string[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (roles: string[]) => void;
}

const EditorRoles: React.FC<EditorRolesProps> = ({ roles, open, onClose, onSubmit }) => {
    const [tempRole, setTempRole] = useState<string>("");
    const handlersUpdateTempRole = (value: string) => {
        setTempRole(value);
    };
    const handlersSubmitTempRole = () => {
        if (tempRole) {
            const newRoles = [...roles];
            newRoles.unshift(`${tempRole}`);
            if (onSubmit !== undefined) {
                onSubmit(newRoles);
                setTempRole("");
            }
        }
    };
    const handlersUpdateRoleItem = (index: number, value: string) => {
        const newRoles = roles.map((v, k) => (k === index ? value : v));
        if (onSubmit !== undefined) {
            onSubmit(newRoles);
        }
    };
    const handlersRemoveRoleItem = (index: number) => {
        const newRoles = [...roles];
        const a = newRoles.slice(0, index);
        const b = newRoles.slice(index);
        b.shift();
        if (onSubmit !== undefined) {
            onSubmit([...a, ...b]);
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            setTempRole("");
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="video-script-editor-roles" title="Edit Roles" size="large" onClose={handlersOnClose} open={open}>
            <div className="role-temp">
                <Input value={tempRole} onChange={(e) => handlersUpdateTempRole(e.target.value)} placeholder="Role-角色" />
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubmitTempRole} />
            </div>
            <div className="roles-list">
                {roles.map((value, k) => {
                    return (
                        <div key={value} className="roles-item">
                            <Input defaultValue={value} onBlur={(e) => handlersUpdateRoleItem(k, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersRemoveRoleItem(k)} />
                        </div>
                    );
                })}
            </div>
        </Drawer>
    );
};

export default EditorRoles;
