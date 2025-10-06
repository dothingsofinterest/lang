import React from "react";

interface ScriptNotesProps {
    data: string[];
}
const ScriptNotes: React.FC<ScriptNotesProps> = React.memo(({ data }) => {
    return (
        <React.Fragment>
            {data.length > 0 && (
                <div className="notes">
                    <div className="title">Notes</div>
                    {data.map((value, key) => {
                        return (
                            <div key={key} className="note-item">
                                <span className="item-index">[{key + 1}] </span>
                                {value.split("\n").map((v, k) => {
                                    return k === 0 ? <span key={k}>{v}</span> : <p key={k}>{v}</p>;
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </React.Fragment>
    );
});

export default ScriptNotes;
