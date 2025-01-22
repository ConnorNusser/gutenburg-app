'use server';
import { NextRequest } from 'next/server';
import { ErrorResponse } from '@/types/api';
import supabaseClient from '@/db/client';
import { SentimentResponse, SentimentScore } from '@/types/groq';
import { getSentimentAnalysis, storeSentimentAnalysis } from '@/db/bookSentiment';
import { analyzeSentiment, fetchBookContent, parseBookContent } from '../../apiFetch';
import { getContentUrl } from '@/utils/url';


const getDominantEmotion = (scores: SentimentScore): string => {
    const emotions = Object.entries(scores)
        .filter(([key]) => key !== 'overall')
        .sort(([, a], [, b]) => b - a);
    return emotions[0][0];
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        
        if (!/^\d+$/.test(id)) {
            const error: ErrorResponse = {
                statusCode: 400,
                detail: 'invalid book id',
                timestamp: new Date()
            };
            return new Response(JSON.stringify(error), { status: 400 });
        }

        // Use getSentimentAnalysis instead of direct query
        const existingAnalysis = await getSentimentAnalysis(id);

        if (existingAnalysis && 
            new Date(existingAnalysis.analyzed_at).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
            const SentimentResp: SentimentResponse = {
                id,
                overall: existingAnalysis.overall_score,
                dominantEmotion: existingAnalysis.dominant_emotion,
                confidenceLevel: existingAnalysis.confidence_level,
                analyzedAt: existingAnalysis.analyzed_at
            }
            return new Response(
                JSON.stringify(SentimentResp),
                { status: 200 }
            );
        }

        let { data: bookContent } = await supabaseClient
            .from('book_contents')
            .select('content')
            .eq('id', id)
            .single();

        if (!bookContent) {
            const fetchResult = await fetchBookContent(id);

            if (fetchResult.error || !fetchResult.response) {
    
                const error: ErrorResponse = {
                    statusCode: fetchResult.response?.status || 500,
                    detail: fetchResult.error || 'Failed to fetch book content',
                    timestamp: new Date()
                };
                return new Response(JSON.stringify(error), { status: error.statusCode });
            }
            const rawContent = await fetchResult.response.text();
            bookContent = parseBookContent(
                rawContent,
                id,
                getContentUrl(id),
            );
        }

        const scores = await analyzeSentiment(bookContent.content);
        const dominantEmotion = getDominantEmotion(scores);
        
        const confidenceLevel = Math.max(...Object.values(scores).filter(score => 
            typeof score === 'number' && score <= 1
        ));

        try {
            await storeSentimentAnalysis(id, scores, dominantEmotion, confidenceLevel);
        } catch (error) {
            console.error('Error storing sentiment analysis:', error);
        }

        const sentimentResponse: SentimentResponse = {
            id,
            overall: scores.overall,
            dominantEmotion,
            confidenceLevel,
            analyzedAt: new Date()
        };

        return new Response(
            JSON.stringify(sentimentResponse),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
                }
            }
        );

    } catch (error) {
        const errorResponse: ErrorResponse = {
            statusCode: 500,
            detail: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
        };
        return new Response(JSON.stringify(errorResponse), { status: 500 });
    }
}