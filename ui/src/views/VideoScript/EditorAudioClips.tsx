import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Drawer } from "antd";
import { PlusSquareOutlined, ReloadOutlined, MinusOutlined } from "@ant-design/icons";
import { clipAudio, clipAudioMove, clipAudioRemove } from "../../api/requestAuth";
import { Domain } from "../../settings.js";
import { AudioClip } from "../../types/Data";
import { md5 } from "js-md5";
import CommonPronunciationSymbols from "../Public/PronunciationSymbols";
import "./EditorAudioClip.scss";

interface EditorAudioClipProps {
    open: boolean;
    plan: string;
    list: AudioClip[];
    onClose?: () => void;
    onSubmit?: (list: AudioClip[]) => void;
}

const defaultAudioClip = { text: "", audio: "" };

const EditorAudioClip: React.FC<EditorAudioClipProps> = ({ plan, list, open, onClose, onSubmit }) => {
    const [audioClipTemp, setAudioClipTemp] = useState<AudioClip>(defaultAudioClip);
    const [clipStart, setClipStart] = useState(`0`);
    const [clipEnd, setClipEnd] = useState(`0`);
    const [audioClipsActive, setAudioClipsActive] = useState(-1);
    const refAudio = useRef<HTMLAudioElement>(null);
    const refListClipAudio = useRef<HTMLAudioElement>(null);
    const handlersTempClipAudioGenerate = async () => {
        if (audioClipTemp.text) {
            const start = Number(clipStart);
            const end = Number(clipEnd);
            if (end > start) {
                const nameText = audioClipTemp.text.replaceAll(/[\s\,\/\:\?\.\%]+/g, "_");
                const nameStartTime = `${start}`.replaceAll(/[\.]+/g, "");
                const nameEndTime = `${end}`.replaceAll(/[\.]+/g, "");
                const name = `${md5(nameText).slice(25)}_${nameStartTime}_${nameEndTime}`;
                const res = await clipAudio({ plan, name, start, end });
                if (res.code === 1) {
                    setAudioClipTemp({ ...audioClipTemp, audio: `${name}.mp3` });
                }
            }
        }
    };
    const handlersTempClipAudioPlay = () => {
        if (audioClipTemp && audioClipTemp.audio) {
            if (refAudio.current) {
                const audio = refAudio.current;
                audio.src = `${Domain}/data/temp/${audioClipTemp.audio}`;
                audio.load();
                audio.play();
            }
        }
    };
    const handlersTempClipTextUpdate = (value: string) => {
        if (value) {
            setAudioClipTemp({ ...audioClipTemp, text: value });
        }
    };
    const handlersListClipClick = (index: number) => {
        if (list.length > 0) {
            setAudioClipsActive(index);
            const audioClip = list[index];
            if (audioClip && audioClip.audio) {
                setAudioClipTemp(audioClip);
                if (refListClipAudio.current) {
                    const audio = refListClipAudio.current;
                    audio.src = `${Domain}/data/${plan}/audio_clips/${audioClip.audio}`;
                    audio.load();
                    audio.play();
                }
            }
        }
    };
    const handlersListClipDelete = async () => {
        const confirmed = window.confirm("Are you confirmed to delete?");
        if (confirmed) {
            const curAudioClip = list[audioClipsActive];
            if (curAudioClip !== undefined) {
                const res = await clipAudioRemove({ plan: plan, clip: curAudioClip.audio });
                if (res.code === 1) {
                    const a = list.slice(0, audioClipsActive);
                    const b = list.slice(audioClipsActive + 1);
                    const newList = [...a, ...b];
                    if (onSubmit !== undefined) {
                        setAudioClipTemp(defaultAudioClip);
                        setClipStart(`0`);
                        setClipEnd(`0`);
                        setAudioClipsActive(-1);
                        onSubmit(newList);
                    }
                }
            }
        }
    };
    const handlersListClipAdd = async () => {
        if (audioClipsActive === -1) {
            if (audioClipTemp.text && audioClipTemp.audio) {
                const res = await clipAudioMove({ plan: plan, clip: audioClipTemp.audio });
                if (res.code === 1) {
                    const newList = [...list];
                    newList.unshift(audioClipTemp);
                    if (onSubmit !== undefined) {
                        setAudioClipTemp(defaultAudioClip);
                        setClipStart(`0`);
                        setClipEnd(`0`);
                        setAudioClipsActive(-1);
                        onSubmit(newList);
                    }
                }
            }
        }
    };
    const handlersListClipUpdate = () => {
        if (audioClipsActive !== -1) {
            if (audioClipTemp.text && audioClipTemp.audio) {
                const newList = list.map((item, index) => (index === audioClipsActive ? { ...item, text: audioClipTemp.text } : item));
                if (onSubmit !== undefined) {
                    setAudioClipTemp(defaultAudioClip);
                    setClipStart(`0`);
                    setClipEnd(`0`);
                    setAudioClipsActive(-1);
                    onSubmit(newList);
                }
            }
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
        <Drawer id="video-script-audioClips" title="Edit Audio Clips" size="large" onClose={handlersOnClose} open={open}>
            <CommonPronunciationSymbols />
            <div className="clip-text">
                <Input value={audioClipTemp.text} onChange={(e) => handlersTempClipTextUpdate(e.target.value)} />
            </div>
            <div className="clip-auto">
                <Button onClick={handlersTempClipAudioPlay}>{audioClipTemp.audio}</Button>
            </div>
            <div className="clip-auto-panel">
                <Input value={clipStart} onChange={(e) => setClipStart(e.target.value)} />
                <MinusOutlined />
                <Input value={clipEnd} onChange={(e) => setClipEnd(e.target.value)} />
                <Button icon={<ReloadOutlined />} onClick={handlersTempClipAudioGenerate} />
            </div>
            <div className="clip-submit">
                <Button icon={<ReloadOutlined />} onClick={handlersListClipUpdate} />
                <Button icon={<MinusOutlined />} onClick={handlersListClipDelete} />
                <Button icon={<PlusSquareOutlined />} onClick={handlersListClipAdd} />
            </div>
            <div className="list">
                {list.length > 0 &&
                    list.map((clip, key) => {
                        return (
                            <div key={key} className={audioClipsActive === key ? "item active" : "item"} onClick={() => handlersListClipClick(key)}>
                                <i className="index">[{key + 1}] </i>
                                {clip.text}
                            </div>
                        );
                    })}
            </div>
            <section style={{ display: "none" }}>
                <audio ref={refAudio}></audio>
                <audio ref={refListClipAudio}></audio>
            </section>
        </Drawer>
    );
};

export default EditorAudioClip;
