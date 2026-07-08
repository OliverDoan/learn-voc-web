import { WordFormationView } from "@/components/word-formation/word-formation-view";

export default function WordFormationPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Cấu tạo từ (Word Formation)</h1>
        <p className="text-sm text-muted-foreground">
          Tra cứu tiền tố &amp; hậu tố để đoán nghĩa và loại từ, hoặc gom từ vựng của bạn
          theo cấu tạo (vd nhóm đuôi -tion / -sion).
        </p>
      </header>

      <WordFormationView />
    </div>
  );
}
