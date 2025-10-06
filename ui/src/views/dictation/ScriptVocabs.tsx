import React from "react";

interface ScriptVocabsProps {
    data: string[];
}
const ScriptVocabs: React.FC<ScriptVocabsProps> = React.memo(({ data }) => {
    return (
        <React.Fragment>
            {data.length > 0 && (
                <div className="vocabs">
                    <div className="title">Vocabs</div>
                    {data.map((value, key) => {
                        return (
                            <p key={key} className="vocab-item">
                                <span className="item-index">[{key + 1}] </span>
                                {value}
                            </p>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
});

export default ScriptVocabs;
