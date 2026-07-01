"use client";

import { useRef, useState, type ReactNode } from "react";
import { Columns3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useUpdateDeck } from "@/hooks/use-decks";
import { parseWordForms, WORD_FORM_ABBR, WORD_FORM_ORDER } from "@/lib/word-forms";
import {
  newColumnId,
  parseCustomColumns,
  stringifyCustomColumns,
  type CustomColumn,
} from "@/lib/custom-columns";
import type { Card, Deck } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CardsTableProps {
  cards: Card[];
  deck: Deck;
}

// Cột built-in (chỉ xem) — STT luôn hiện, các cột còn lại có thể ẩn.
// `className` (tuỳ chọn) áp cho cả header lẫn ô để chỉnh độ rộng từng cột.
// `wrap` = cho phép xuống hàng; mặc định các cột giữ trên một dòng (nowrap).
const BUILTIN: Array<{
  key: string;
  label: string;
  get: (c: Card) => ReactNode;
  className?: string;
  wrap?: boolean;
}> = [
    {
      key: "word",
      label: "Từ vựng",
      get: (c) => {
        const pos = abbrPartOfSpeech(c.partOfSpeech);
        return (
          <span>
            {c.word}
            {pos ? <span className="ml-1.5 font-normal text-muted-foreground">({pos})</span> : null}
          </span>
        );
      },
    },
    { key: "phonetic", label: "Phiên âm", get: (c) => c.phonetic ?? "" },
    { key: "meaning", label: "Nghĩa tiếng Việt", get: (c) => c.meaning, className: "min-w-[10rem]" },
    { key: "rootWord", label: "Từ gốc", get: (c) => c.rootWord ?? "" },
    {
      key: "wordForm",
      label: "Word Form",
      get: (c) => renderWordForms(c.wordForms),
      className: "min-w-[10rem]",
      wrap: true,
    },
  ];

// Viết tắt từ loại: noun→n, verb→v, adjective→adj, adverb→adv.
// Hỗ trợ dạng ghép, vd "adjective / noun" → "adj/n".
const POS_ABBR: Record<string, string> = {
  noun: "n",
  verb: "v",
  adjective: "adj",
  adverb: "adv",
  pronoun: "pron",
  preposition: "prep",
  conjunction: "conj",
  interjection: "interj",
  determiner: "det",
};
function abbrPartOfSpeech(pos: string | null): string {
  if (!pos) return "";
  return pos
    .split(/\s*[/,]\s*/)
    .map((p) => POS_ABBR[p.trim().toLowerCase()] ?? p.trim())
    .join("/");
}

// Mỗi dạng từ trên một dòng riêng cho dễ đọc, vd:
//   n: generalization
//   v: generalize
//   adv: generally
function renderWordForms(json: string | null): ReactNode {
  const forms = parseWordForms(json);
  const items = WORD_FORM_ORDER.filter((p) => forms[p]);
  if (items.length === 0) return "";
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((p) => (
        <div key={p}>
          - {forms[p]} ({WORD_FORM_ABBR[p]})
        </div>
      ))}
    </div>
  );
}

