import { BookMetadata, BookContent } from '@/types/book';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { getMostRecentBooks } from '@/db/bookAccess';
import { getBookMetadata, getBookMetadataBatch, updateFetchedAt } from '@/db/bookMetadata';
import { getBookContent } from '@/db/bookContent';
import { getUserCredentials } from '@/utils/userCredentials';

const CACHE_DURATION = 1000 * 60 * 60;

const fetchBookMetadataFromAPI = async (id: string): Promise<BookMetadata> => {
    const res = await fetch(`/api/bookMetadata/${id}`, {
        headers: {
            'x-client-id': getUserCredentials(),
            'Content-Type': 'application/json',
        }
    });
    if (!res.ok) throw new Error('Failed to fetch metadata');
    return res.json();
}

const fetchBookContentFromAPI = async (id: string): Promise<BookContent> => {
    const res = await fetch(`/api/book/${id}`, {
        headers: {
            'x-client-id': getUserCredentials(),
            'Content-Type': 'application/json',
        }
    });
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
} 

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class BookCache {
    private static instance: BookCache;
    private metadataCache: Map<string, CacheEntry<BookMetadata>> = new Map();
    private contentCache: Map<string, CacheEntry<BookContent>> = new Map();

    private constructor() {}

    static getInstance(): BookCache {
        if (!BookCache.instance) {
            BookCache.instance = new BookCache();
        }
        return BookCache.instance;
    }

    setMetadata(id: string, data: BookMetadata) {
        this.metadataCache.set(id, { data, timestamp: Date.now() });
    }

    setContent(id: string, data: BookContent) {
        this.contentCache.set(id, { data, timestamp: Date.now() });
    }

    getMetadata(id: string): BookMetadata | null {
        const entry = this.metadataCache.get(id);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_DURATION) {
            this.metadataCache.delete(id);
            return null;
        }
        return entry.data;
    }

    getContent(id: string): BookContent | null {
        const entry = this.contentCache.get(id);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_DURATION) {
            this.contentCache.delete(id);
            return null;
        }
        return entry.data;
    }

    clearCache() {
        this.metadataCache.clear();
        this.contentCache.clear();
    }

    getCacheSize() {
        return {
            metadata: this.metadataCache.size,
            content: this.contentCache.size
        };
    }
}

interface ApiDataSchema { 
    metadataData: BookMetadata,
    contentData: BookContent
}

const retrieveApiData = async (bookId: string): Promise<ApiDataSchema> => {
    const bookMetadata = await fetchBookMetadataFromAPI(bookId);
    const bookContent = await fetchBookContentFromAPI(bookId);

    return {
        metadataData: bookMetadata,
        contentData: bookContent
    };
};

const useBookData = (bookId: string, initialData?: BookMetadata) => {
    const [bookData, setBookData] = useState<BookMetadata | null>(initialData || null);
    const [isLoading, setIsLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);

    const cache = useMemo(() => BookCache.getInstance(), []);

    const fetchData = useCallback(async () => {
        if (!bookId || !/^\d+$/.test(bookId)) {
            setIsLoading(false);
            return;
        }
        const cachedData = cache.getMetadata(bookId);
        if (cachedData) {
            setBookData(cachedData);
            setIsLoading(false);
            updateFetchedAt(bookId);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getBookMetadata(bookId, getUserCredentials());
            
            if (data) {
                cache.setMetadata(bookId, data);
                setBookData(data);
                setError(null);
            } else {
                const apiData = await retrieveApiData(bookId);
                cache.setMetadata(bookId, apiData.metadataData);
                cache.setContent(bookId, apiData.contentData);
                // only set metadata since this is useBookData
                setBookData(apiData.metadataData);
                setError(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch book data'));
            setBookData(null);
        } finally {
            setIsLoading(false);
        }
    }, [bookId, cache]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { bookData, isLoading, error, refetch: fetchData };
};

const useBookContent = (bookId: string) => {
    const [content, setContent] = useState<BookContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const cache = useMemo(() => BookCache.getInstance(), []);

    const fetchContent = useCallback(async () => {
        if (!bookId || !/^\d+$/.test(bookId)) return;

        const cachedContent = cache.getContent(bookId);
        if (cachedContent) {
            setContent(cachedContent);
            return;
        }

        try {
            setIsLoading(true);
            const data = await getBookContent(bookId, getUserCredentials());
            
            if (data) {
                cache.setContent(bookId, data);
                setContent(data);
                setError(null);
            } else {
                const apiData = await retrieveApiData(bookId);
                cache.setContent(bookId, apiData.contentData);
                cache.setMetadata(bookId, apiData.metadataData);
                //only set content since this is useBookContent
                setContent(apiData.contentData);
                setError(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch book content'));
            setContent(null);
        } finally {
            setIsLoading(false);
        }
    }, [bookId, cache]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    return { content, isLoading, error, refetch: fetchContent };
};

const useRecentBooks = (bookData: BookMetadata | null) => {
    const [recentBooks, setRecentBooks] = useState<BookMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const cache = useMemo(() => BookCache.getInstance(), []);

    useEffect(() => {
        if (bookData) {
            setRecentBooks(prev => {
                const existing = prev.filter(book => book.id !== bookData.id);
                return [bookData, ...existing].slice(0, 10);
            });
        }
    }, [bookData]);

    useEffect(() => {
        const loadInitialBooks = async () => {
          setIsLoading(true);
          try {
            const recentIds = await getMostRecentBooks(10, getUserCredentials());
            const books: BookMetadata[] = [];
            const idsToFetch: string[] = [];
            for (const id of recentIds) {
              const cachedData = cache.getMetadata(id);
              if (cachedData) {
                books.push(cachedData);
              } else {
                idsToFetch.push(id);
              }
            }
            
            if (idsToFetch.length > 0) {
              const fetchedBooks = await getBookMetadataBatch(idsToFetch);
              
              fetchedBooks.forEach(book => {
                cache.setMetadata(book.id, book);
                books.push(book);
              });
            }
            
            // sort by fetched
            const sortedBooks = books.sort((a, b) => 
              new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
            );
            if (sortedBooks.length > 0) {
              setRecentBooks(sortedBooks);
            }
          } catch (error) {
            console.error('Error loading initial recent books:', error);
          } finally {
            setIsLoading(false);
          }
        };
      
        loadInitialBooks();
      }, [cache]);

    return { recentBooks, isLoading };
};


export { useRecentBooks, useBookContent, useBookData}