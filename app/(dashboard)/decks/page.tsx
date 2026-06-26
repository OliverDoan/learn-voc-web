"use client";

import { useMemo, useState } from "react";
import { Layers, Plus, Loader2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeckCard } from "@/components/deck/deck-card";
import { DeckFormDialog } from "@/components/deck/deck-form-dialog";
import { ImportDeckDialog } from "@/components/deck/import-deck-dialog";
import { useDecks } from "@/hooks/use-decks";
import { groupDecksByTopic } from "@/lib/deck-topics";

export default function DecksPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [search, setSearch] = useState("");
  const { data: decks, isLoading } = useDecks();

  // Lọc theo tên/mô tả deck (không phân biệt hoa thường).
  const filteredDecks = useMemo(() => {
    if (!decks) return [];
    const q = search.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter(
      (deck) =>
        deck.name.toLowerCase().includes(q) ||
        (deck.description?.toLowerCase().includes(q) ?? false),
    );
  }, [decks, search]);

  // Gom deck thành topic (mỗi 5 unit), bỏ topic rỗng sau khi lọc.
  const topicGroups = useMemo(
    () => groupDecksByTopic(filteredDecks).filter((g) => g.decks.length > 0),
    [filteredDecks],
  );

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Decks</h1>
          <p className="text-sm text-muted-foreground">Nhóm từ vựng theo chủ đề</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full sm:flex-none"
            onClick={() => setOpenImport(true)}
          >
            <Upload className="h-4 w-4" />
            Import deck
          </Button>
          <Button
            className="flex-1 rounded-full shadow-[0_8px_20px_rgba(23,61,201,.28)] sm:flex-none"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Tạo deck
          </Button>
        </div>
      </div>

      {decks && decks.length > 0 ? (
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm deck theo tên hoặc mô tả..."
            className="pl-9"
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !decks || decks.length === 0 ? (
        <EmptyState onCreate={() => setOpenCreate(true)} />
      ) : filteredDecks.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Không tìm thấy deck nào khớp &ldquo;{search.trim()}&rdquo;.
        </div>
      ) : (
        <div className="space-y-8">
          {topicGroups.map((group) => (
            <section key={group.key}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h2>
                <span className="font-mono text-xs text-muted-foreground/70">
                  {group.decks.length} deck
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-2">
                {group.decks.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <DeckFormDialog open={openCreate} onOpenChange={setOpenCreate} />
      <ImportDeckDialog open={openImport} onOpenChange={setOpenImport} />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Layers className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Chưa có deck nào</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        Tạo deck đầu tiên để bắt đầu tổ chức từ vựng của bạn
      </p>
      <Button onClick={onCreate} className="rounded-full">
        <Plus className="h-4 w-4" /> Tạo deck đầu tiên
      </Button>
    </div>
  );
}