export function CardsTable({ cards, deck }: CardsTableProps) {
  const updateDeck = useUpdateDeck(deck.id);

  // Ẩn/hiện cột — lưu localStorage theo deck (khởi tạo ngay, không cần effect).
  const [hidden, setHidden] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(`voc-table-cols:${deck.id}`);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const toggleHidden = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(`voc-table-cols:${deck.id}`, JSON.stringify([...next]));
      } catch {
        /* bỏ qua */
      }
      return next;
    });
  };

  // Cột tùy chỉnh — local state (khởi tạo từ server), lưu khi đổi.
  const [columns, setColumns] = useState<CustomColumn[]>(() => parseCustomColumns(deck.customColumns));
  const lastSaved = useRef(deck.customColumns);

  // Lưu xuống server (bỏ qua nếu không đổi so với bản đã lưu).
  const persist = (next: CustomColumn[]) => {
    const json = stringifyCustomColumns(next);
    if (json === lastSaved.current) return;
    lastSaved.current = json;
    updateDeck.mutate(
      { customColumns: json },
      { onError: (e) => toast.error(e instanceof Error ? e.message : "Lưu cột thất bại") },
    );
  };
  // Đổi local + lưu ngay (dùng cho thêm/xoá cột).
  const commit = (next: CustomColumn[]) => {
    setColumns(next);
    persist(next);
  };

  const addColumn = () => {
    commit([...columns, { id: newColumnId(), name: "Cột mới", values: {} }]);
  };
  const removeColumn = (id: string) => {
    commit(columns.filter((c) => c.id !== id));
  };
  // Gõ: chỉ cập nhật local; lưu khi rời ô (onBlur) để tránh PATCH mỗi ký tự.
  const editName = (id: string, name: string) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };
  const editValue = (id: string, cardId: string, value: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, values: { ...c.values, [cardId]: value } } : c)),
    );
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const visibleBuiltin = BUILTIN.filter((b) => !hidden.has(b.key));
  const visibleColumns = columns.filter((c) => !hidden.has(c.id));

  return (
    <div className="pb-24">
      {/* Thanh công cụ: ẩn/hiện cột + thêm cột */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setMenuOpen((o) => !o)}>
            <Columns3 className="h-4 w-4" /> Cột
          </Button>
          {menuOpen ? (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-lg border bg-card p-1.5 shadow-lg">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Hiện cột</p>
                {BUILTIN.map((b) => (
                  <label
                    key={b.key}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={!hidden.has(b.key)}
                      onChange={() => toggleHidden(b.key)}
                    />
                    {b.label}
                  </label>
                ))}
                {columns.length > 0 ? (
                  <>
                    <p className="px-2 pb-1 pt-2 text-xs font-semibold text-muted-foreground">
                      Cột tùy chỉnh
                    </p>
                    {columns.map((col) => (
                      <label
                        key={col.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={!hidden.has(col.id)}
                          onChange={() => toggleHidden(col.id)}
                        />
                        <span className="truncate">{col.name || "(không tên)"}</span>
                      </label>
                    ))}
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-4 w-4" /> Thêm cột
        </Button>
        <span className="text-xs text-muted-foreground">
          {cards.length} từ · cột tùy chỉnh nhập trực tiếp vào ô
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
            <tr>
              <th className="w-12 border-b border-r px-2 py-2 text-center font-semibold text-muted-foreground">
                #
              </th>
              {visibleBuiltin.map((b) => (
                <th
                  key={b.key}
                  className={cn("border-b border-r px-3 py-2 text-left font-semibold", b.className)}
                >
                  {b.label}
                </th>
              ))}
              {visibleColumns.map((col) => (
                <th key={col.id} className="border-b border-r px-2 py-1.5 text-left font-semibold">
                  <div className="flex items-center gap-1">
                    <input
                      value={col.name}
                      onChange={(e) => editName(col.id, e.target.value)}
                      onBlur={() => persist(columns)}
                      className="w-28 rounded bg-transparent px-1 py-0.5 font-semibold outline-none focus:bg-background focus:ring-1 focus:ring-primary"
                      aria-label="Tên cột"
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(col.id)}
                      className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Xoá cột"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="border-b px-2 py-2">
                <button
                  type="button"
                  onClick={addColumn}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Thêm cột"
                  title="Thêm cột"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, i) => (
              <tr key={card.id} className="even:bg-muted/20 hover:bg-accent/40">
                <td className="border-b border-r px-2 py-1.5 text-center text-muted-foreground">
                  {i + 1}
                </td>
                {visibleBuiltin.map((b) => (
                  <td
                    key={b.key}
                    className={cn(
                      "border-b border-r px-3 py-1.5 align-top",
                      b.key === "word" && "font-medium",
                      b.wrap ? "whitespace-normal break-words" : "whitespace-nowrap",
                      b.className,
                    )}
                  >
                    {b.get(card)}
                  </td>
                ))}
                {visibleColumns.map((col) => (
                  <td key={col.id} className="border-b border-r p-0 align-top">
                    <input
                      value={col.values[card.id] ?? ""}
                      onChange={(e) => editValue(col.id, card.id, e.target.value)}
                      onBlur={() => persist(columns)}
                      className="w-full min-w-[8rem] bg-transparent px-3 py-1.5 outline-none focus:bg-background focus:ring-1 focus:ring-inset focus:ring-primary"
                      placeholder="…"
                    />
                  </td>
                ))}
                <td className="border-b" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
