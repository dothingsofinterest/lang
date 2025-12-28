import { dataSync } from "../api/requestAuth";
import Joi from "joi";
import { Diary as DataDiary, Vocab as DataVocab, PlanData } from "../types/Data";
import { Domain } from "../settings.js";

export const fnGetFormattedData = (plan: string, diary: DataDiary): PlanData => {
    const data: PlanData = {
        title: diary.title,
        vocabs: [],
        grammars: diary.grammars,
        date: diary.date,
        content: diary.content,
        scenes: [],
        sentences: [],
    };
    const staticPrefix = `${Domain}/data/${plan}`;
    data.vocabs = diary.vocabs.map((v) => ({ ...v, image: v.image ? `${staticPrefix}/vocab_images/${v.image}` : ``, pronunciation: `${staticPrefix}/vocab_pronunciations/${v.pronunciation}` }));
    data.content = diary.content
        .replaceAll(/[ ]{2}/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replaceAll(/\[/g, `<span class="hl">`)
        .replaceAll(/\]/g, `</span>`)
        .split("\n")
        .map((v) => `<p>${v}</p>`)
        .join("");

    return data;
};

export const fnSyncDiary = async (plan: string, diary: DataDiary) => {
    const blob = new Blob([JSON.stringify(diary, null, 4)], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "diary.json");
    dataSync({ plan }, formData);
};

export const fnValidateDiary = (data: any): boolean => {
    const schema = Joi.object({
        title: Joi.string().required().allow(""),
        date: Joi.string().required(),
        content: Joi.string().required(),
        vocabs: Joi.array().items(Joi.object()).required(),
        grammars: Joi.array().items(Joi.string()).required(),
    });
    const { error, value } = schema.validate(data);
    if (error) {
        console.log("Json file validatation error:", error);
        return false;
    }
    return true;
};
