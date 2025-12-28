import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, ReloadOutlined } from "@ant-design/icons";
import "./EditorRoles.scss";

interface EditorRolesProps {
    roles: string[];
    open: boolean;
    onClose?: () => void;
    onSubmit?: (scenes: string[]) => void;
}

const EditorRoles: React.FC<EditorRolesProps> = ({ roles, open, onClose, onSubmit }) => {
    const [tempRole, setTempRole] = useState<string>("");
    const [rolesList, setRolesList] = useState<string[]>(roles);
    const handlersUpdateTempScene = (value: string) => {
        setTempRole(value);
    };
    const handlersSubmitTempScene = () => {
        if (tempRole) {
            const rolesListNew = [...rolesList];
            rolesListNew.unshift(`${tempRole}`);
            setRolesList(rolesListNew);
        }
    };
    const handlersUpdateRoleItem = (index: number, value: string) => {
        const rolesListNew = rolesList.map((v, k) => (k === index ? value : v));
        setRolesList(rolesListNew);
    };
    const handlersRemoveRoleItem = (index: number) => {
        const a = rolesList.slice(0, index);
        const b = rolesList.slice(index);
        b.shift();
        setRolesList([...a, ...b]);
    };
    const handlersOnSubmit = async () => {
        if (onSubmit !== undefined) {
            onSubmit(rolesList);
        }
        if (onClose !== undefined) {
            setTempRole("");
            onClose();
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
                <Input value={tempRole} onChange={(e) => handlersUpdateTempScene(e.target.value)} placeholder="Role-角色" />
                <Button icon={<PlusSquareOutlined />} onClick={handlersSubmitTempScene} />
            </div>
            <div className="roles-list">
                {rolesList.map((value, k) => {
                    return (
                        <div key={k} className="roles-item">
                            <Input value={value} onChange={(e) => handlersUpdateRoleItem(k, e.target.value)} />
                            <Button icon={<MinusSquareOutlined />} onClick={(e) => handlersRemoveRoleItem(k)} />
                        </div>
                    );
                })}
            </div>
            <div className="roles-submit">
                <Button icon={<ReloadOutlined />} onClick={handlersOnSubmit} />
            </div>
        </Drawer>
    );
};

export default EditorRoles;
