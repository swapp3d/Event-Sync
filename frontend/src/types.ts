export interface EventDto {
    id: number;
    title: string;
    description: string;
}

export type Mood = "positive" | "neutral" | "negative";

export interface FeedbackExampleDto {
    text: string;
    mood: Mood | string;
    positiveScore?: number;
    neutralScore?: number;
    negativeScore?: number;
}

export interface EventSummaryDto {
    summary: string;
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    examples: FeedbackExampleDto[];
}
