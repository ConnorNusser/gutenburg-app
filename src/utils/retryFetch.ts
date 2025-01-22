'use server'

import { FetchResult } from "@/types/api";

// exists as kind of just a nice retry wrapper for any functions :) 
export const retryFetch = async (
    fetchFn: () => Promise<Response>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<FetchResult> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetchFn();
            
            if (response.ok) {
                return { response, error: '' };
            }
        
            if (response.status !== 429 && response.status < 500) {
                return { 
                    response,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        } catch (error) {
            if (attempt === maxRetries - 1) {
                return {
                    response: new Response(null, {
                        status: 500,
                        statusText: 'Internal Server Error'
                    }),
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                };
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
        console.warn(`Retry attempt ${attempt + 1} of ${maxRetries}`);
    }
    return {
        response: new Response(null, {
            status: 500,
            statusText: 'Maximum retries reached'
        }),
        error: 'Maximum retries reached'
    };
};