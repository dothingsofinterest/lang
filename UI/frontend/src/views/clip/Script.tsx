import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, InputNumber } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, RedoOutlined, UploadOutlined, PictureOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import "./Script.scss";
import html2canvas from "html2canvas";
interface Script {
    name: string;
    roles: string[];
    scenes: string[];
    words: string[];
    grammers: string[];
    paragraghs: Paragragh[];
}
interface Paragragh {
    key: string;
    scene: string;
    roles: string[];
    children: Sentence[];
}
interface Sentence {
    key: string;
    startTime: string;
    endTime: string;
    texts: string[];
}
interface Scene {
    name: string;
    paragraghs: Paragragh[];
}
const Script = () => {
    const [sentencesTree, setSentencesTree] = useState<Scene[]>([]);
    const [script, setScript] = useState<Script>();
    const [cutFrom, setCutFrom] = useState<number>(1);
    const [cutTo, setCutTo] = useState<number>(100);
    const articleRef = useRef<HTMLDivElement>(null);
    // Event Handlers
    const handlersPanelImportScript = (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            try {
                if (e.target?.result) {
                    const scriptParsed: Script = JSON.parse(e.target.result as string);
                    const scencesTree: Scene[] = [];
                    let hasScene: boolean = false;
                    scriptParsed.paragraghs.forEach((v: Paragragh) => {
                        hasScene = v.scene ? true : false;
                    });
                    if (hasScene) {
                        scriptParsed.paragraghs.forEach((v: Paragragh, k: number, a: Paragragh[]) => {
                            if (v.scene) {
                                const sceneArr = v.scene.split("-");
                                const sceneKey = sceneArr[0].replaceAll(/[\s\'\,]/g, "");
                                if (sceneKey) {
                                    if (k === 0) {
                                        scencesTree.push({
                                            name: sceneArr[0],
                                            paragraghs: [v],
                                        });
                                    } else {
                                        if (v.scene !== a[k - 1].scene) {
                                            scencesTree.push({
                                                name: sceneArr[0],
                                                paragraghs: [v],
                                            });
                                        } else {
                                            scencesTree[scencesTree.length - 1].paragraghs.push(v);
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        scencesTree.push({
                            name: "",
                            paragraghs: [],
                        });
                        scriptParsed.paragraghs.forEach((v: Paragragh, k: number) => {
                            if (k + 1 >= cutFrom && k + 1 <= cutTo) {
                                scencesTree[0].paragraghs.push(v);
                            }
                        });
                    }
                    setSentencesTree(scencesTree);
                    setScript(scriptParsed);
                    document.title = scriptParsed.name;
                }
            } catch (e: any) {
                alert(e.message);
            }
        };
        return false;
    };
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
    const handlerCutFrom = (index: number | null) => {
        if (index !== null && !isNaN(index)) {
            setCutFrom(index);
        }
    };
    const handlerCutTo = (index: number | null) => {
        if (index !== null && !isNaN(index)) {
            if (index > cutFrom) {
                setCutTo(index);
            }
        }
    };
    // Event Handlers
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ width: "100%", height: "100%", padding: "32px 0 0", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", right: "0", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Upload beforeUpload={handlersPanelImportScript} showUploadList={false}>
                                <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                    Script
                                </Button>
                            </Upload>
                            <InputNumber min={1} max={99} step={1} value={cutFrom} onChange={(v) => handlerCutFrom(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                            <InputNumber min={2} max={100} step={1} value={cutTo} onChange={(v) => handlerCutTo(v)} style={{ flex: "0 0 80px", borderRadius: "0", backgroundColor: "#ccc" }} />
                            <Button icon={<PictureOutlined />} onClick={handlersPanelClip} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <Scrollbars>
                        {script ? (
                            <article id="article-clip" ref={articleRef}>
                                <h1 id="title">{cutFrom === 1 && script?.name}</h1>
                                {sentencesTree.length === 1
                                    ? sentencesTree[0].paragraghs.map((paragragh) => {
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
                                      })
                                    : sentencesTree.map((scene, index) => {
                                          return (
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
                                          );
                                      })}
                                <footer>
                                    <div className="words">
                                        <div className="title">Words</div>
                                        {script?.words.map((value, key) => {
                                            return (
                                                <p key={key}>
                                                    <span className="item-index">[{key + 1}] </span>
                                                    {value}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </footer>
                            </article>
                        ) : (
                            ""
                        )}
                    </Scrollbars>
                </aside>
            </Layout>
        </>
    );
};

export default Script;
