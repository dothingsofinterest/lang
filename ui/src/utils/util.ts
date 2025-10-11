export const fnShuffle = (data: string[]) => {
    const arr = data.slice(); // 复制一份，避免修改原数组
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // 随机一个索引 [0, i]
        [arr[i], arr[j]] = [arr[j], arr[i]]; // 交换元素
    }
    return arr;
};
