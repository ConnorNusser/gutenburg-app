import BookSearch from "@/components/book-search";

export default function Home() {
  return (
    <div className="flex justify-center px-4">
      <main className="flex w-full justify-center">
        <BookSearch />
      </main>
    </div>
  );
}
