export interface Vocabulary {
    id: number;
    definition: string;
    image: string;
    speech: string;
    category: number; // 1:listening, 2:watching, 4:thinking of
    script_ids?: string;
}
