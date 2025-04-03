import React, { useState, useRef, useEffect } from "react";
import { Layout, Input, Button, Upload, Switch } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { PrinterOutlined, RedoOutlined, UploadOutlined, FastBackwardOutlined, PauseCircleOutlined, FastForwardOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { ttsGen } from "../../api/request";
import printJS from "print-js";
import "./View.scss";
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
const View = () => {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [sentencesCurIndex, setSentencesCurIndex] = useState(0);
    const [sentencesTree, setSentencesTree] = useState<Scene[]>([]);
    const [wordsCurIndex, setWordsCurIndex] = useState(0);
    const [script, setScript] = useState<Script>();
    const [videoSRC, setVideoSRC] = useState("");
    const [playButton, setPlayButton] = useState(<PlayCircleOutlined />);
    const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState<boolean>(true); // true-sentence false-word
    const [dictationWordsMode, setDictationWordsMode] = useState<boolean>(true); // true-EN false-CN
    const [stopMode, setStopMode] = useState(true);
    const articleRef = useRef<HTMLDivElement>(null);
    const [words, setWords] = useState<string[]>([]);
    const refVideo = useRef<HTMLVideoElement>(null);
    const refAudio = useRef<HTMLAudioElement>(null);
    // Event Handlers
    const handlersPanelImportScript = (file: any) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            try {
                if (e.target?.result) {
                    const scriptParsed: Script = JSON.parse(e.target.result as string);
                    const sentences: Sentence[] = [];
                    const scencesTree: Scene[] = [];
                    let hasScene: boolean = false;
                    scriptParsed.paragraghs.forEach((v: Paragragh) => {
                        sentences.push(...v.children);
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
                        scriptParsed.paragraghs.forEach((v: Paragragh) => {
                            scencesTree[0].paragraghs.push(v);
                        });
                    }
                    setSentencesTree(scencesTree);
                    setScript(scriptParsed);
                    setSentences(sentences);
                    setWords(scriptParsed.words);
                    document.title = scriptParsed.name;
                }
            } catch (e: any) {
                alert(e.message);
            }
        };
        return false;
    };
    const handlersPanelUploadVideo = (file: any) => {
        if (/^(.+?)\.mp4$/g.test(file.name)) {
            const videoURL = URL.createObjectURL(file);
            setVideoSRC(videoURL);
            refVideo.current?.load();
            return false; // Stop upload action.
        } else {
            alert("Please upload mp4 format video.");
        }
    };
    const handlersPanelPlay = () => {
        if (refVideo.current && videoSRC) {
            if (refVideo.current.paused) {
                setPlayButton(<PauseCircleOutlined />);
                refVideo.current.play();
            } else {
                setPlayButton(<PlayCircleOutlined />);
                refVideo.current.pause();
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayAgain = () => {
        if (refVideo.current && videoSRC) {
            const cur = sentences[sentencesCurIndex];
            if (cur !== undefined) {
                refVideo.current.currentTime = fnSRTTimeToFloat(cur.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayBackward = () => {
        if (refVideo.current && videoSRC) {
            const prevIndex = sentencesCurIndex <= 0 ? 0 : sentencesCurIndex - 1;
            const prev = sentences[prevIndex];
            if (prev !== undefined) {
                setSentencesCurIndex(prevIndex);
                refVideo.current.currentTime = fnSRTTimeToFloat(prev.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelPlayForward = () => {
        if (refVideo.current && videoSRC) {
            const nextIndex = sentencesCurIndex === sentences.length - 1 ? sentencesCurIndex : sentencesCurIndex + 1;
            const next = sentences[nextIndex];
            if (next !== undefined) {
                setSentencesCurIndex(nextIndex);
                refVideo.current.currentTime = fnSRTTimeToFloat(next.startTime);
                refVideo.current?.play();
                setPlayButton(<PauseCircleOutlined />);
            }
        } else {
            alert("Please upload video.");
        }
    };
    const handlersPanelSwithStopMode = (v: boolean) => {
        setStopMode(v);
    };
    const handlersPanelPrint = () => {
        if (articleRef && script) {
            const css = `
            * { outline: none; }
            html,body,p,h1,h2,h3,h4,h5,ul,ol,li { margin: 0; padding: 0; }
            body { margin: 0; padding: 0; font-size: 14px; font-family: "Hiragino Sans GB", "Microsoft Yahei", "SimSun", Arial, "Helvetica Neue", Helvetica; color: #333; word-wrap: break-word; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;}
            ol, ul, li { list-style: none; }
            article { width: 1000px; }
            article h1 { text-align: center; font-size: 16px; font-weight: 900; line-height: 50px; color: #000; margin: 10px 0; }
            article h2 { text-align: center; font-size: 14px; font-weight: 300; line-height: 20px; color: #000; margin: 10px 16px; }
            article .scene { background: #ccc; padding: 6px 0; margin-bottom: 10px; }
            article .p { border: 1px dotted #000; margin: 12px 20px; padding: 2px 6px; color: #000; font-size: 14px; line-height: 28px; }
            article .p .point { padding: 0 4px; }
            article .p .role { font-style: normal; font-weight: 900; padding-right: 2px; }
            article .p ul { font-style: normal; font-size: 12px; }
            article footer { height: 100%; }
            article footer .words { margin-bottom: 10px; }
            article footer .words,
            article footer .grammers { color: #fff; line-height: 28px; background-color: #333; padding: 10px 20px; }
            article footer .words .item-index,
            article footer .grammers .item-index { font-weight: 900; }
            article footer .words .title,
            article footer .grammers .title { line-height: 36px; display: flex; align-items: center; text-align: center; justify-content: center; font-weight: 900; font-size: 14px; }
            article footer .title:before, 
            article footer .title:after { position: relative; width: 50%; border-block-start: 1px dotted #fff; border-block-end: 0; transform: translateY(50%); content: ""; }
        `;
            printJS({ printable: `<article>${articleRef.current?.innerHTML}</article>` || "", type: "raw-html", style: css });
        } else {
            alert("Please import a script.");
        }
    };
    const handlersVideoEnded = () => {
        console.log("video ended");
        setSentencesCurIndex(0);
        fnSentenceHighlight(0);
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoPlay = async (e: any) => {
        setPlayButton(<PauseCircleOutlined />);
    };
    const handlersVideoPause = async (e: any) => {
        setPlayButton(<PlayCircleOutlined />);
    };
    const handlersVideoTimeUpdate = (e: any) => {
        if (inputMode) {
            console.log("video current time:", `${fnFloatToSRTTime(e.target.currentTime)} / ${e.target.currentTime}`);
            console.log("sentences current index:", sentencesCurIndex);
            const cur = sentences[sentencesCurIndex];
            if (cur !== undefined) {
                fnSentenceHighlight(sentencesCurIndex);
                const endTime = fnSRTTimeToFloat(cur.endTime);
                if (e.target.currentTime >= endTime) {
                    if (stopMode) {
                        if (sentencesCurIndex <= sentences.length - 1) {
                            refVideo.current?.pause();
                            setPlayButton(<PlayCircleOutlined />);
                        }
                    } else {
                        setSentencesCurIndex(sentencesCurIndex === sentences.length - 1 ? sentencesCurIndex : sentencesCurIndex + 1);
                    }
                }
            }
        }
    };
    const handlersPanel2SwitchInputMode = async (v: boolean) => {
        setInputMode(v);
        if (v) {
            if (refAudio.current) {
                refAudio.current.pause();
                setWordsCurIndex(0);
            }
        } else {
            fnPlayAudio(0);
            if (refVideo.current) {
                refVideo.current.pause();
                refVideo.current.currentTime = 0;
                setSentencesCurIndex(0);
                setPlayButton(<PlayCircleOutlined />);
                fnSentenceHighlight(0);
            }
        }
    };
    const handlersPanel2SwitchDictationWordsMode = (v: boolean) => {
        setDictationWordsMode(v);
    };
    const handlersKeyboardOnDown = (event: KeyboardEvent) => {
        console.log("event.key", event.key);
        console.log("event.code", event.code);
        if (event.code === "NumpadSubtract") {
            handlersPanelPlayBackward();
        }
        if (event.code === "NumpadAdd") {
            handlersPanelPlayForward();
        }
        if (event.code === "F8") {
            handlersPanelPlayAgain();
        }
        // if (event.key === "7") {
        //     if (refVideo.current) {
        //         refVideo.current.currentTime = Math.max(0, refVideo.current.currentTime - 0.5);
        //     }
        // } else if (event.key === "9") {
        //     if (refVideo.current) {
        //         refVideo.current.currentTime = refVideo.current.currentTime + 0.5;
        //     }
        // } else if (event.key === "8") {
        //     // 如果当前是空格键，切换视频的播放和暂停
        //     if (refVideo.current) {
        //         if (refVideo.current.paused) {
        //             refVideo.current.play();
        //         } else {
        //             refVideo.current.pause();
        //         }
        //     }
        // }
    };
    const handlersTextInput = (value: string) => {
        setInputValue(value);
        if (sentences.length > 0) {
            if (inputMode) {
                const answer = sentences[sentencesCurIndex].texts.map((v) => v.split("\n")[0]).join("\n");
                if (answer === value) {
                    setInputValue("");
                    setSentencesCurIndex(sentencesCurIndex + 1);
                    refVideo.current?.play();
                    setPlayButton(<PauseCircleOutlined />);
                }
            } else {
                const valueTrans = value.includes(",") ? value.replaceAll(",", "/") : value;
                if (words[wordsCurIndex].split(", ")[1] === valueTrans) {
                    setInputValue("");
                    setWordsCurIndex(wordsCurIndex + 1 === words.length ? 0 : wordsCurIndex + 1);
                    fnPlayAudio(wordsCurIndex + 1 === words.length ? 0 : wordsCurIndex + 1);
                }
            }
        }
    };
    // Event Handlers
    // Functions
    const fnFloatToSRTTime = (floatSeconds: number): string => {
        // 计算小时、分钟、秒数和毫秒
        const hours = Math.floor(floatSeconds / 3600);
        const minutes = Math.floor((floatSeconds % 3600) / 60);
        const seconds = Math.floor(floatSeconds % 60);
        const milliseconds = Math.round((floatSeconds % 1) * 1000);
        // 格式化成 SRT 时间格式 (hh:mm:ss,SSS)
        const timeString = `${fnPadZero(hours)}:${fnPadZero(minutes)}:${fnPadZero(seconds)},${fnPadZero(milliseconds, 3)}`;
        return timeString;
    };
    const fnSRTTimeToFloat = (SRTTime: string): number => {
        // Split the SRT time into hours, minutes, seconds, and milliseconds
        const timeParts = SRTTime.split(/[:,]/); // Split by ":" and ","
        // Parse the parts
        const hours = parseInt(timeParts[0], 10); // HH
        const minutes = parseInt(timeParts[1], 10); // MM
        const seconds = parseInt(timeParts[2], 10); // SS
        const milliseconds = parseInt(timeParts[3], 10); // SSS
        // Convert to seconds
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    };
    // 辅助函数：补零以确保数字有指定的长度
    const fnPadZero = (num: number, length: number = 2): string => {
        return num.toString().padStart(length, "0");
    };
    const fnSentenceHighlight = (index: number) => {
        if (articleRef.current) {
            const spans = articleRef.current.querySelectorAll(".point");
            spans.forEach((span: any, k) => {
                span.className = index === k ? "point active" : "point";
            });
        }
    };
    const fnPlayAudio = async (index: number) => {
        if (words && words.length) {
            const wordsArr = words[index].split(", ");
            const content = dictationWordsMode ? wordsArr[1].replaceAll("/", ", ") : wordsArr[0].split(".")[1];
            const type = dictationWordsMode ? 1 : 2;
            try {
                const res = await ttsGen({ content: content, type: type });
                if (res.code) {
                    if (refAudio.current) {
                        const audio = refAudio.current;
                        audio.src = "data:audio/wav;base64," + res.data;
                        audio.load();
                        audio.play();
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.log(error);
                }
            }
        }
    };
    // Functions
    useEffect(() => {
        window.addEventListener("beforeunload", (event) => {
            // 自定义提示信息 (大多数现代浏览器会忽略自定义消息，显示默认提示)
            const message = "你有未保存的更改，确定要离开吗？";
            event.preventDefault(); // 阻止默认行为 (重要：在某些浏览器中仍然需要)
            event.returnValue = message; // 设置提示信息
            return message; // 某些浏览器可能使用此返回值
        });
    }, []);
    useEffect(() => {
        // 添加键盘事件监听器
        window.addEventListener("keydown", handlersKeyboardOnDown);
        // 清理事件监听器
        return () => {
            window.removeEventListener("keydown", handlersKeyboardOnDown);
        };
    }, [refVideo, videoSRC, sentences, sentencesCurIndex]);
    return (
        <>
            <Layout style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", backgroundColor: "#000" }}>
                <aside id="asider" style={{ flex: "0 0 800px", position: "relative", height: "100%", padding: "32px 0 132px", boxSizing: "border-box", backgroundColor: "#202024" }}>
                    <section id="asider" style={{ width: "100%", height: "32px", position: "absolute", right: "0", top: "0", backgroundColor: "#202024" }}>
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <Upload beforeUpload={handlersPanelUploadVideo} showUploadList={false}>
                                <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                    Video
                                </Button>
                            </Upload>
                            <Upload beforeUpload={handlersPanelImportScript} showUploadList={false}>
                                <Button icon={<UploadOutlined />} style={{ borderRadius: "0", width: "100%", backgroundColor: "#ccc" }}>
                                    Script
                                </Button>
                            </Upload>
                            <Button icon={<RedoOutlined />} onClick={handlersPanelPlayAgain} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={<FastBackwardOutlined />} onClick={handlersPanelPlayBackward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={playButton} onClick={handlersPanelPlay} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <Button icon={<FastForwardOutlined />} onClick={handlersPanelPlayForward} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                            <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                                <Switch checked={stopMode} onChange={handlersPanelSwithStopMode} size="small" checkedChildren="停顿" unCheckedChildren="不停" />
                            </div>
                            <Button icon={<PrinterOutlined />} onClick={handlersPanelPrint} style={{ flex: 1, borderRadius: "0", backgroundColor: "#ccc" }}></Button>
                        </div>
                    </section>
                    <Scrollbars>
                        {script ? (
                            <article id="article" ref={articleRef}>
                                <h1>{script?.name}</h1>
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
                                    <div className="grammers">
                                        <div className="title">Grammers</div>
                                        {script?.grammers.map((value, key) => {
                                            return (
                                                <div key={key}>
                                                    <span className="item-index">[{key + 1}] </span>
                                                    {value.split("\n").map((v, k) => {
                                                        return k === 0 ? <span key={k}>{v}</span> : <p key={k}>{v}</p>;
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </footer>
                            </article>
                        ) : (
                            ""
                        )}
                    </Scrollbars>
                    <section id="asider" style={{ width: "100%", height: "132px", position: "absolute", left: "0", bottom: "0" }}>
                        <section id="asider" style={{ width: "100%", height: "32px", backgroundColor: "#202024" }}>
                            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc", borderLeft: "1px solid #d9d9d9" }}>
                                    <Switch checked={inputMode} onChange={handlersPanel2SwitchInputMode} size="small" checkedChildren="文章" unCheckedChildren="单词" />
                                </div>
                                <div style={{ flex: 1, borderRadius: "0", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff", backgroundColor: "#ccc" }}>
                                    <Switch checked={dictationWordsMode} onChange={handlersPanel2SwitchDictationWordsMode} size="small" checkedChildren="英" unCheckedChildren="中" />
                                </div>
                            </div>
                        </section>
                        <Input.TextArea
                            value={inputValue}
                            onChange={(e) => handlersTextInput(e.target.value)}
                            autoSize
                            style={{ minHeight: "100px", borderRadius: "0", color: "#000" }}
                            placeholder="Input sentences or words.&#10;EX: wear,wears,wore,worn,wearing"
                        />
                    </section>
                </aside>
                <main style={{ flex: 1, display: "flex", height: "100%", justifyContent: "flex-start", boxSizing: "border-box", backgroundColor: "#ffffff1a" }}>
                    <video controls style={{ width: "100%" }} id="video" onPlay={handlersVideoPlay} onPause={handlersVideoPause} onEnded={handlersVideoEnded} onTimeUpdate={handlersVideoTimeUpdate} ref={refVideo}>
                        <source src={videoSRC} type="video/mp4" /> Your browser does not support video tag.
                    </video>
                </main>
            </Layout>
            <div style={{ display: "none" }}>
                <audio ref={refAudio} loop></audio>
            </div>
        </>
    );
};

export default View;
