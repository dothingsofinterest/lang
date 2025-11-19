export const fnTextToHTML = (text: string): string[] => {
    return text.split("\n---\n").map((v, k) => {
        return v
            .replaceAll(/[ ]{2}/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
            .replaceAll(/\[/g, `<span class="hl">`)
            .replaceAll(/\]/g, `</span>`)
            .split("\n")
            .map((v) => `<p>${v}</p>`)
            .join("");
    });
};
