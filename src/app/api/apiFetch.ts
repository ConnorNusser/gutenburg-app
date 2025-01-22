import { retryFetch } from "@/utils/retryFetch";
import { BookContent, BookMetadata } from "@/types/book";
import { SentimentScore } from "@/types/groq";
import { cleanBookContent, cleanSummary, cleanTitle } from "@/utils/textParser";
import { getContentUrl, getAlternativeContent, getMetadataUrl } from "@/utils/url";
import * as cheerio from 'cheerio';
import { AvailableModels, promptTemplate, userTemplate } from "../constants/const";
import Groq from "groq-sdk";
import { FetchResult } from "@/types/api";

const parseBookContent = (content: string, bookId: string, urlUsed: string): BookContent => {
    const cleanedContent = cleanBookContent(content);
    return {
        id: bookId,
        content: cleanedContent,
        urlUsed,
        fetchedAt: new Date(),
    };
};

const fetchBookContent = async (bookId: string): Promise<FetchResult> => {
    const contentUrl = getContentUrl(bookId);
    const response = await retryFetch(
        () => fetch(contentUrl, {
            headers: {
                'User-Agent': 'connornusser@gmail.com'
            }
        })
    );
    if(response.error){
        const alternativeResp =  await retryFetch(() => fetch(getAlternativeContent(bookId)));
        return alternativeResp;
    }
    return response;
};

const parseBookMetadata = (html: string, bookId: string): BookMetadata => {
    const $ = cheerio.load(html);
    
    const raw_title = $('h1[itemprop="name"]').text().trim() || '-';
    const author = $('a[itemprop="creator"]').text().trim() || '-';
    const release_date = $('td[itemprop="datePublished"]').text().trim() || '-';
    const language = $('tr[property="dcterms:language"] td').text().trim() || '-';
    const raw_count = $('td[itemprop="interactionCount"]').text().trim() || '-';
    const raw_summary = $('th:contains("Summary")').next('td').text().trim() || '-';

    const title = cleanTitle(raw_title);
    const summary = cleanSummary(raw_summary);

    return {
        id: bookId,
        title,
        author,
        metadata_url: getMetadataUrl(bookId),
        language,
        release_date,
        fetched_at: new Date().toISOString(),
        interaction_count: raw_count,
        summary,
    };
};

const fetchBookMetadata = async (bookId: string): Promise<FetchResult> => {
    const contentUrl = getMetadataUrl(bookId);
    const response = await retryFetch(() => 
        fetch(contentUrl, {
            headers: {
                'User-Agent': 'connornusser@gmail.com'
            }
        })
    );
    return response;
};


const analyzeChunkWithModel = async (
    content: string, 
    modelId: string
): Promise<SentimentScore> => {
    const groq = new Groq({ apiKey: process.env.GROG_API_KEY });
    console.log(content);
    console.log(modelId);
    const response = await groq.chat.completions.create({
        model: modelId,
        messages: [
            {
                role: 'system',
                content: promptTemplate
            },
            {
                role: 'user',
                content: userTemplate(content)
            }
        ]
    });

    const jsonString = response.choices[0].message.content ?? "{}";
    return JSON.parse(jsonString) as SentimentScore;
};

const splitContent = (content: string, maxChunkSize: number = 10000): string[] => {
    const numChunks = Math.ceil(content.length / maxChunkSize);
    const chunks: string[] = [];
    
    for (let i = 0; i < numChunks; i++) {
        const start = i * maxChunkSize;
        const end = Math.min(start + maxChunkSize, content.length);
        chunks.push(content.slice(start, end));
    }
    
    return chunks;
};

const analyzeSentiment = async (content: string): Promise<SentimentScore> => {
    const maxContentSize = content.slice(0, 45000);
    const chunks = splitContent(maxContentSize);
    const chunkScores: SentimentScore[] = [];
    
    const modelQueues = new Map<string, string[]>();
    let currentModelIndex = 0;

    chunks.forEach((chunk) => {
        const modelId = AvailableModels[currentModelIndex];
        if (!modelQueues.has(modelId.id)) {
            modelQueues.set(modelId.id, []);
        }
        modelQueues.get(modelId.id)!.push(chunk);
        currentModelIndex = (currentModelIndex + 1) % AvailableModels.length;
    });

    const modelPromises = Array.from(modelQueues.entries()).map(async ([modelId, modelChunks]) => {
        for (const chunk of modelChunks) {
            try {
                const scores = await analyzeChunkWithModel(chunk, modelId);
                console.log(scores, 'these are scores');
                chunkScores.push(scores);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error analyzing chunk with model ${modelId}:`, error);
                const fallbackModel = AvailableModels.find(m => m.id !== modelId);
                if (fallbackModel) {
                    try {
                        const fallbackScores = await analyzeChunkWithModel(chunk, fallbackModel.id);
                        chunkScores.push(fallbackScores);
                    } catch (fallbackError) {
                        console.error('Fallback analysis failed:', fallbackError);
                    }
                }
            }
        }
    });

    await Promise.all(modelPromises);

    const aggregatedScores: SentimentScore = {
        joy: 0,
        trust: 0,
        anticipation: 0,
        sadness: 0,
        disgust: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        overall: 0
    };

    //  average scores
    chunkScores.forEach(scores => {
        Object.keys(aggregatedScores).forEach(key => {
            if (key !== 'overall') {
                aggregatedScores[key] += scores[key] / chunkScores.length;
            }
        });
    });

    // calculate positive agg
    const positiveEval = (
        aggregatedScores.joy * 1.0 +           
        aggregatedScores.trust * 0.9 +         
        aggregatedScores.anticipation * 0.8 +  
        aggregatedScores.surprise * 0.5
    );

    // calculate negative agg
    const negativeEval = (
        aggregatedScores.sadness * 0.7 +     
        aggregatedScores.disgust * 0.6 +     
        aggregatedScores.anger * 0.8 +       
        aggregatedScores.fear * 0.6 
    );

    const maxNegative = 2.7;
    const maxPositive = 3.3;
    
    const positiveScore = (positiveEval / maxPositive) * 100;
    const negativeScore = (negativeEval / maxNegative) * 100;
    
    aggregatedScores.overall = positiveScore - negativeScore;

    return aggregatedScores;
};



export {parseBookContent, fetchBookContent, parseBookMetadata, fetchBookMetadata, analyzeSentiment};