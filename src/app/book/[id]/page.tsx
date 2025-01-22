import BookDataDisplay from '@/components/book-display';
import BookContent from '@/components/book/book-content';
import Header from '@/components/header';
import SentimentDisplay from '@/components/sentimentDisplay';

export default function Page({params} : {params: {id: string}}) {
  const { id } = params;

  return (
    <div className="flex min-h-screen bg-background w-full">
      <div className="w-full max-w-[75%] mx-auto flex flex-col">
      <Header routeName='Book Content' />
        <main className="flex-1 w-full">
          <div className="p-4">
            <div className="grid gap-4 md:grid-cols-2">
                {id && <BookDataDisplay bookId={id}/>}
                {id && <SentimentDisplay bookId={id} />}
            </div>
            {id && <BookContent bookId={id} />}
          </div>
        </main>
      </div>
    </div>
  )
}