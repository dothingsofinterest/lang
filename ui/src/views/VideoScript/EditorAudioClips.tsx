import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { ReloadOutlined, MinusOutlined } from "@ant-design/icons";
import { clipAudio } from "../../api/requestAuth";
import { Domain } from "../../settings.js";
import { md5 } from "js-md5";
import CommonPronunciationSymbols from "../Public/PronunciationSymbols";
import "./EditorAudioClip.scss";

interface EditorAudioClipProps {
    open: boolean;
    plan: string;
    onClose?: () => void;
}

const EditorAudioClip: React.FC<EditorAudioClipProps> = ({ plan, open, onClose }) => {
    const [audioTemp, setAudioTemp] = useState("");
    const [clipStart, setClipStart] = useState(`0`);
    const [clipEnd, setClipEnd] = useState(`0`);
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlersClipAudioGenerate = async () => {
        const start = Number(clipStart);
        const end = Number(clipEnd);
        if (end > start) {
            const nameText = `${Date.now()}`;
            const name = `${md5(nameText).slice(25)}`;
            const res = await clipAudio({ plan, name, start, end });
            if (res.code === 1) {
                setAudioTemp(`${name}.mp3`);
                if (refAudio.current) {
                    const audio = refAudio.current;
                    audio.src = `${Domain}/data/temp/${name}.mp3`;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    const handlersClipAudioPlay = () => {
        if (refAudio.current && audioTemp) {
            const audio = refAudio.current;
            audio.src = `${Domain}/data/temp/${audioTemp}`;
            audio.load();
            audio.play();
        }
    };
    const handlersOnClose = () => {
        if (onClose !== undefined) {
            onClose();
        }
    };
    useEffect(() => {
        return () => {};
    }, []);
    return (
        <Drawer id="video-script-audioClips" title="Edit Audio Clips" width={800} onClose={handlersOnClose} open={open}>
            <CommonPronunciationSymbols />
            <div className="pronunciation">
                <Button onClick={handlersClipAudioPlay}>{audioTemp}</Button>
            </div>
            <div className="clip-time">
                <Input value={clipStart} onChange={(e) => setClipStart(e.target.value)} />
                <MinusOutlined />
                <Input value={clipEnd} onChange={(e) => setClipEnd(e.target.value)} />
            </div>
            <div className="clip-submit">
                <Button icon={<ReloadOutlined />} onClick={handlersClipAudioGenerate} />
            </div>
            <section style={{ display: "none" }}>
                <audio ref={refAudio}></audio>
            </section>
        </Drawer>
    );
};

export default EditorAudioClip;
