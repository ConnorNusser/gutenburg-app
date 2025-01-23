import { ModelConfig } from "@/types/groq";

export const DatabaseTableNames = {
    BOOK_ACCESS: 'book_access',
    BOOK_CONTENTS: 'book_contents',
    BOOK_METADATA: 'book_metadata',
    BOOK_SENTIMENTS: 'book_sentiments'
} as const;


export const AvailableModels: ModelConfig[] = [
    {
        id: "llama3-8b-8192",
        tokensPerMinute: 30000,
        priority: 1
    },
    {
        id: "gemma2-9b-it",
        tokensPerMinute: 15000,
        priority: 2
    },
    {
        id: "llama-guard-3-8b",
        tokensPerMinute: 15000,
        priority: 3
    },
    {
        id: "llama-3.1-8b-instant",
        tokensPerMinute: 20000,
        priority: 4
    }
];


export const promptTemplate = `Sentiment analysis system based on Plutchik's Wheel of Emotions
Score the following emotions from 0.0 to 1.0:

Positive: joy, trust, anticipation
Negative: sadness, disgust, anger, fear
Neutral: surprise

Scale:
0.0 = none
0.25 = slight
0.5 = moderate
0.75 = strong
1.0 = extreme

Return only a JSON object with these exact keys and numerical values.`;

export const userTemplate = (content: string) => `Analyze the following text. For each of the specified emotions (joy, trust, anticipation, sadness, disgust, anger, fear, surprise), provide a score from 0.0 to 1.0. Return only a JSON object with these exact keys and numerical values:
${content}
Example format:
{
    "joy": 0.7,
    "trust": 0.4,
    "anticipation": 0.6,
    "sadness": 0.2,
    "disgust": 0.1,
    "anger": 0.3,
    "fear": 0.2,
    "surprise": 0.5
}`;