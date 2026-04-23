import React, { useState, useRef, useEffect, useCallback } from "react";
import { Layout, Input, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, FileWordOutlined, GoogleOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// import { updateScriptImpression } from "../../stores/reducers/data";
import { Vocab as DataVocab } from "../../types/Data";
import GrammarTips from "./GrammarTips";
import debounce from "lodash.debounce";
import "./Index.scss";

const Index = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const script = useSelector((state: RootState) => state.data.script);
    // const data = useSelector((state: RootState) => state.data);
    const [textareaValue, setTextareaValue] = useState("");
    const refDiary = useRef<HTMLDivElement>(null);
    const handlersTypeVocab = (value: string) => {
        setTextareaValue(value);
        fnDebouncedTypeVocab(value);
    };
    const fnDebouncedTypeVocab = useCallback(
        debounce((value) => {
            // dispatch(updateScriptImpression(value));
        }, 100),
        [],
    );
    useEffect(() => {
        const elemDiary = refDiary.current;
        if (!elemDiary) return;
        function handlerClick(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("hl")) {
                const text = target.innerText;
                navigator.clipboard.writeText(`[${text}]`).then(() => {
                    console.log("copied.");
                });
            }
        }
        elemDiary.addEventListener("click", handlerClick);
        return () => {
            elemDiary.removeEventListener("click", handlerClick);
        };
    }, []);
    return (
        <Layout className="main-inner" id="impression-index">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "100px 0 0" }}>
                TODO
            </div>
        </Layout>
    );
};

export default Index;
