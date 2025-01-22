'use server'
import { getContentUrl } from '@/utils/url';
import { ErrorResponse } from '@/types/api';
import { NextRequest } from 'next/server';
import { getBookContent, insertBookContent } from '@/db/bookContent';
import { insertBook } from '@/db/bookAccess';
import { fetchBookContent, parseBookContent } from '../../apiFetch';


export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const clientId = request.headers.get('x-client-id') ?? '';
        const id = context.params.id;
        
        if (!/^\d+$/.test(id)) {
            const error: ErrorResponse = {
                statusCode: 400,
                detail: 'invalid book id',
                timestamp: new Date()
            };
            return new Response(JSON.stringify(error), { status: 400 });
        }

        const data = await getBookContent(id, clientId);

        if (data) {
            return new Response(
                JSON.stringify({
                    id,
                    content: data.content,
                    urlUsed: data.urlUsed,
                    fetchedAt: data.fetchedAt
                }),
                { status: 200 }
            );
        }

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
        const parsedContent = parseBookContent(
            rawContent,
            id,
            getContentUrl(id),
        );

        insertBookContent(parsedContent);
        insertBook(id, clientId);

        return new Response(
            JSON.stringify(parsedContent),
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
};