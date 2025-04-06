import React, { useState, useRef, useEffect } from "react";
import { Layout, Button, InputNumber } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PictureOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import html2canvas from "html2canvas";
import "./ClipScript.scss";
const ClipScript = () => {
    const data = useSelector((state: RootState) => state.script.dataArticle);
    const [cutFrom, setCutFrom] = useState<number>(1);
    const [cutTo, setCutTo] = useState<number>(100);
    // Event Handlers
    const handlersPanelClip = () => {
        const h = document.querySelector("#article-clip") as HTMLElement;
        if (h) {
            html2canvas(h, {
                width: 2160,
                height: 3840,
                scale: 1,
            }).then((canvas) => {
                h.innerHTML = "";
                h.appendChild(canvas);
            });
        }
    };
    const handlersCutFrom = (index: number | null) => {
        if (index !== null && !isNaN(index)) {
            setCutFrom(index);
        }
    };
    const handlersCutTo = (index: number | null) => {
        if (index !== null && !isNaN(index)) {
            if (index > cutFrom) {
                setCutTo(index);
            }
        }
    };
    // Event Handlers
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ width: "100%", height: "100%", padding: "32px 0 0", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", left: "100px", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <InputNumber min={1} max={99} step={1} value={cutFrom} onChange={(v) => handlersCutFrom(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                            <InputNumber min={2} max={100} step={1} value={cutTo} onChange={(v) => handlersCutTo(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                            <Button icon={<PictureOutlined />} onClick={handlersPanelClip} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <Scrollbars>
                        <article id="article-clip">
                            <h1 id="title">{cutFrom === 1 && data.name.split("/")[0]}</h1>
                            {data.scenes.length === 1
                                ? data.scenes[0].paragraghs.map((paragragh, index) => {
                                      return index >= cutFrom && index <= cutTo ? (
                                          paragragh.roles.length <= 1 ? (
                                              <div className="p" key={paragragh.key}>
                                                  <p>
                                                      {paragragh.roles.length === 1 ? <i className="role">{paragragh.roles[0].split("-")[0]}: </i> : <></>}
                                                      {paragragh.children.map((v) => {
                                                          return (
                                                              <React.Fragment key={v.key}>
                                                                  <span className="point">{v.texts[0].split("\n")[0]}</span>
                                                              </React.Fragment>
                                                          );
                                                      })}
                                                  </p>
                                              </div>
                                          ) : (
                                              <div className="p" key={paragragh.key}>
                                                  {paragragh.children.map((sentence) => {
                                                      return (
                                                          <ul className="point" key={sentence.key}>
                                                              {sentence.texts.map((partOfSentence, n) => {
                                                                  return (
                                                                      <li key={n}>
                                                                          <i className="role">{paragragh.roles[n].split("-")[0]}: </i>
                                                                          <span>{partOfSentence.split("\n")[0]}</span>
                                                                      </li>
                                                                  );
                                                              })}
                                                          </ul>
                                                      );
                                                  })}
                                              </div>
                                          )
                                      ) : (
                                          ""
                                      );
                                  })
                                : data.scenes.map((scene, index) => {
                                      return index >= cutFrom && index <= cutTo ? (
                                          <div className="scene" key={index}>
                                              <h2>{scene.name}</h2>
                                              {scene.paragraghs.map((paragragh) => {
                                                  return paragragh.roles.length <= 1 ? (
                                                      <div className="p" key={paragragh.key}>
                                                          <p>
                                                              {paragragh.roles.length === 1 ? <i className="role">{paragragh.roles[0].split("-")[0]}: </i> : <></>}
                                                              {paragragh.children.map((v) => {
                                                                  return (
                                                                      <React.Fragment key={v.key}>
                                                                          <span className="point">{v.texts[0].split("\n")[0]}</span>
                                                                      </React.Fragment>
                                                                  );
                                                              })}
                                                          </p>
                                                      </div>
                                                  ) : (
                                                      <div className="p" key={paragragh.key}>
                                                          {paragragh.children.map((sentence) => {
                                                              return (
                                                                  <ul className="point" key={sentence.key}>
                                                                      {sentence.texts.map((partOfSentence, n) => {
                                                                          return (
                                                                              <li key={n}>
                                                                                  <i className="role">{paragragh.roles[n].split("-")[0]}: </i>
                                                                                  <span>{partOfSentence.split("\n")[0]}</span>
                                                                              </li>
                                                                          );
                                                                      })}
                                                                  </ul>
                                                              );
                                                          })}
                                                      </div>
                                                  );
                                              })}
                                          </div>
                                      ) : (
                                          ""
                                      );
                                  })}
                            <footer>
                                {cutTo >= data.scenes.length ? (
                                    <div className="words">
                                        <div className="title">Words</div>
                                        {data.words.map((value, key) => {
                                            return (
                                                <p key={key}>
                                                    <span className="item-index">[{key + 1}] </span>
                                                    {value}
                                                </p>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </footer>
                        </article>
                    </Scrollbars>
                </aside>
            </Layout>
        </>
    );
};

export default ClipScript;
