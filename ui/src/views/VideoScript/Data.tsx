import React, { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, ApiOutlined, FileWordFilled, MinusCircleOutlined, GoogleOutlined, PlusCircleOutlined, TeamOutlined, DesktopOutlined, PlusSquareOutlined, MinusSquareOutlined, CustomerServiceFilled } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { vocabImagePronunciationMove, vocabImagePronunciationRemove } from "../../api/requestAuth";
import { updateScriptParagraphs, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptAudioClips, updateScriptGrammars, updateScriptVocabs, updateScriptVocabsByDelete } from "../../stores/reducers/plan";
import { fnGetMaxTimeFromSentences } from "../../utils/script";
import { Vocab as DataVocab, Scene as DataScene, Paragraph as DataParagrap, AudioClip as DataAudioClip } from "../../types/Data";
import Paragraphs, { ParagraphsRef } from "./Paragraphs";
import EditorVocabs from "../CommonEditorVocabs/Index";
import EditorGrammars from "../CommonEditorGrammars/Index";
import EditorAudioClip from "./EditorAudioClips";
import EditorRoles from "./EditorRoles";
import EditorScenes from "./EditorScenes";
import "./Data.scss";

const Data = React.memo(() => {
    const dispatch = useDispatch();
    const plan = useSelector((state: RootState) => state.plan);
    const script = useSelector((state: RootState) => state.plan.script);
    const [renderVersion, setRenderVersion] = useState(0);
    const [vocabsEditor, setVocabsEditor] = useState(false);
    const [sceneEditor, setSceneEditor] = useState(false);
    const [rolesEditor, setRolesEditor] = useState(false);
    const [grammarsEditor, setGrammarsEditor] = useState(false);
    const [audioClipsEditor, setAudioClipsEditor] = useState(false);
    const refScrollbar = useRef<Scrollbars>(null);
    const refParagraphs = useRef<ParagraphsRef>(null);
    const refPanel = useRef<HTMLDivElement>(null);
    const refScrollTop = useRef(0);
    const handlersScriptNameUpdate = (value: string) => {
        dispatch(updateScriptTitle({ text: value.trim() }));
    };
    const handlersSentenceInsert = () => {
        refParagraphs.current?.insertSentence();
        refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
        setRenderVersion((prev) => prev + 1);
    };
    const handlersSentenceDelete = () => {
        refParagraphs.current?.deleteSentence();
        refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
        setRenderVersion((prev) => prev + 1);
    };
    const handlersSentenceLinkingsEditorOpen = () => {
        refParagraphs.current?.openLinkingsEditor();
    };
    const handlersParagraphInsert = () => {
        refParagraphs.current?.insertParagraph();
        refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
        setRenderVersion((prev) => prev + 1);
    };
    const handlersParagraphDelete = () => {
        const confirmed = window.confirm("Do you confirm to delete?");
        if (confirmed) {
            refParagraphs.current?.deleteParagraph();
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersParagraphCut = () => {
        const confirmed = window.confirm("Do you confirm to cut?");
        if (confirmed) {
            refParagraphs.current?.cutParagraph();
            refScrollTop.current = refScrollbar.current?.getScrollTop() || 0;
            setRenderVersion((prev) => prev + 1);
        }
    };
    const handlersParagraphsSubmit = (paragraphs: DataParagrap[]) => {
        dispatch(updateScriptParagraphs(paragraphs));
    };
    const handlersVocabsEditorOpen = () => {
        setVocabsEditor(true);
    };
    const handlersVocabsEditorClose = () => {
        setVocabsEditor(false);
    };
    const handlersVocabsEditorSubmit = async (vocab: DataVocab) => {
        if (vocab.text && vocab.pronunciation) {
            const res = await vocabImagePronunciationMove({ plan: plan.hash, vocabImage: vocab.image ? vocab.image : "a.txt", vocabPronunciation: vocab.pronunciation });
            if (res.code === 1) {
                dispatch(updateScriptVocabs(vocab));
            }
        }
    };
    const handlersVocabsEditorRemove = async (index: number) => {
        dispatch(updateScriptVocabsByDelete(index));
        const vocab = script.vocabs[index];
        if (vocab && (vocab.image || vocab.pronunciation)) {
            await vocabImagePronunciationRemove({ plan: plan.hash, vocabImage: vocab.image, vocabPronunciation: vocab.pronunciation });
        }
    };
    const handlersScenesEditorOpen = () => {
        setSceneEditor(true);
    };
    const handlersScenesEditorClose = () => {
        setSceneEditor(false);
    };
    const handlersScenesEditorSubmit = async (scenes: DataScene[]) => {
        dispatch(updateScriptScenes(scenes));
    };
    const handlersGrammarsEditorOpen = () => {
        setGrammarsEditor(true);
    };
    const handlersGrammarsEditorClose = () => {
        setGrammarsEditor(false);
    };
    const handlersGrammarsEditorSubmit = async (grammars: string[]) => {
        dispatch(updateScriptGrammars(grammars));
    };
    const handlersRolesEditorOpen = () => {
        setRolesEditor(true);
    };
    const handlersRolesEditorClose = () => {
        setRolesEditor(false);
    };
    const handlersRolesEditorSubmit = async (roles: string[]) => {
        dispatch(updateScriptRoles(roles));
    };
    const handlersClipsEditorOpen = () => {
        setAudioClipsEditor(true);
    };
    const handlersAudioClipsEditorClose = () => {
        setAudioClipsEditor(false);
    };
    const handlersAudioClipsEditorSubmit = async (audioClips: DataAudioClip[]) => {
        dispatch(updateScriptAudioClips(audioClips));
    };
    const handlersScroll = (event: React.UIEvent<HTMLElement>) => {
        const target = event.currentTarget;
        if (refPanel.current) {
            if (target.scrollTop > 50) {
                refPanel.current.classList.add("fixed");
            } else {
                refPanel.current.classList.remove("fixed");
            }
        }
    };
    // For the clear script button
    const handlersResortData = () => {
        const paragraphs = [...script.paragraphs];
        const n = paragraphs.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - 1 - i; j++) {
                const maxTime = fnGetMaxTimeFromSentences(paragraphs[j].sentences);
                const maxTimeNext = fnGetMaxTimeFromSentences(paragraphs[j + 1].sentences);
                if (maxTime > maxTimeNext) {
                    const temp = paragraphs[j];
                    paragraphs[j] = paragraphs[j + 1];
                    paragraphs[j + 1] = temp;
                }
            }
        }
        const newParagraphs = paragraphs.map((paragraph, pk) => {
            const newValue = { ...paragraph };
            newValue.key = `${pk}`;
            newValue.sentences = newValue.sentences.map((sentence, sk) => {
                const newValue = { ...sentence };
                newValue.key = `${pk}-${sk}`;
                return newValue;
            });
            return newValue;
        });
        dispatch(updateScriptParagraphs(newParagraphs));
        setRenderVersion((prev) => prev + 1);
        alert("Succeed.");
    };
    useEffect(() => {
        return () => {};
    }, []);
    useEffect(() => {
        refScrollbar.current?.scrollTop(refScrollTop.current);
    }, [renderVersion]);
    return (
        <Scrollbars id="video-script-data" key={renderVersion} style={{ width: "100%", height: "100%" }} ref={refScrollbar} onScroll={handlersScroll}>
            <div ref={refPanel} className="script-panel">
                <Button icon={<PlusSquareOutlined />} onClick={handlersParagraphInsert}>
                    P
                </Button>
                <Button icon={<MinusSquareOutlined />} onClick={handlersParagraphDelete}>
                    P
                </Button>
                <Button icon={<ScissorOutlined />} onClick={handlersParagraphCut}>
                    P
                </Button>
                <Button icon={<PlusCircleOutlined />} onClick={handlersSentenceInsert}>
                    S
                </Button>
                <Button icon={<MinusCircleOutlined />} onClick={handlersSentenceDelete}>
                    S
                </Button>
                <Button icon={<ApiOutlined />} onClick={handlersSentenceLinkingsEditorOpen} />
                <Button icon={<CustomerServiceFilled />} onClick={handlersClipsEditorOpen} />
                <Button icon={<TeamOutlined />} onClick={handlersRolesEditorOpen} />
                <Button icon={<DesktopOutlined />} onClick={handlersScenesEditorOpen} />
                <Button icon={<FileWordFilled />} onClick={handlersVocabsEditorOpen} />
                <Button icon={<GoogleOutlined />} onClick={handlersGrammarsEditorOpen} />
            </div>
            <div className="script-meta">
                <Input defaultValue={script.title} onBlur={(e) => handlersScriptNameUpdate(e.target.value)} placeholder="Script Title" />
            </div>
            <Paragraphs paragraphs={script.paragraphs} scenes={script.scenes} roles={script.roles} onSubmit={handlersParagraphsSubmit} ref={refParagraphs} />
            <EditorRoles roles={script.roles} open={rolesEditor} onClose={handlersRolesEditorClose} onSubmit={handlersRolesEditorSubmit} />
            <EditorScenes scenes={script.scenes} open={sceneEditor} onClose={handlersScenesEditorClose} onSubmit={handlersScenesEditorSubmit} />
            <EditorAudioClip list={script.audioClips ? script.audioClips : []} open={audioClipsEditor} onClose={handlersAudioClipsEditorClose} onSubmit={handlersAudioClipsEditorSubmit} plan={plan.hash} />
            <EditorVocabs vocabs={plan.data.vocabs} open={vocabsEditor} onClose={handlersVocabsEditorClose} onSubmit={handlersVocabsEditorSubmit} onRemove={handlersVocabsEditorRemove} />
            <EditorGrammars grammars={script.grammars} open={grammarsEditor} onClose={handlersGrammarsEditorClose} onSubmit={handlersGrammarsEditorSubmit} />
        </Scrollbars>
    );
});
export default Data;
