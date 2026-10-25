"use client";

import { useState } from "react";
import { ClipboardCheck, Table2, type LucideIcon } from "lucide-react";
import { ChineseCardsTest } from "@/components/chinese/chinese-cards-test";
import { HanziAudioButton } from "@/components/chinese/hanzi-audio-button";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChineseCardsTableProps {
  cards: Card[];
  deckId: string;
}

type TableMode = "table" | "test";

const TABLE_MODES: Array<{ id: TableMode; label: string; icon: LucideIcon; title: string }> = [
  { id: "table", label: "Bảng", icon: Table2, title: "Xem bảng từ vựng" },
  {
    id: "test",
    label: "Kiểm tra",
    icon: ClipboardCheck,
    title: "Hiện nghĩa tiếng Việt, gõ Hán tự hoặc pinyin",
  },
];

/** Tab Bảng của Deck China: bảng từ vựng (chỉ xem) + chế độ Kiểm tra. */
export function ChineseCardsTable({ cards, deckId }: ChineseCardsTableProps) {
  const [mode, setMode] = useState<TableMode>("table");

  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border bg-card p-0.5">
        {TABLE_MODES.map(({ id, label, icon: Icon, title }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            title={title}
            aria-pressed={mode === id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {mode === "test" ? (
        <ChineseCardsTest cards={cards} deckId={deckId} />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
              <tr>
                <th className="w-12 border-b border-r px-2 py-2 text-center font-semibold text-muted-foreground">
                  #
                </th>
                <th className="border-b border-r px-3 py-2 text-left font-semibold">Hán tự</th>
                <th className="border-b border-r px-3 py-2 text-left font-semibold">Pinyin</th>
                <th className="border-b border-r px-3 py-2 text-left font-semibold">Hán Việt</th>
                <th className="border-b border-r px-3 py-2 text-left font-semibold">Từ loại</th>
                <th className="min-w-[10rem] border-b px-3 py-2 text-left font-semibold">
                  Nghĩa tiếng Việt
                </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, i) => (
                <tr key={card.id} className="even:bg-muted/20 hover:bg-accent/40">
                  <td className="border-b border-r px-2 py-1.5 text-center text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="whitespace-nowrap border-b border-r px-3 py-1.5">
                    <span className="inline-flex items-center gap-2">
                      <span lang="zh-CN" className="text-lg font-medium">
                        {card.word}
                      </span>
                      <HanziAudioButton
                        text={card.word}
                        label={`Phát âm ${card.word}`}
                        className="h-7 w-7"
                      />
                    </span>
                  </td>
                  <td className="font-phonetic whitespace-nowrap border-b border-r px-3 py-1.5 text-primary">
                    {card.phonetic ?? ""}
                  </td>
                  <td className="whitespace-nowrap border-b border-r px-3 py-1.5 italic text-muted-foreground">
                    {card.sinoVietnamese ?? ""}
                  </td>
                  <td className="whitespace-nowrap border-b border-r px-3 py-1.5 text-muted-foreground">
                    {card.partOfSpeech ?? ""}
                  </td>
                  <td className="border-b px-3 py-1.5">{card.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
