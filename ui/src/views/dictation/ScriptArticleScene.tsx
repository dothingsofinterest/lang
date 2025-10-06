import React from "react";
import { Scene } from "../../types/Data";

interface ScriptArticleSceneProps {
    data: Scene[];
}

const ScriptArticleScene: React.FC<ScriptArticleSceneProps> = React.memo(({ data }) => {
    return (
        <React.Fragment>
            {data.map((scene, index) => {
                return (
                    <section className="scene" key={index}>
                        {scene.name && <h2>{scene.name}</h2>}
                        {scene.paragraphs.map((paragraph) => {
                            return paragraph.roles.length < 2 ? (
                                <p key={paragraph.key} className={paragraph.roles.length === 0 ? "pure" : undefined}>
                                    {paragraph.roles.length === 1 && <i className="role">{paragraph.roles[0].split("-")[0]}: </i>}
                                    {paragraph.sentences.map((v) => {
                                        return (
                                            <React.Fragment key={v.key}>
                                                <span className="point">{v.texts[0].split("\n")[0]}</span>
                                            </React.Fragment>
                                        );
                                    })}
                                </p>
                            ) : (
                                <React.Fragment key={paragraph.key}>
                                    {paragraph.sentences.map((sentence) => {
                                        return (
                                            <ul className="point" key={sentence.key}>
                                                {sentence.texts.map((partOfSentence: any, n: number) => {
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
                                </React.Fragment>
                            );
                        })}
                    </section>
                );
            })}
        </React.Fragment>
    );
});

export default ScriptArticleScene;
