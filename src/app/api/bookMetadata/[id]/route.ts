'use server'
import { NextRequest } from 'next/server';
import { getBookMetadata, insertBookMetadata } from '@/db/bookMetadata';
import { insertBook } from '@/db/bookAccess';
import { fetchBookMetadata, parseBookMetadata } from '../../apiFetch';
import { RequestParams } from '@/types/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const clientId = request.headers.get('x-client-id') ?? '';
        const id = (await params).id;

        //validation check
        if (!/^\d+$/.test(id)) {
            return new Response(
                JSON.stringify({ error: 'Invalid book ID' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        //check for book metadata in db
        let metadata = await getBookMetadata(id, clientId);
        if(metadata != null){
            return new Response(
                JSON.stringify(metadata),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
                    }
                }
            );
        }

        const resp = await fetchBookMetadata(id);
        if (!resp.response.ok) {
            return new Response(
                JSON.stringify({
                    error: `Failed to fetch book: ${resp.response.statusText}`,
                    status: resp.response.status
                }),
                {
                    status: resp.response.status,
                    headers: { 
                        'Content-Type': 'application/json' 
                    }
                }
            );
        }

        const html = await resp.response.text();
        metadata = parseBookMetadata(html, id);
        insertBookMetadata(metadata);
        insertBook(id, clientId);
        
        return new Response(
            JSON.stringify(metadata),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
                }
            }
        );

    } catch (error) {
        console.error('Error fetching book:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Failed to fetch book metadata',
                detail: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};