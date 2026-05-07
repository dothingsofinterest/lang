import { Typography } from "antd";

const { Paragraph } = Typography;

const SpeechSymbols = () => {
    return (
        <div id="speech-symbols">
            <div className="line">
                <Paragraph copyable={{ text: "tə" }}>to ➤ tə</Paragraph>
                <Paragraph copyable={{ text: "ðer" }}>their ➤ ðer</Paragraph>
                <Paragraph copyable={{ text: "nɑːt" }}>not ➤ nɑːt</Paragraph>
                <Paragraph copyable={{ text: "ɪf" }}>if ➤ ɪf</Paragraph>
            </div>
            <div className="line">
                <Paragraph copyable={{ text: "ðæt" }}>that ➤ ðæt</Paragraph>
                <Paragraph copyable={{ text: "ɪt" }}>it ➤ ɪt</Paragraph>
                <Paragraph copyable={{ text: "ɪz" }}>is ➤ ɪz</Paragraph>
                <Paragraph copyable={{ text: "əv" }}>of ➤ əv</Paragraph>
            </div>
            <div className="line">
                <Paragraph copyable={{ text: "wen" }}>when ➤ wen</Paragraph>
                <Paragraph copyable={{ text: "ɪts" }}>its ➤ ɪts</Paragraph>
                <Paragraph copyable={{ text: "ɪn" }}>in ➤ ɪn</Paragraph>
                <Paragraph copyable={{ text: "æz" }}>as ➤ æz</Paragraph>
            </div>
            <div className="line">
                <Paragraph copyable={{ text: "ə" }}>a ➤ ə</Paragraph>
                <Paragraph copyable={{ text: "ən" }}>an ➤ ən</Paragraph>
                <Paragraph copyable={{ text: "ænd" }}>and ➤ ænd</Paragraph>
                <Paragraph copyable={{ text: "ðə" }}>the ➤ ðə</Paragraph>
            </div>
            <div className="line">
                <Paragraph copyable={{ text: "jə" }}>you ➤ jə</Paragraph>
                <Paragraph copyable={{ text: "jʊr" }}>your ➤ jʊr</Paragraph>
                <Paragraph copyable={{ text: "wəd" }}>would ➤ wəd</Paragraph>
                <Paragraph copyable={{ text: "hæv " }}>have ➤ hæv </Paragraph>
            </div>
            <div className="line">
                <Paragraph copyable={{ text: "aɪ" }}>I ➤ aɪ</Paragraph>
                <Paragraph copyable={{ text: "ɑːr" }}>our ➤ ɑːr</Paragraph>
                <Paragraph copyable={{ text: "ɑːr" }}>want ➤ ɑːr</Paragraph>
                <Paragraph copyable={{ text: "hər" }}>her ➤ hər</Paragraph>
            </div>
            <div className="line">
                <Paragraph copyable={{ text: "nɑːt" }}>not ➤ nɑːt</Paragraph>
                <Paragraph copyable={{ text: "æt" }}>at ➤ æt</Paragraph>
                <Paragraph copyable={{ text: "wət" }}>what ➤ wət </Paragraph>
                <Paragraph copyable={{ text: " | " }}>separation</Paragraph>
            </div>
        </div>
    );
};

export default SpeechSymbols;
