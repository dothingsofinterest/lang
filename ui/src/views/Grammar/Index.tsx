import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, ReloadOutlined, PlusCircleOutlined, MinusOutlined, ClearOutlined } from "@ant-design/icons";
import { updateScriptExampleSentenceList } from "../../stores/reducers/script";
import { RootState } from "../../stores";
// prettier-ignore
import { 
    grammarCreate, 
    grammarUpdate, 
    grammarRemove, 
    grammarList,
    scriptExampleSentenceCreate,
    scriptExampleSentenceUpdate,
    scriptExampleSentenceList,
    scriptExampleSentenceRemove
} from "../../api/requestAuth";
import Audio, { AudioRef } from "../Public/Audio";
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
    keyword?: string;
}

const defaultGrammar = {
    id: 0,
    name: "",
    text: "",
};

const defaultExample = {
    id: 0,
    grammarId: 0,
    text: [],
    piece: [],
};

const defaultListQuery = {
    page: 1,
    pageSize: 10,
};

const tokenize = (text: string) => {
    return (
        text
            // 拆分缩写
            .replace(/([a-zA-Z])('re|'ve|'ll|'d|'s|'m)\b/g, "$1 $2")
            // 标点前加空格
            .replace(/([.,!?])/g, " $1")
            // 多空格压缩
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
    );
};

