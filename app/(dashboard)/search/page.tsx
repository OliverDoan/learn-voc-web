import { WordSearch } from "@/components/search/word-search";

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Tra từ mới</h1>
        <p className="text-sm text-muted-foreground">
          Tra nghĩa một từ tiếng Anh bất kỳ và thêm vào deck để học.
        </p>
      </header>

      <WordSearch />
    </div>
  );
}
