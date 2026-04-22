import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StateData, Paragraph } from "../../types/Data";
import { Script as DataScript, PayloadScript, Vocab as DataVocab, Scene as DataScene, Grammar as DataGrammar, Impression as DataImpression } from "../../types/Data";
import { fnGetFormattedData, fnSyncScript } from "../../utils/script";

const initialState: StateData = {
    videoHash: "",
    videoURL: "",
    videoAudioURL: "",
    videoAudioWaveformURL: "",
    script: {
        title: "",
        roles: [],
        scenes: [],
        paragraphs: [
            {
                id: 1,
                scene: ``,
                roles: [],
                sentences: [
                    {
                        id: 1,
                        startTime: "",
                        endTime: "",
                        texts: [],
                    },
                ],
            },
        ],
        vocab: [],
        grammar: [],
        impression: {
            content: "",
            grammar: [],
        },
    },
    scriptParsed: {
        hash: "",
        title: "",
        vocab: [],
        grammar: [],
        exampleRecogn: [],
        exampleTranslation: [],
        scenes: [],
        sentences: [],
        impression: {
            content: "",
            grammar: [],
        },
    },
};

const slice = createSlice({
    name: "data",
    initialState,
    reducers: {
        updateVideoHash: (state, action: PayloadAction<string>) => {
            state.videoHash = action.payload;
        },
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
        updateScriptData: (state, action: PayloadAction<DataScript>) => {
            state.script = action.payload;
            state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
            fnSyncScript(state.videoHash, state.script);
        },
        updateScriptTitle: (state, action: PayloadAction<PayloadScript>) => {
            if (action.payload.text !== undefined) {
                state.script = { ...state.script, title: action.payload.text };
                state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
                fnSyncScript(state.videoHash, state.script);
            }
        },
        updateScriptVocab: (state, action: PayloadAction<DataVocab[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, vocab: action.payload };
                state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
                fnSyncScript(state.videoHash, state.script);
            }
        },
        updateScriptGrammar: (state, action: PayloadAction<DataGrammar[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, grammar: action.payload };
                state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
                fnSyncScript(state.videoHash, state.script);
            }
        },
        updateScriptRoles: (state, action: PayloadAction<string[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, roles: action.payload };
                state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
                fnSyncScript(state.videoHash, state.script);
            }
        },
        updateScriptScenes: (state, action: PayloadAction<DataScene[]>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, scenes: action.payload };
                state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
                fnSyncScript(state.videoHash, state.script);
            }
        },
        updateScriptParagraphs: (state, action: PayloadAction<Paragraph[]>) => {
            state.script = { ...state.script, paragraphs: action.payload };
            state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
            fnSyncScript(state.videoHash, state.script);
        },
        updateScriptImpression: (state, action: PayloadAction<DataImpression>) => {
            if (action.payload !== undefined) {
                state.script = { ...state.script, impression: action.payload };
                state.scriptParsed = fnGetFormattedData(state.videoHash, state.script);
                fnSyncScript(state.videoHash, state.script);
            }
        },
    },
});

export const { updateVideoHash, updateVideoURL, updateVideoAudioURL, updateVideoAudioWaverURL, updateScriptData, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptVocab, updateScriptGrammar, updateScriptParagraphs, updateScriptImpression } = slice.actions;

export default slice.reducer;
