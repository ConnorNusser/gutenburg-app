import { BookContent } from "@/types/book";
import supabaseClient from "./client";
import { insertBook, updateLastAccessed } from "./bookAccess";
import { DatabaseTableNames } from "@/app/constants/const";

const insertBookContent = async (book: BookContent) => {
    const { error: upsertError } = await supabaseClient
        .from(DatabaseTableNames['BOOK_CONTENTS'])
        .upsert({
            id: book.id,
            content: book.content,
            "urlUsed": book.urlUsed,
            "fetchedAt": book.fetchedAt
    });

    if (upsertError) {
        console.error('Error upserting to Supabase:', upsertError);
        throw upsertError; 
    }
}

const getBookContent = async (id: string, user_id: string): Promise<BookContent | null> => {
    insertBook(id, user_id);

    const { data, error } = await supabaseClient
        .from(DatabaseTableNames['BOOK_CONTENTS'])
        .select('*')
        .eq('id', id)  
        .single();

    if (error) {
        console.error('Error fetching book content:', error);
        return null;
    }

    if (!data) return null;

    return {
        id: data.id,  
        content: data.content,
        urlUsed: data.urlUsed,  
        fetchedAt: new Date(data.fetchedAt),  
    };
};


export { insertBookContent, getBookContent}