"use client";

import { useState } from "react";
import { FileSpreadsheet, Layers, Plus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeckCard } from "@/components/deck/deck-card";
import { DeckFormDialog } from "@/components/deck/deck-form-dialog";
import { ImportDeckDialog } from "@/components/deck/import-deck-dialog";
import { ExportPrintDialog } from "@/components/deck/export-print-dialog";
import { useDecks } from "@/hooks/use-decks";

export default function DecksPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const { data: decks, isLoading } = useDecks();

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
            onClick={() => setOpenExport(true)}
            disabled={!decks || decks.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất để in
          </Button>
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
      <ImportDeckDialog open={openImport} onOpenChange={setOpenImport} />
      <ExportPrintDialog open={openExport} onOpenChange={setOpenExport} decks={decks ?? []} />
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
