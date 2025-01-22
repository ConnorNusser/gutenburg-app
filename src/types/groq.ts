interface SentimentScore {
    joy: number;        
    trust: number;       
    anticipation: number;
    surprise: number;    
    sadness: number;     
    disgust: number;     
    anger: number;       
    fear: number;        
    overall: number;     
}

interface SentimentResponse {
    id: string;
    scores: SentimentScore;
    dominantEmotion: string;
    confidenceLevel: number;
    analyzedAt: Date;
}

type ModelConfig = {
    id: string;
    tokensPerMinute: number;
    priority: number;
};


export type { SentimentScore, SentimentResponse, ModelConfig}

