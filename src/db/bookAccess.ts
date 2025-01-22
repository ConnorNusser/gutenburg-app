import { DatabaseTableNames } from "@/app/constants/const";
import supabaseClient from "./client";

const insertBook = async (id: string, user_id: string) => {
  const { data: existingAccess } = await supabaseClient
    .from(DatabaseTableNames['BOOK_ACCESS'])
    .select('*')
    .eq('id', id)
    .eq('user_id', user_id)
    .single();

  if (existingAccess) {
    return updateLastAccessed(id, user_id);
  }

  const { error } = await supabaseClient
    .from(DatabaseTableNames['BOOK_ACCESS'])
    .upsert({ 
      id: id,
      user_id: user_id,
      last_accessed: new Date(),
      created_at: new Date()
    });

  if (error) {
    console.error("Error upserting to books table:", error);
    throw error;
  }
};

const getMostRecentBooks = async (limit: number = 10, user_id: string): Promise<string[]> => { 
    const { data, error } = await supabaseClient
      .from(DatabaseTableNames['BOOK_ACCESS'])
      .select("id")
      .eq("user_id", user_id)
      .order("last_accessed", { ascending: false })
      .limit(limit);
  
    if (error) {
      console.error("Error fetching recent books:", error);
      return [];
    }
  
    return (data || []).map(book => book.id);
};

const updateLastAccessed = async (id: string, user_id: string) => {
    await supabaseClient
      .from(DatabaseTableNames['BOOK_ACCESS'])
      .update({ last_accessed: new Date() })
      .eq("user_id", user_id)
      .eq("id", id);
} 


export { insertBook, getMostRecentBooks, updateLastAccessed }