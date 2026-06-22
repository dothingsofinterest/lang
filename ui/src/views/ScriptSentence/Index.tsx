import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { scriptSentenceSearch } from "../../api/requestAuth";
import { Pagination } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { Grammar } from "../../types/Data";
import "./Index.scss";

interface Props {
    open: boolean;
    onClose?: () => void;
}

interface ListQuery {
    page: number;
    pageSize: number;
    keyword?: string;
}

const defaultListQuery = {
    page: 1,
    pageSize: 10,
};

const Index: React.FC<Props> = ({ open, onClose }) => {
    const [list, setList] = useState<any[]>([]);
    const [listQuery, setListQuery] = useState<ListQuery>(defaultListQuery);
    const [dataTotal, setDataTotal] = useState<number>(0);
    const [keyword, setKeyword] = useState("");
    const handlerSearch = (keyword: string) => {
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
    const apiGetList = async (listQuery: ListQuery) => {
        const res = await scriptSentenceSearch(listQuery);
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
    return (
        <Drawer id="script-sentence-index" title="Sentence" width={800} size="large" onClose={handlerOnClose} open={open}>
            <div className="table">
                <div className="search">
                    <Input value={keyword} onChange={(e) => handlerSearch(e.target.value)} allowClear />
                </div>
                <Scrollbars style={{ height: "510px" }}>
                    <div className="list">
                        {list.length > 0 &&
                            list.map((value) => {
                                return (
                                    <div key={value.id} className="item">
                                        <span className="text">
                                            {value.text.includes(`${listQuery.keyword}`)
                                                ? value.text
                                                      .replace(new RegExp(`(${listQuery.keyword})`), `|$1|`)
                                                      .split("|")
                                                      .map((part: string, k: number) => {
                                                          return k === 1 ? <b>{part}</b> : <>{part}</>;
                                                      })
                                                : value.text}
                                        </span>
                                        <span className="text">
                                            <a href={`/#/read/${value.sId}`} target="_blank">
                                                <b>{value.sName}</b>
                                            </a>
                                        </span>
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
