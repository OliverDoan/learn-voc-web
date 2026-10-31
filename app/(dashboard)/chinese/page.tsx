"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Languages, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeckFormDialog } from "@/components/deck/deck-form-dialog";
import { DeckGroupsSkeleton } from "@/components/ui/list-skeleton";
import { useDecks } from "@/hooks/use-decks";
import { CHINESE_DECK_LANGUAGE, sortChineseDecks } from "@/lib/chinese";
import { useUiTheme } from "@/hooks/use-ui-theme";
import { DeckMailList } from "@/components/gmail/deck-mail-list";

/** Biểu tượng gợi ý cho deck tiếng Trung. */
const CHINESE_ICONS = ["🀄", "🔢", "🧧", "🥟", "🐼", "📜", "🏮", "🎋", "☯️", "🍵"];

export default function ChinesePage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");
  const { data: decks, isLoading } = useDecks(CHINESE_DECK_LANGUAGE);
  const uiTheme = useUiTheme();

  // Xếp theo số bài rồi lọc theo tên/mô tả (không phân biệt hoa thường).
  const filteredDecks = useMemo(() => {
    const sorted = sortChineseDecks(decks ?? []);
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (deck) =>
        deck.name.toLowerCase().includes(q) ||
        (deck.description?.toLowerCase().includes(q) ?? false),
    );
  }, [decks, search]);

  const createDialog = (
    <DeckFormDialog
      open={openCreate}
      onOpenChange={setOpenCreate}
      language={CHINESE_DECK_LANGUAGE}
      iconOptions={CHINESE_ICONS}
    />
  );

  // Giao diện Gmail: deck hiển thị như các dòng mail.
  if (uiTheme === "gmail" && decks && decks.length > 0) {
    return (
      <>
        <DeckMailList
          title="Deck China"
          decks={filteredDecks}
          hrefOf={(deck) => `/chinese/${deck.id}`}
          search={search}
          onSearchChange={setSearch}
          onCreate={() => setOpenCreate(true)}
          fallbackIcon="🀄"
          empty={
            <p className="p-12 text-center text-sm text-muted-foreground">
              Không tìm thấy deck nào khớp &ldquo;{search.trim()}&rdquo;.
            </p>
          }
        />
        {createDialog}
      </>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deck China</h1>
          <p className="text-sm text-muted-foreground">
            Học chữ Hán theo deck: Hán tự · pinyin · nghĩa tiếng Việt
          </p>
        </div>
        <Button
          className="rounded-full shadow-[0_8px_20px_rgba(23,61,201,.28)]"
          onClick={() => setOpenCreate(true)}
        >
          <Plus className="h-4 w-4" />
          Tạo deck
        </Button>
      </div>

      {decks && decks.length > 0 ? (
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm deck theo tên hoặc mô tả..."
            className="bg-card pl-9"
          />
        </div>
      ) : null}

      {isLoading ? (
        <DeckGroupsSkeleton />
      ) : !decks || decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Languages className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Chưa có deck tiếng Trung nào</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Tạo deck đầu tiên, hoặc nạp bộ từ mẫu bằng lệnh <code>pnpm chinese:load</code>
          </p>
          <Button onClick={() => setOpenCreate(true)} className="rounded-full">
            <Plus className="h-4 w-4" /> Tạo deck đầu tiên
          </Button>
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Không tìm thấy deck nào khớp &ldquo;{search.trim()}&rdquo;.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredDecks.map((deck) => (
            <motion.div key={deck.id} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <Link
                href={`/chinese/${deck.id}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
                >
                  {deck.icon ?? "🀄"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{deck.name}</h3>
                  {deck.description ? (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {deck.description}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {deck._count.cards} từ
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {createDialog}
    </div>
  );
}
