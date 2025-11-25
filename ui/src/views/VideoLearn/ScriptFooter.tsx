import React, { useRef } from "react";
import { Vocab } from "../../types/Data";
import "./ScriptFooter.scss";

interface ScriptVocabsProps {
    vocabs: Vocab[];
    grammars: string[];
}
const ScriptFooter: React.FC<ScriptVocabsProps> = React.memo(({ vocabs, grammars }) => {
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersPlayAudio = async (index: number) => {
        if (vocabs.length > 0) {
            const vocab = vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = vocab.pronunciation;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    return (
        <React.Fragment>
            {vocabs.length > 0 && (
                <div id="vocabs">
                    <div className="title">Vocabs</div>
                    {vocabs.map((value, key) => {
                        return (
                            <p key={key} className="item" onClick={() => handlersPlayAudio(key)}>
                                <span className="en">
                                    <i className="index">[{key + 1}]</i>
                                    {value.text.split(" | ")[0]}
                                </span>
                                <span className="pr">{value.text.split(" | ")[1]}</span>
                                <span className="cn">{value.text.split(" | ")[2]}</span>
                            </p>
                        );
                    })}
                    <section style={{ display: "hidden" }}>
                        <audio ref={refAudio}></audio>
                    </section>
                </div>
            )}
            {grammars.length > 0 && (
                <div id="grammars">
                    <div className="title">Grammars</div>
                    {grammars.map((value, key) => {
                        return (
                            <div key={key} className="item">
                                {value.split("\n").map((v, k) =>
                                    k === 0 ? (
                                        <span key={k}>
                                            <i className="index">[{key + 1}]</i>
                                            {v}
                                        </span>
                                    ) : (
                                        <p key={k}>{v}</p>
                                    ),
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
});

export default ScriptFooter;
