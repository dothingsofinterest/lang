import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, ReloadOutlined, MinusOutlined, ClearOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
// prettier-ignore
import { 
    grammarCreate, 
    grammarUpdate, 
    grammarRemove, 
    grammarList
} from "../../api/requestAuth";
import { useSelector, useDispatch } from "react-redux";
import { Pagination } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Grammar } from "../../types/Data";
import "./Index.scss";

interface Props {
    open: boolean;
    onClose?: () => void;
    onSubmit?: (list: Grammar[]) => void;
}

interface ListQuery {
    page: number;
    pageSize: number;
    name?: string;
    text?: string;
}

const defaultGrammar = {
    id: 0,
    name: "",
    text: "",
};

const defaultListQuery = {
    page: 1,
    pageSize: 10,
};

const Index: React.FC<Props> = ({ open, onClose, onSubmit }) => {
    const dispatch = useDispatch();
    const scriptId = useSelector((state: RootState) => state.script.scriptId);
    const [list, setList] = useState<Grammar[]>([]);
    const [listQuery, setListQuery] = useState<ListQuery>(defaultListQuery);
    const [dataTotal, setDataTotal] = useState<number>(0);
    const [grammar, setGrammar] = useState<Grammar>(defaultGrammar);
    const [searchText, setSearchText] = useState("");
    const [searchName, setSearchName] = useState("");
    const handlerGrammarUpdateName = (value: string) => {
        setGrammar({ ...grammar, name: value });
    };
    const handlerGrammarUpdateText = (value: string) => {
        setGrammar({ ...grammar, text: value });
    };
    const handlerGrammarCreate = async () => {
        if (grammar.id === 0) {
            if (grammar.name && grammar.text) {
                grammarCreate({
                    name: grammar.name,
                    text: grammar.text,
                }).then((res) => {
                    if (res.code === 1) {
                        setGrammar(defaultGrammar);
                        apiGetList(listQuery);
                    }
                });
            }
        }
    };
    const handlerGrammarUpdate = async () => {
        if (grammar.id) {
            grammarUpdate({
                id: grammar.id,
                name: grammar.name,
                text: grammar.text,
            }).then((res) => {
                if (res.code === 1) {
                    setGrammar(defaultGrammar);
                    apiGetList(listQuery);
                }
            });
        }
    };
    const handlerGrammarRemove = async () => {
        if (grammar.id) {
            const confirmed = window.confirm("Are you confirmed to delete?");
            if (confirmed) {
                grammarRemove({ id: grammar.id }).then((res) => {
                    if (res.code === 1) {
                        setGrammar(defaultGrammar);
                        apiGetList(listQuery);
                    }
                });
            }
        }
    };
    const handlerGrammarActivate = (grammar: Grammar) => {
        if (grammar) {
            setGrammar({
                id: grammar.id,
                name: grammar.name,
                text: grammar.text,
            });
        }
    };
    const handlerSearchByName = (name: string) => {
        const listQueryNew = { ...listQuery, page: 1, name };
        setSearchName(name);
        setListQuery(listQueryNew);
        apiGetList(listQueryNew);
    };
    const handlerSearchByText = (text: string) => {
        const listQueryNew = { ...listQuery, page: 1, text };
        setSearchText(text);
        setListQuery(listQueryNew);
        apiGetList(listQueryNew);
    };
    const handlerPageChange = (page: number, pageSize: number) => {
        apiGetList({ ...listQuery, page, pageSize });
    };
    const handlerOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    const apiGetList = async (listQuery: ListQuery) => {
        const res = await grammarList(listQuery);
        if (res.code === 1) {
            setList(res.data.list);
            setListQuery({
                name: res.data.listParams.name,
                text: res.data.listParams.text,
                page: res.data.listParams.page,
                pageSize: res.data.listParams.pageSize,
            });
            setDataTotal(res.data.listParams.totalPages * res.data.listParams.pageSize);
        }
    };
    useEffect(() => {
        apiGetList(listQuery);
    }, [listQuery.name, listQuery.text, listQuery.page, listQuery.pageSize]);
    return (
        <Drawer id="grammar-index" title="Grammar" width={800} size="large" onClose={handlerOnClose} open={open}>
            <div className="panel">
                <Input className="name" value={grammar.name} onChange={(e) => handlerGrammarUpdateName(e.target.value)} />
                <Input.TextArea className="text" autoSize value={grammar.text} onChange={(e) => handlerGrammarUpdateText(e.target.value)} />
                <div className="submit">
                    <Input className="sitem" value={searchName} onChange={(e) => handlerSearchByName(e.target.value)} allowClear />
                    <Input className="sitem" value={searchText} onChange={(e) => handlerSearchByText(e.target.value)} allowClear />
                    <Button className="sitem" icon={<ReloadOutlined />} onClick={handlerGrammarUpdate} />
                    <Button className="sitem" icon={<ClearOutlined />} onClick={() => setGrammar(defaultGrammar)} />
                    <Button className="sitem" icon={<MinusOutlined />} onClick={handlerGrammarRemove} />
                    <Button className="sitem" icon={<PlusSquareOutlined />} onClick={handlerGrammarCreate} />
                </div>
            </div>
            <div className="table">
                <Scrollbars style={{ height: "410px" }}>
                    <div className="list">
                        {list.length > 0 &&
                            list.map((value) => {
                                return (
                                    <div key={value.id} className={grammar.id === value.id ? "item active" : "item"} onClick={() => handlerGrammarActivate(value)}>
                                        <span className="text">{value.name}</span>
                                    </div>
                                );
                            })}
                    </div>
                </Scrollbars>
                <div className="pagination">
                    <Pagination current={listQuery.page} pageSize={listQuery.pageSize} total={dataTotal} onChange={handlerPageChange} />
                </div>
            </div>
        </Drawer>
    );
};

export default Index;
