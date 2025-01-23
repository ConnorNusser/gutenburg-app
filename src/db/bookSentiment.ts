import { DatabaseTableNames } from '@/app/constants/const';
import supabaseClient from './client';
import { SentimentScore } from '@/types/groq';

export const getSentimentAnalysis = async (id: string) => {
    const { data, error } = await supabaseClient
        .from(DatabaseTableNames['BOOK_SENTIMENTS'])
        .select('*')
        .eq('id', id)
        .single();
        
    if (error) {
        console.error('Error fetching sentiment analysis:', error);
        return null;
    }
    return data;
};

export const storeSentimentAnalysis = async (
    id: string,
    scores: SentimentScore,
    dominantEmotion: string,
    confidenceLevel: number
) => {
    const { error } = await supabaseClient
        .from(DatabaseTableNames['BOOK_SENTIMENTS'])
        .upsert({
            id,
            overall_score: scores.overall,
            dominant_emotion: dominantEmotion,
            confidence_level: confidenceLevel,
            analyzed_at: new Date()
        });

    if (error) {
        console.error('Error storing sentiment analysis:', error);
        throw error;
    }
};