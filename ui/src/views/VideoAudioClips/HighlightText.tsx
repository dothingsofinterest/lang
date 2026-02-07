interface HighlightTextProps {
    text: string;
    keyword: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, keyword }) => {
    if (!keyword) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return <span>{parts.map((part, i) => (part.toLowerCase() === keyword.toLowerCase() ? <mark key={i}>{part}</mark> : part))}</span>;
};

export default HighlightText;
