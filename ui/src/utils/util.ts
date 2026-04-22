/**
 * Shuffle a array
 * @param data
 * @returns
 */
export const fnShuffle = (data: any[]) => {
    const arr = data.slice(); // 复制一份，避免修改原数组
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 随机一个索引 [0, i]
        [arr[i], arr[j]] = [arr[j], arr[i]]; // 交换元素
    }
    return arr;
};

/**
 * Randomly Get a number on a range
 */
export const fnRandom = (min: number, max: number, excluded: number[]) => {
    const excludedSet = new Set(excluded);
    const candidates = [];
    for (let i = min; i <= max; i++) {
        if (!excludedSet.has(i)) {
            candidates.push(i);
        }
    }
    if (candidates.length === 0) {
        throw new Error("candidates empty");
    }
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
};

/**
 * Transfer base64 string to binary
 */
export const fnBase64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        for (let j = 0; j < slice.length; j++) {
            byteNumbers[j] = slice.charCodeAt(j);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
};

/**
 * Randomly get indexes excluding certain one from a list
 */
export const fnGetRandomIndexes = (excludedItem: any, list: any[], count: number) => {
    const forCount = count > list.length ? list.length : count;
    const result: any[] = [excludedItem];
    for (let i = 0; i < forCount - 1; i++) {
        const excludedID = result.map((r) => r.id);
        const filterList = list.filter((item) => !excludedID.includes(item.id));
        const randomIndex = Math.floor(Math.random() * (filterList.length - 1));
        result.push(filterList[randomIndex]);
    }
    return fnShuffle(result);
};
