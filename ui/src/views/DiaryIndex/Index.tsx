import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { UploadOutlined, DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateDiaryTitle, updateDiaryDate, updateDiaryContent } from "../../stores/reducers/diary";
import printJS from "print-js";
import ReactDOMServer from "react-dom/server";
import "./Index.scss";

const Index = () => {
    const dispatch = useDispatch();
    const diary = useSelector((state: RootState) => state.diary);
    const handlersTitle = (value: string) => {
        dispatch(updateDiaryTitle(value));
    };
    const handlersDate = (value: string) => {
        dispatch(updateDiaryDate(value));
    };
    const handlersContent = (value: string) => {
        dispatch(updateDiaryContent(value));
    };
    const handlersPrint = () => {
        if (diary.data.title && diary.data.date) {
            const style = `
					@media print {
						@page { margin: 1cm 0.4cm; }
						* { outline: none; }
						html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
						body { margin: 0; padding: 0; font-size: 12pt; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
						ol, ul, li { list-style: none; }
                        #diary h1 { color: #000; text-align: center; font-size: 14pt; font-weight: 900; line-height: 30pt; }
                        #diary h2 { color: #000; text-align: center; font-size: 12pt; font-weight: 300; line-height: 28pt; }
                        #diary .block { padding: 6pt 12pt; margin: 8pt 0 0; border-top: 0.5pt dotted #666; }
                        #diary .block:first-of-type { margin-top: 0; border-top: 0;}
                        #diary .block p { color: #000; margin: 0; padding: 0; line-height: 28pt; font-size: 12pt; word-wrap: break-word; }
                        #diary .block p .hl { color: gray; font-style: italic; font-weight: 900; }
                        #diary .block.tips p:first-of-type { border-top: 0; }
					}
				`;
            const content = ReactDOMServer.renderToStaticMarkup(
                <article id="diary">
                    {diary.data.title && <h1>{diary.data.title}</h1>}
                    {diary.data.date && <h2>{diary.data.date}</h2>}
                    <div className="block" dangerouslySetInnerHTML={{ __html: diary.contentParsed[0] }}></div>
                    <div className="block" dangerouslySetInnerHTML={{ __html: diary.contentParsed[1] }}></div>
                    <div className="block tips" dangerouslySetInnerHTML={{ __html: diary.contentParsed[2] }}></div>
                </article>,
            );
            printJS({ printable: `${content}`, type: "raw-html", style: style });
        } else {
            alert("Please write title and date.");
        }
    };
    const handlersExport = async () => {
        if (diary.data.title && diary.data.date) {
            try {
                const blob = new Blob([JSON.stringify(diary.data, null, 4)], { type: "application/json" });
                const handle = await await (window as any).showSaveFilePicker({
                    suggestedName: `${diary.data.date}-${diary.data.title}.json`,
                    types: [{ description: diary.data.title, accept: { "application/json": [".json"] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.error("save error: ", error);
            }
        } else {
            alert("Please create a project.");
        }
    };
    const handlersImport = (file: any) => {
        if (/^(.+?)\.(json|JSON)$/g.test(file.name) && file.type === "application/json") {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async (e) => {
                try {
                    if (e.target?.result) {
                        const content = e.target.result as string;
                        const data = JSON.parse(content);
                        dispatch(updateDiaryTitle(data.title));
                        dispatch(updateDiaryDate(data.date));
                        dispatch(updateDiaryContent(data.content));
                    }
                } catch (e: any) {
                    alert(e.message);
                }
            };
        } else {
            alert("Please upload json file.");
        }
        return false;
    };
    useEffect(() => {
        function handler(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("hl")) {
                const text = target.innerText;
                navigator.clipboard.writeText(`【${text}】`).then(() => {
                    console.log("copied.");
                });
            }
        }
        document.addEventListener("click", handler);
        return () => {
            document.removeEventListener("click", handler);
        };
    }, []);
    return (
        <Layout id="diary-index" className="main-inner">
            <div className="main-inner-item-aside" style={{ position: "relative", padding: "100px 0 0" }}>
                <section id="panel">
                    <Upload showUploadList={false} className="btn upload" beforeUpload={handlersImport}>
                        <Button icon={<UploadOutlined />}>Import</Button>
                    </Upload>
                    <Button icon={<DownloadOutlined />} className="btn" onClick={handlersExport}>
                        Export
                    </Button>
                </section>
                <section id="meta">
                    <Input value={diary.data.title} onChange={(e) => handlersTitle(e.target.value)} placeholder="Title" />
                    <Input value={diary.data.date} onChange={(e) => handlersDate(e.target.value)} placeholder="Date" />
                </section>
                <Scrollbars>
                    <Input.TextArea value={diary.data.content} onChange={(e) => handlersContent(e.target.value)} placeholder="Just write what you are thinking about at this moment." />
                </Scrollbars>
            </div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section className="panel">
                    <Button icon={<PrinterOutlined />} onClick={handlersPrint} className="btn" />
                </section>
                <Scrollbars>
                    <article id="diary">
                        {diary.data.title && <h1>{diary.data.title}</h1>}
                        {diary.data.date && <h2>{diary.data.date}</h2>}
                        <div className="main" dangerouslySetInnerHTML={{ __html: diary.contentParsed[0] }}></div>
                        <div className="tips" dangerouslySetInnerHTML={{ __html: diary.contentParsed[1] }}></div>
                    </article>
                </Scrollbars>
            </div>
        </Layout>
    );
};

export default Index;
