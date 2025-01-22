import { BookMetadata } from "@/types/book";
import supabaseClient from "./client";
import { updateLastAccessed } from "./bookAccess";
import { DatabaseTableNames } from "@/app/constants/const";

const insertBookMetadata = async (book: BookMetadata) => {
  const { error: upsertError } = await supabaseClient
      .from(DatabaseTableNames['BOOK_METADATA'])
      .upsert({
          id: book.id,
          title: book.title,
          author: book.author,
          metadata_url: book.metadata_url,
          release_date: book.release_date,
          language: book.language,
          fetched_at: book.fetched_at,
          interaction_count: book.interaction_count,
          summary: book.summary
  });

  if (upsertError) {
      console.error('Error upserting to Supabase:', upsertError);
      throw upsertError;  // Added throw
  }
}

const getBookMetadata = async (id: string, user_id: string): Promise<BookMetadata | null> => {
  updateLastAccessed(id, user_id);
  const { data, error } = await supabaseClient
    .from(DatabaseTableNames['BOOK_METADATA'])
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching book metadata:", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    release_date: data.release_date,
    metadata_url: data.metadata_url,
    language: data.language,
    fetched_at: data.fetched_at,
    interaction_count: data.interaction_count,
    summary: data.summary,
  };
};

const getBookMetadataBatch = async (ids: string[], user_id: string): Promise<BookMetadata[]> => {
  await Promise.all(ids.map(id => updateLastAccessed(id, user_id)));
  
  const { data, error } = await supabaseClient
    .from(DatabaseTableNames['BOOK_METADATA'])
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("Error fetching book metadata batch:", error);
    return [];
  }

  if (!data) return [];

  return data.map(item => ({
    id: item.id,
    title: item.title,
    author: item.author,
    release_date: item.release_date,
    metadata_url: item.metadata_url,
    language: item.language,
    fetched_at: item.fetched_at,
    interaction_count: item.interaction_count,
    summary: item.summary,
  }));
};


export { insertBookMetadata, getBookMetadata, getBookMetadataBatch }


