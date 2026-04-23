import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StateVideo {
    videoURL: string;
    videoAudioURL: string;
    videoAudioWaveformURL: string;
}

const initialState: StateVideo = {
    videoURL: "",
    videoAudioURL: "",
    videoAudioWaveformURL: "",
};

const slice = createSlice({
    name: "data",
    initialState,
    reducers: {
        updateVideoURL: (state, action: PayloadAction<string>) => {
            URL.revokeObjectURL(state.videoURL);
            state.videoURL = action.payload;
        },
        updateVideoAudioURL: (state, action: PayloadAction<string>) => {
            state.videoAudioURL = action.payload;
        },
        updateVideoAudioWaverURL: (state, action: PayloadAction<string>) => {
            state.videoAudioWaveformURL = action.payload;
        },
    },
});

export const { updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL } = slice.actions;

export default slice.reducer;
