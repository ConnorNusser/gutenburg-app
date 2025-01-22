'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { useBookData, useRecentBooks } from '@/hooks/useBooks';
import { useRouter } from 'next/navigation';
import { getUserCredentials } from '@/utils/user_credentials';

const BookSearch = () => {
    const [bookId, setBookId] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    
    const { bookData, isLoading, error } = useBookData(bookId);
    const { recentBooks } = useRecentBooks(bookData);
    const router = useRouter();

    const handleSearch = () => {
        if (!inputRef.current?.value || !/^\d+$/.test(inputRef.current.value)) return;
        setBookId(inputRef.current.value);
    };

    useEffect(() => {
        getUserCredentials();
    }, []);

    return (
        <div className="w-full max-w-4xl p-4">
            <Card className="mb-6">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Project Gutenberg Book Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 w-full">
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter Project Gutenberg book ID"
                            defaultValue=""
                            className="flex-1"
                        />
                        <Button 
                            onClick={handleSearch}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Find'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="search">Search Results</TabsTrigger>
                    <TabsTrigger value="recent">Recent Books</TabsTrigger>
                </TabsList>
                
                <TabsContent value="search">
                    <Card className="w-full">
                        <CardContent className="pt-6 min-h-48">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : bookData ? (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold">{bookData.title}</h2>
                                    <p>Author: {bookData.author}</p>
                                    <p>Language: {bookData.language}</p>
                                    <p>Summary: {bookData.summary}</p>
                                    <p>Release Date: {bookData.release_date}</p>
                                    <p>Downloads: {bookData.interaction_count}</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500">
                                    Error: {error.message}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    Enter a book ID to see results
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="recent">
                    <Card className="w-full">
                        <CardContent className="pt-6 min-h-48">
                            {recentBooks.length === 0 ? (
                                <div className="text-center text-muted-foreground">
                                    No recently viewed books
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentBooks.map((book) => (
                                        <div 
                                            key={book.id} 
                                            className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                                            onClick={() => {
                                                router.push(`/book/${book.id}`)
                                            }}
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            <span>{book.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BookSearch;