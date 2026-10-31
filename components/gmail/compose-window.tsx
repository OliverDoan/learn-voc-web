"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Minus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SelectMenu } from "@/components/ui/select-menu";
import { useDecks } from "@/hooks/use-decks";
import { useCreateCard } from "@/hooks/use-cards";
import { cardCreateSchema } from "@/lib/schemas";

interface ComposeWindowProps {
  onClose: () => void;
}

const FIELD = "w-full border-b bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground";

/** Cửa sổ "Thư mới" góc dưới phải kiểu Gmail — thêm nhanh 1 từ vào deck. */
export function ComposeWindow({ onClose }: ComposeWindowProps) {
  const params = useSearchParams();
  const { data: decks } = useDecks();
  const createCard = useCreateCard();
  const [minimized, setMinimized] = useState(false);
  const [deckId, setDeckId] = useState(params.get("label") ?? "");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");

  const options = (decks ?? [])
    .filter((d) => !d.locked)
    .map((d) => ({ value: d.id, label: d.name, icon: d.icon }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = cardCreateSchema.safeParse({
      deckId,
      word,
      meaning,
      example: example.trim() || null,
    });
    if (!parsed.success) {
      toast.error(deckId ? parsed.error.issues[0]?.message : "Chọn deck (người nhận) trước");
      return;
    }
    try {
      await createCard.mutateAsync(parsed.data);
      toast.success(`Đã thêm "${parsed.data.word}"`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thêm được từ");
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 right-4 z-50 flex w-[min(540px,calc(100vw-2rem))] flex-col overflow-hidden rounded-t-xl bg-card shadow-[0_8px_10px_1px_rgba(0,0,0,.14),0_3px_14px_2px_rgba(0,0,0,.12)] md:right-16",
      )}
    >
      <div className="flex h-10 items-center justify-between bg-mail-search px-4">
        <button type="button" className="flex-1 text-left text-sm font-medium" onClick={() => setMinimized((v) => !v)}>
          Từ mới
        </button>
        <button type="button" aria-label="Thu nhỏ" onClick={() => setMinimized((v) => !v)} className="p-1 hover:opacity-70">
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" aria-label="Đóng" onClick={onClose} className="p-1 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
      {!minimized ? (
        <form onSubmit={submit} className="flex flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-1 text-sm">
            <span className="text-muted-foreground">Đến</span>
            <SelectMenu
              value={deckId}
              onChange={setDeckId}
              options={options}
              placeholder="Chọn deck"
              className="flex-1 [&>button]:border-0 [&>button]:shadow-none"
            />
          </div>
          <input className={FIELD} placeholder="Từ (tiêu đề)" value={word} onChange={(e) => setWord(e.target.value)} autoFocus />
          <input className={FIELD} placeholder="Nghĩa tiếng Việt" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
          <textarea
            className="min-h-[180px] resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Câu ví dụ (không bắt buộc)"
            value={example}
            onChange={(e) => setExample(e.target.value)}
          />
          <div className="flex items-center px-4 pb-4">
            <button
              type="submit"
              disabled={createCard.isPending}
              className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:shadow-md disabled:opacity-60"
            >
              {createCard.isPending ? "Đang gửi…" : "Gửi"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
