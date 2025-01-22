export interface BookMetadata {
    id: string;
    title: string;
    author: string;
    metadata_url: string;
    release_date: string;
    language: string;
    fetched_at: string;
    interaction_count: string;
    summary: string;
  }
  
  export interface BookContent {
    id: string;
    content: string;
    urlUsed: string;
    fetchedAt: Date;
  }

  export interface BookAccess {
    id: string;
    last_accessed: Date;
    created_at: Date;
    user_id: String;
  }