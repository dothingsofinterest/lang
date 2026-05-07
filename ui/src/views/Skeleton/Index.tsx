import React, { useState, useRef, useEffect } from "react";
import { Layout, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import "./Writable";
import "./Index.scss";
import ReadOnly from "./ReadOnly";
import Writable, { WritableRef } from "./Writable";
// prettier-ignore
import { 
    scriptRead, 
    scriptSentenceList, 
} from "../../api/requestAuth";
import { useParams } from "react-router-dom";

const Index = () => {
    const { id } = useParams();
    const [script, setScript] = useState<any>({});
    const [showOrigin, setShowOrigin] = useState<boolean>(false);
    const refScrollbar = useRef<Scrollbars>(null);
    const refSentenceList = useRef<any[]>([]);
    const refSentenceMap = useRef(new Map<number, any>());
    const handlerOnComplete = (sentenceId: number) => {
        const index = refSentenceList.current.findIndex(({ id }) => id === sentenceId);
        const nextSentence = refSentenceList.current[index + 1];
        if (nextSentence) {
            const nextDom = refSentenceMap.current.get(nextSentence.id);
            if (nextDom) {
                nextDom.focusOnFirst();
            }
        }
    };
    useEffect(() => {
        scriptRead({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                setScript(res.data);
            }
        });
        scriptSentenceList({ scriptId: id }).then((res) => {
            if (res.code === 1) {
                refSentenceList.current = res.data.filter((v: any) => v.piece);
            }
        });
    }, []);
    return (
        <Layout id="skeleton-index" className="main-inner">
            <div className="main-inner-item-aside"></div>
            <div className="main-inner-item-main" style={{ position: "relative", padding: "32px 0 0" }}>
                <section id="panel">
                    <Button icon={showOrigin ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={(_) => setShowOrigin(!showOrigin)} className="btn" />
                </section>
                <Scrollbars ref={refScrollbar}>
                    <article id="script">
                        <React.Fragment>
                            {script.title && <h1>{script.title}</h1>}
                            {script.scenes &&
                                script.scenes.map((scene: any, index: any) => {
                                    return (
                                        <section className="scene" key={index}>
                                            {scene.name && <h2>{scene.name}</h2>}
                                            {scene.paragraphs.map((paragraph: any) => {
                                                return (
                                                    <React.Fragment key={paragraph.id}>
                                                        <p key={paragraph.id} className={!paragraph.role ? "indent" : undefined}>
                                                            {paragraph.role && <i className="role">{paragraph.role}: </i>}
                                                            {paragraph.sentences.map((sentence: any, index: number) =>
                                                                sentence.piece ? (
                                                                    // prettier-ignore
                                                                    <Writable 
                                                                        id={sentence.id} 
                                                                        ref={(el) => { el && (refSentenceMap.current.set(sentence.id, el)) }} 
                                                                        sentence={sentence} 
                                                                        showOrigin={showOrigin} 
                                                                        onComplete={handlerOnComplete} />
                                                                ) : (
                                                                    <ReadOnly sentence={sentence} />
                                                                ),
                                                            )}
                                                        </p>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </section>
                                    );
                                })}
                        </React.Fragment>
                    </article>
                </Scrollbars>
            </div>
            <div className="main-inner-item-aside"></div>
        </Layout>
    );
};

export default Index;
