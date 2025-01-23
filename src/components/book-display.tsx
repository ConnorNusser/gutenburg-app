'use client';
import React, { useState } from 'react';
import { Book } from 'lucide-react';
import { useBookData } from '@/hooks/useBooks';

const BookDataDisplay = ({ bookId }: { bookId: string }) => {
  const [error] = useState<string | null>(null);
    const { bookData, isLoading}  = useBookData(bookId);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load book data</p>
      </div>
    );
  }

  if (!bookData || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading book data...</p>
      </div>
    );
  }

  const {
    title,
    author,
    release_date,
    interaction_count,
  } = bookData;

  const metrics = [
    {
      label: 'Downloads',
      value: interaction_count?.toLocaleString() || 0,

    },
    {
      label: 'Gutenburg Release',
      value: release_date,
    }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
      <div className="bg-primary/5 rounded-full p-4">
        <Book className="text-primary w-8 h-8" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
        <p className="text-muted-foreground">{author}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
        {metrics.map((metric, index) => {
          return (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/50"
            >

              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <span className="font-medium text-xs">{metric.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookDataDisplay;