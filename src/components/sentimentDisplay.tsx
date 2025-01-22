'use client';
import React, { useEffect, useState } from 'react';
import { Heart, Flame, Scale } from 'lucide-react';

const SentimentDisplay = ({ bookId }: { bookId: string }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await fetch(`/api/groq/${bookId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setSentimentData(data);
      } catch (error) {
        console.error('Error fetching sentiment:', error);
        setError('Failed to load sentiment analysis');
      }
    };

    fetchSentiment();
  }, [bookId]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Unable to analyze sentiment</p>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Analyzing sentiment...</p>
      </div>
    );
  }

  const getSentimentInfo = (score: number) => {
    if (score > 10) return { category: 'Positive', color: 'text-emerald-400', bgColor: 'bg-emerald-100', icon: Heart };
    if (score < -10) return { category: 'Negative', color: 'text-rose-400', bgColor: 'bg-rose-100', icon: Flame };
    return { category: 'Neutral', color: 'text-amber-400', bgColor: 'bg-amber-100', icon: Scale };
  };

  const overallScore = sentimentData.overall ?? 0;
  const dominantEmotion = sentimentData.dominantEmotion || 'Unknown';
  const { category, color, bgColor, icon: Icon } = getSentimentInfo(overallScore);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
    <div>Sentimental Analysis</div>
      <div className={`${bgColor} rounded-full p-4`}>
        <Icon className={`${color} w-8 h-8`} />
      </div>
      <div className='text-center space-y-1'>
        <div className='text-muted-foreground'>Overall Sentiment</div>
        <div className='flex items-center justify-center gap-2'>
            <span className={`text-2xl font-medium ${color}`}>
            {overallScore.toFixed(1) ?? 0}
            </span>
            <span className='text-sm text-muted-foreground opacity-75'>
            (-100 to 100)
            </span>
        </div>
        </div>
      <div className="text-center">
        <div className={`text-xl font-medium ${color}`}>
          {category}
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          Domain Emotion: {dominantEmotion}
        </div>
      </div>
      
      <div className="w-full max-w-[200px]">
        <div className="bg-muted rounded-full h-2">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${bgColor}`}
            style={{
              width: `${Math.min(100, Math.max(0, (overallScore + 100) / 2))}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentDisplay;