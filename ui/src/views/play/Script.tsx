import React, { useState, useRef, useEffect } from "react";
import { ScriptArticle as DataScriptArticle, Scene as DataScene } from "../../types/Data";
import { useDispatch } from "react-redux";
import { updateActiveVocab } from "../../stores/reducers/project";

interface ScriptProps {
    dataArticle: DataScriptArticle;
    activeSentence: number;
    activeVocab: number;
    boxID?: string;
    onRendered?: (scrollTopPoint: number, scrollTopVocab: number) => void;
}
const Script: React.FC<ScriptProps> = React.memo(({ dataArticle, activeSentence, activeVocab, boxID = "article", onRendered }) => {
    console.log("[rendered] play/script");
    const dispatch = useDispatch();
    const articleRef = useRef<HTMLDivElement>(null);
    // Event Handlers
    const handlersSetVocabIndex = (index: number) => {
        dispatch(updateActiveVocab(index));
    };
    // Event Handlers
    // Functions
    const fnRender = () => {
        if (articleRef.current) {
            let scrollTopPoint = 0;
            let scrollTopVocab = 0;
            const spans = articleRef.current.querySelectorAll(".point");
            spans.forEach((span: any, k) => {
                span.className = activeSentence === k ? "point active" : "point";
                if (activeSentence === k) scrollTopPoint = span.getBoundingClientRect().top - 150;
            });
            const vocabItems = articleRef.current.querySelectorAll(".vocab-item");
            vocabItems.forEach((span: any, k) => {
                span.className = activeVocab === k ? "vocab-item active" : "vocab-item";
                if (activeVocab === k) scrollTopVocab = span.getBoundingClientRect().top + 150;
            });
            if (onRendered !== undefined) {
                onRendered(scrollTopPoint, scrollTopVocab);
            }
        }
    };
    // Functions
    // Lives Hook
    useEffect(() => {
        console.log("[mounted] play/script");
        fnRender();
        return () => {
            console.log("[unmounted] play/script");
        };
    }, []);
    useEffect(() => {
        console.log("[effected by activeSentence, activeVocab] play/script");
        fnRender();
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

export default Script;
