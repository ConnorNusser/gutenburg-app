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
    [key: string]: number;      
}

interface SentimentResponse {
    id: string;
    overall: number;
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

