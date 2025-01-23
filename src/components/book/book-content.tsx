'use client';
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBookContent } from '@/hooks/useBooks';

const BookViewer = ({ bookId} : { bookId: string}) => {
  const { content, isLoading: contentLoading } = useBookContent(bookId);
  const [currentPage, setCurrentPage] = useState(1);
  const [wordsPerPage] = useState(450);
  
  const formattedContent = useMemo(() => {
    if (!content?.content) return [];
    
    const cleanContent = content.content
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n') 
      .replace(/\[Illustration:.*?\]/g, '')
      .trim();

    const paragraphs = cleanContent.split('\n\n');
    
    const pages = [];
    let currentPageWords: string[] = [];
    let wordCount = 0;
    
    paragraphs.forEach(paragraph => {
      const words = paragraph.split(' ');
      
      if (wordCount + words.length > wordsPerPage) {
        pages.push(currentPageWords.join(' '));
        currentPageWords = [];
        wordCount = 0;
      }
      
      currentPageWords.push(paragraph);
      wordCount += words.length;
    });
    
    if (currentPageWords.length > 0) {
      pages.push(currentPageWords.join(' '));
    }
    
    return pages;
  }, [content?.content, wordsPerPage]);

  const totalPages = formattedContent.length;

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-muted rounded-lg pt-6 mt-6">
        <div className="flex flex-col items-center gap-2">
          <BookOpen className="h-8 w-8 animate-pulse" />
          <p className="text-muted-foreground">Loading book content...</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="w-full max-w-4xl mx-auto pt-6">
        <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1} >
            <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
            </Button>
            <div className="flex items-center gap-2">
            <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={handlePageInput}
                className="w-16 text-center"
            />
            <span className="text-muted-foreground">
                of {totalPages}
            </span>
            </div>
            
            <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
      <div className="min-h-[200px] bg-muted p-8 rounded-lg shadow-sm">
        
        <div className="prose prose-stone dark:prose-invert max-w-none">
          {formattedContent[currentPage - 1]?.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookViewer;