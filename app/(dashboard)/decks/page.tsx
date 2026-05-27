"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeckCard } from "@/components/deck/deck-card";
import { DeckFormDialog } from "@/components/deck/deck-form-dialog";
import { useDecks } from "@/hooks/use-decks";

export default function DecksPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const { data: decks, isLoading } = useDecks();

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Decks</h1>
          <p className="text-sm text-muted-foreground">Nhóm từ vựng theo chủ đề</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4" />
          Tạo deck
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !decks || decks.length === 0 ? (
        <EmptyState onCreate={() => setOpenCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}

      <DeckFormDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <div className="mb-4 text-6xl">📚</div>
      <h3 className="mb-2 text-lg font-semibold">Chưa có deck nào</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        Tạo deck đầu tiên để bắt đầu tổ chức từ vựng của bạn
      </p>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4" /> Tạo deck đầu tiên
      </Button>
    </div>
  );
}
