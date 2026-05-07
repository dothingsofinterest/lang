// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Vocab as DataVocab, Sentence as DataSentence } from "../../types/Data";

// interface StateVideo {
//     videoId: number;
//     videoURL: string;
//     videoAudioURL: string;
//     videoAudioWaveformURL: string;
//     script: any;
//     scriptSentenceList: any[];
//     vocabList: any[];
// }

// const initialState: StateVideo = {
//     videoId: 0,
//     videoURL: "",
//     videoAudioURL: "",
//     videoAudioWaveformURL: "",
//     script: {},
//     scriptSentenceList: [],
//     vocabList: [],
// };

// const slice = createSlice({
//     name: "data",
//     initialState,
//     reducers: {
//         updateVideoId: (state, action: PayloadAction<number>) => {
//             state.videoId = action.payload;
//         },
//         updateVideoURL: (state, action: PayloadAction<string>) => {
//             URL.revokeObjectURL(state.videoURL);
//             state.videoURL = action.payload;
//         },
//         updateVideoAudioURL: (state, action: PayloadAction<string>) => {
//             state.videoAudioURL = action.payload;
//         },
//         updateVideoAudioWaverURL: (state, action: PayloadAction<string>) => {
//             state.videoAudioWaveformURL = action.payload;
//         },
//         updateScript: (state, action: PayloadAction<any>) => {
//             state.script = action.payload;
//         },
//         updateScriptSentenceList: (state, action: PayloadAction<any>) => {
//             state.scriptSentenceList = action.payload;
//         },
//         updateVocabList: (state, action: PayloadAction<any>) => {
//             state.vocabList = action.payload;
//         },
//     },
// });

// export const { updateVideoId, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScript, updateScriptSentenceList, updateVocabList } = slice.actions;

// export default slice.reducer;
