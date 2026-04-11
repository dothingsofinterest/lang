interface HighProps {
    text: string;
}

const High: React.FC<HighProps> = ({ text }) => {
    const hls = text.match(/(\s|)\[.+?\](\s|)/g);
    const textFiltered = text.replace(/[\[\]]/g, "");
    if (hls === null)
        return (
            <span>
                <mark>{textFiltered}</mark>
            </span>
        );
    const hlsFiltered = hls.map((v: string) => (v.includes("[") ? v.replace(/[\[\]]/g, "") : v));
    const regex = new RegExp(`(${hlsFiltered.join("|")})`, "gi");
    return <span>{textFiltered.split(regex).map((part, i) => (hlsFiltered.some((k) => k.toLowerCase() === part.toLowerCase()) ? <mark key={i}>{part}</mark> : part))}</span>;
};

export default High;
