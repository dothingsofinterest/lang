import React, { useState, useRef, useEffect } from "react";
import { ScriptArticle as DataScriptArticle, Scene as DataScene } from "../../types/Data";
import { useDispatch } from "react-redux";
import { updateActiveVocab } from "../../stores/reducers/project";
interface ScriptDOMProps {
    dataArticle: DataScriptArticle;
    activeSentence: number;
    activeVocab: number;
    boxID?: string;
}
const ScriptDOM: React.FC<ScriptDOMProps> = React.memo(({ dataArticle, activeSentence, activeVocab, boxID = "article" }) => {
    console.log("----------Render | Script/ScriptDOM----------");
    const dispatch = useDispatch();
    const articleRef = useRef<HTMLDivElement>(null);
    // Event Handlers
    const handlersSetVocabIndex = (index: number) => {
        dispatch(updateActiveVocab(index));
    };
    // Event Handlers
    // Functions
    const fnHighlight = () => {
        if (articleRef.current) {
            const spans = articleRef.current.querySelectorAll(".point");
            spans.forEach((span: any, k) => {
                span.className = activeSentence === k ? "point active" : "point";
            });
            const vocabItems = articleRef.current.querySelectorAll(".vocab-item");
            vocabItems.forEach((span: any, k) => {
                span.className = activeVocab === k ? "vocab-item active" : "vocab-item";
            });
        }
    };
    // Functions
    // Lives Hook
    useEffect(() => {
        console.log("----------Mounted | Script/ScriptDOM----------");
        fnHighlight();
        return () => {
            console.log("----------Unmounted | Script/ScriptDOM----------");
        };
    }, []);
    useEffect(() => {
        console.log("----------Watch activeIndex | Script/ScriptDOM----------");
        fnHighlight();
    }, [activeSentence, activeVocab]);
    return (
        <article id={boxID} ref={articleRef}>
            {dataArticle.name ? <h1>{dataArticle.name.split("/")[0]}</h1> : ""}
            {dataArticle.scenes.length === 1
                ? dataArticle.scenes[0].paragraphs.map((paragraph) => {
                      return paragraph.roles.length <= 1 ? (
                          <div className="p" key={paragraph.key}>
                              <p>
                                  {paragraph.roles.length === 1 ? <i className="role">{paragraph.roles[0].split("-")[0]}: </i> : <></>}
                                  {paragraph.sentences.map((v) => {
                                      return (
                                          <React.Fragment key={v.key}>
                                              <span className="point">{v.texts[0].split("\n")[0]}</span>
                                          </React.Fragment>
                                      );
                                  })}
                              </p>
                          </div>
                      ) : (
                          <div className="p" key={paragraph.key}>
                              {paragraph.sentences.map((sentence) => {
                                  return (
                                      <ul className="point" key={sentence.key}>
                                          {sentence.texts.map((partOfSentence, n) => {
                                              return (
                                                  <li key={n}>
                                                      <i className="role">{paragraph.roles[n].split("-")[0]}: </i>
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
                : dataArticle.scenes.map((scene, index) => {
                      return (
                          <div className="scene" key={index}>
                              <h2>{scene.name}</h2>
                              {scene.paragraphs.map((paragraph) => {
                                  return paragraph.roles.length <= 1 ? (
                                      <div className="p" key={paragraph.key}>
                                          <p>
                                              {paragraph.roles.length === 1 ? <i className="role">{paragraph.roles[0].split("-")[0]}: </i> : <></>}
                                              {paragraph.sentences.map((v) => {
                                                  return (
                                                      <React.Fragment key={v.key}>
                                                          <span className="point">{v.texts[0].split("\n")[0]}</span>
                                                      </React.Fragment>
                                                  );
                                              })}
                                          </p>
                                      </div>
                                  ) : (
                                      <div className="p" key={paragraph.key}>
                                          {paragraph.sentences.map((sentence) => {
                                              return (
                                                  <ul className="point" key={sentence.key}>
                                                      {sentence.texts.map((partOfSentence, n) => {
                                                          return (
                                                              <li key={n}>
                                                                  <i className="role">{paragraph.roles[n].split("-")[0]}: </i>
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
                {dataArticle.vocabs.length > 1 ? (
                    <div className="vocabs">
                        <div className="title">Vocabs</div>
                        {dataArticle.vocabs.map((value, key) => {
                            return (
                                <p key={key} className="vocab-item" onClick={(e) => handlersSetVocabIndex(key)}>
                                    <span className="item-index">[{key + 1}] </span>
                                    {value}
                                </p>
                            );
                        })}
                    </div>
                ) : (
                    ""
                )}
                {dataArticle.notes.length > 1 ? (
                    <div className="notes">
                        <div className="title">Notes</div>
                        {dataArticle.notes.map((value, key) => {
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
                ) : (
                    ""
                )}
            </footer>
        </article>
    );
});

export default ScriptDOM;
