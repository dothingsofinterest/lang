import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface AudioProps {
    loop: boolean;
}

export interface AudioRef {
    play: (src: string, speed: number) => void;
    pause: () => void;
    isPlaying: boolean;
}

const Audio = forwardRef<AudioRef, AudioProps>(({ loop = false }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const refAudio = useRef<HTMLAudioElement>(null);
    const handlerPlay = (src: string, speed: number) => {
        const audio = refAudio.current;
        if (audio && src && speed) {
            audio.src = src;
            audio.playbackRate = speed;
            audio.play();
            setIsPlaying(true);
        }
    };
    const handlerPause = () => {
        const audio = refAudio.current;
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
    };
    useImperativeHandle(ref, () => ({
        play: handlerPlay,
        pause: handlerPause,
        isPlaying,
    }));
    useEffect(() => {
        const audio = refAudio.current;
        if (!audio) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);
        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);
    return <audio ref={refAudio} loop={loop} style={{ display: "none" }}></audio>;
});

export default Audio;
