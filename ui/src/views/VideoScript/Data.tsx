import React, { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import { Scrollbars } from "react-custom-scrollbars-2";
import { ScissorOutlined, FileWordFilled, MinusCircleOutlined, GoogleOutlined, PlusCircleOutlined, TeamOutlined, DesktopOutlined, PlusSquareOutlined, MinusSquareOutlined, TranslationOutlined } from "@ant-design/icons";
import { RootState } from "../../stores";
import { useSelector, useDispatch } from "react-redux";
import { updateScriptParagraphs, updateScriptTitle, updateScriptRoles, updateScriptScenes, updateScriptGrammars, updateScriptVocabs, updateScriptExamples } from "../../stores/reducers/plan";
import { fnGetMaxTimeFromSentences } from "../../utils/script";
import { Vocab as DataVocab, Scene as DataScene, Paragraph as DataParagrap, Example as DataExample } from "../../types/Data";
import Paragraphs, { ParagraphsRef } from "./Paragraphs";
import EditorVocabs from "../CommonEditorVocabs/Index";
import EditorGrammars from "../CommonEditorGrammars/Index";
import EditorRoles from "./EditorRoles";
import EditorScenes from "./EditorScenes";
import EditorExample from "./EditorExample";
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
    const [exampleEditor, setExampleEditor] = useState(false);
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
    const handlersVocabsEditorSubmit = async (vocabs: DataVocab[]) => {
        dispatch(updateScriptVocabs(vocabs));
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
    const handlersExamplesEditorOpen = () => {
        setExampleEditor(true);
    };
    const handlersExamplesEditorClose = () => {
        setExampleEditor(false);
    };
    const handlersExamplesEditorSubmit = (examples: DataExample[]) => {
        dispatch(updateScriptExamples(examples));
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
                <Button icon={<TeamOutlined />} onClick={handlersRolesEditorOpen} />
                <Button icon={<DesktopOutlined />} onClick={handlersScenesEditorOpen} />
                <Button icon={<FileWordFilled />} onClick={handlersVocabsEditorOpen} />
                <Button icon={<GoogleOutlined />} onClick={handlersGrammarsEditorOpen} />
                <Button icon={<TranslationOutlined />} onClick={handlersExamplesEditorOpen} />
            </div>
            <div className="script-meta">
                <Input defaultValue={script.title} onBlur={(e) => handlersScriptNameUpdate(e.target.value)} placeholder="Script Title" />
            </div>
            <Paragraphs paragraphs={script.paragraphs} scenes={script.scenes} roles={script.roles} onSubmit={handlersParagraphsSubmit} ref={refParagraphs} />
            <EditorRoles roles={script.roles} open={rolesEditor} onClose={handlersRolesEditorClose} onSubmit={handlersRolesEditorSubmit} />
            <EditorScenes scenes={script.scenes} open={sceneEditor} onClose={handlersScenesEditorClose} onSubmit={handlersScenesEditorSubmit} />
            <EditorExample examples={script.examples ? script.examples : []} cates={script.scenes} open={exampleEditor} onClose={handlersExamplesEditorClose} onSubmit={handlersExamplesEditorSubmit} />
            <EditorVocabs plan={plan.hash} list={script.vocabs} open={vocabsEditor} onClose={handlersVocabsEditorClose} onSubmit={handlersVocabsEditorSubmit} />
            <EditorGrammars grammars={script.grammars} open={grammarsEditor} onClose={handlersGrammarsEditorClose} onSubmit={handlersGrammarsEditorSubmit} />
        </Scrollbars>
    );
});
export default Data;