const Index: React.FC<Props> = ({ open, onClose, onSubmit }) => {
    const dispatch = useDispatch();
    const scriptId = useSelector((state: RootState) => state.script.scriptId);
    const exampleSentenceList = useSelector((state: RootState) => state.script.scriptExampleSentenceList);
    const [list, setList] = useState<Grammar[]>([]);
    const [listQuery, setListQuery] = useState<ListQuery>(defaultListQuery);
    const [dataTotal, setDataTotal] = useState<number>(0);
    const [grammar, setGrammar] = useState<Grammar>(defaultGrammar);
    const [keyword, setKeyword] = useState("");
    const [tempExample, setTempExample] = useState<any>(defaultExample);
    const refAudio = useRef<AudioRef>(null);
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
    const handlerGrammarSearch = (keyword: string) => {
        const listQueryNew = { ...listQuery, page: 1, keyword };
        setKeyword(keyword);
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
    const handlerTempExampleSentenceUpdateText = (value: string) => {
        setTempExample({ ...tempExample, text: tokenize(value.trim()) });
    };
    const handlerTempExampleSentenceUpdatePiece = (index: number) => {
        const piece = tempExample.piece;
        if (piece.includes(index)) {
            setTempExample({ ...tempExample, piece: piece.filter((v: number) => v !== index).sort((a: number, b: number) => a - b) });
        } else {
            piece.push(index);
            setTempExample({ ...tempExample, piece: piece.sort((a: number, b: number) => a - b) });
        }
    };
    const handlerTempExampleSentenceCreate = async () => {
        if (scriptId) {
            if (tempExample.id === 0) {
                if (tempExample.text.length > 0 && tempExample.piece.length > 0) {
                    // prettier-ignore
                    scriptExampleSentenceCreate({ 
                        scriptId, 
                        text: tempExample.text.join(" "),
                        piece: tempExample.piece.sort((a: number, b: number) => a - b).join("|"),
                        grammarId: grammar.id ? grammar.id : null 
                    }).then((res) => {
                        if (res.code === 1) {
                            setTempExample(defaultExample);
                            scriptExampleSentenceList({ scriptId }).then((res) => {
                                if (res.code === 1) {
                                    dispatch(updateScriptExampleSentenceList(res.data));
                                }
                            });
                        }
                    });
                }
            }
        }
    };
    const handlerTempExampleSentenceRemove = async () => {
        if (scriptId) {
            if (tempExample.id) {
                const confirmed = window.confirm("Are you confirmed to do this?");
                if (confirmed) {
                    // prettier-ignore
                    scriptExampleSentenceRemove({ 
                    id: tempExample.id,
                    scriptId,
                }).then((res) => {
                    if (res.code === 1) {
                        setTempExample(defaultExample);
                        scriptExampleSentenceList({ scriptId }).then((res) => {
                            if (res.code === 1) {
                                dispatch(updateScriptExampleSentenceList(res.data));
                            }
                        });
                    }
                });
                }
            }
        }
    };
    const handlerTempExampleSentenceUpdate = async () => {
        if (scriptId) {
            if (tempExample.id) {
                if (tempExample.text && tempExample.piece) {
                    // prettier-ignore
                    scriptExampleSentenceUpdate({ 
                        id: tempExample.id,
                        scriptId, 
                        text: tempExample.text.join(" "),
                        piece: tempExample.piece.sort((a: number, b: number) => a - b).join("|"),
                        grammarId: grammar.id ? grammar.id : null 
                    }).then((res) => {
                        if (res.code === 1) {
                            setTempExample(defaultExample);
                            scriptExampleSentenceList({ scriptId }).then((res) => {
                                if (res.code === 1) {
                                    dispatch(updateScriptExampleSentenceList(res.data));
                                }
                            });
                        }
                    });
                }
            }
        }
    };
    const handlerExampleSentenceActivate = (value: any) => {
        setTempExample({
            id: value.id,
            grammarId: value.grammarId,
            text: value.text.split(" "),
            piece: value.piece.split("|").map((v: string) => Number(v)),
        });
    };
    const apiGetList = async (listQuery: ListQuery) => {
        const res = await grammarList(listQuery);
        if (res.code === 1) {
            setList(res.data.list);
            setListQuery({
                keyword: res.data.listParams.keyword,
                page: res.data.listParams.page,
                pageSize: res.data.listParams.pageSize,
            });
            setDataTotal(res.data.listParams.totalPages * res.data.listParams.pageSize);
        }
    };
    useEffect(() => {
        apiGetList(listQuery);
    }, [listQuery.keyword, listQuery.page, listQuery.pageSize]);
    console.log("loaded");
    return (
        <Drawer id="grammar-index" title="Grammar" width={800} size="large" onClose={handlerOnClose} open={open}>
            <div className="panel">
                <Input className="name" value={grammar.name} onChange={(e) => handlerGrammarUpdateName(e.target.value)} />
                <Input.TextArea className="text" autoSize value={grammar.text} onChange={(e) => handlerGrammarUpdateText(e.target.value)} />
                <div className="submit">
                    <Button icon={<ReloadOutlined />} onClick={handlerGrammarUpdate} />
                    <Button icon={<ClearOutlined />} onClick={() => setGrammar(defaultGrammar)} />
                    <Button icon={<MinusOutlined />} onClick={handlerGrammarRemove} />
                    <Button icon={<PlusSquareOutlined />} onClick={handlerGrammarCreate} />
                </div>
            </div>
            <div className="table">
                <div className="search">
                    <Input value={keyword} onChange={(e) => handlerGrammarSearch(e.target.value)} allowClear />
                </div>
                <Scrollbars style={{ height: "210px" }}>
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
                <div className="example">
                    <div className="example-panel">
                        <div className="chunks">
                            {tempExample.text.map((value: string, k: number) => {
                                return (
                                    // prettier-ignore
                                    <span
                                        key={`${k}${value}`}
                                        className={ tempExample.piece.includes(k) ? "piece" : "" }
                                        onClick={() => { handlerTempExampleSentenceUpdatePiece(k) }} >
                                        {value}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="submit">
                            <Input className="item" value={``} onChange={(e) => handlerTempExampleSentenceUpdateText(e.target.value)} />
                            <Button className="item" icon={<ReloadOutlined />} onClick={handlerTempExampleSentenceUpdate} />
                            <Button
                                className="item"
                                icon={<ClearOutlined />}
                                onClick={() => {
                                    setTempExample({ ...defaultExample });
                                }}
                            />
                            <Button className="item" icon={<MinusOutlined />} onClick={handlerTempExampleSentenceRemove} />
                            <Button className="item" icon={<PlusCircleOutlined />} onClick={handlerTempExampleSentenceCreate} />
                        </div>
                    </div>
                    <div className="example-list">
                        {exampleSentenceList.map((example) => {
                            return (
                                // prettier-ignore
                                <div className="chunks">
                                    {example.text.split(" ").map((piece: string, k: number) => {
                                        return (
                                            // prettier-ignore
                                            <span 
                                                key={k} 
                                                onClick={(_) => { handlerExampleSentenceActivate(example) }}
                                                className={ example.piece.split("|").includes(`${k}`) ? "piece" : "" }>
                                                {piece}
                                            </span>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Audio ref={refAudio} loop={false}></Audio>
        </Drawer>
    );
};

export default Index;
