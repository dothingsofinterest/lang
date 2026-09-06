import React from "react";
import "./Index.scss";

const tokenize = (text: string) => {
    return (
        text
            // 拆分缩写
            .replace(/([a-zA-Z])('re|'ve|'ll|'d|'s|'m)\b/g, "$1 $2")
            // 标点前加空格
            .replace(/([:.,!?])/g, " $1")
            // 多空格压缩
            .replace(/\s+/g, " ")
            .trim()
    );
};

const manipulate = (sentence: any) => {
    if (!sentence) return [];
    const sentenceTemp = { ...sentence };
    sentenceTemp.text = sentenceTemp.text ? tokenize(sentenceTemp.text).split(" ") : [];
    return sentenceTemp;
};

interface ReadOnlyProps {
    sentence: any;
}

const ReadOnly: React.FC<ReadOnlyProps> = ({ sentence }) => {
    if (!sentence) return <></>;
    const data = manipulate(sentence);
    return <>{data && data.text.map((piece: string, k: number) => <React.Fragment key={k}>{`${piece} `}</React.Fragment>)}</>;
};

export default ReadOnly;
