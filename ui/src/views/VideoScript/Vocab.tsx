import React, { useState, useRef, useEffect } from "react";
import { Vocab as DataVocab } from "../../types/Data";
import "./Vocab.scss";

interface VocabProps {
    vocabs: DataVocab[];
    onRendered?: (index: number) => void;
}

const Vocab: React.FC<VocabProps> = ({ vocabs, onRendered }) => {
    const [vocabActive, setVocabActive] = useState(0);
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersClickVocab = (index: number) => {
        if (vocabs.length > 0) {
            setVocabActive(index);
            const vocab = vocabs[index];
            if (vocab && vocab.pronunciation) {
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = vocab.pronunciation;
                    audio.load();
                    audio.play();
                }
            }
            if (onRendered !== undefined) {
                onRendered(index);
            }
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <div id="script-vocab">
            <div className="vocab-list">
                {vocabs.length > 0 &&
                    vocabs.map((value, key) => {
                        return (
                            <div key={key} className={vocabActive === key ? "item active" : "item"} onClick={() => handlersClickVocab(key)}>
                                <span className="text">
                                    <i className="index">[{key + 1}] </i>
                                    {value.text}
                                </span>
                                <span className="img">{value.image && <img src={value.image} />}</span>
                            </div>
                        );
                    })}
            </div>
            <section style={{ display: "hidden" }}>
                <audio ref={refAudio}></audio>
            </section>
        </div>
    );
};

export default Vocab;
