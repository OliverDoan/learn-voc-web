"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectMenu, type SelectOption } from "@/components/ui/select-menu";
import { useCreateDeck, useDecks } from "@/hooks/use-decks";
import { useCreateCard } from "@/hooks/use-cards";
import type { DictionaryResult } from "@/lib/dictionary";

const DEFAULT_DECK_COLOR = "#3b82f6";

interface AddToDeckPanelProps {
  result: DictionaryResult;
}

/** Lấy nghĩa + ví dụ gợi ý đầu tiên từ kết quả từ điển. */
function deriveDefaults(result: DictionaryResult) {
  const firstMeaning = result.meanings[0];
  const partOfSpeech = firstMeaning?.partOfSpeech ?? null;
  const defaultMeaning = firstMeaning?.definitions[0]?.definition ?? "";

  let example: string | null = null;
  for (const meaning of result.meanings) {
    const withExample = meaning.definitions.find((d) => d.example);
    if (withExample?.example) {
      example = withExample.example;
      break;
    }
  }
  return { partOfSpeech, defaultMeaning, example };
}

/** Panel chọn deck và thêm từ vừa tra vào deck đó. */
export function AddToDeckPanel({ result }: AddToDeckPanelProps) {
  const { data: decks, isLoading } = useDecks();
  const createCard = useCreateCard();
  const createDeck = useCreateDeck();
  const { partOfSpeech, defaultMeaning, example } = deriveDefaults(result);

  const [deckId, setDeckId] = useState("");
  const [meaning, setMeaning] = useState(defaultMeaning);
  // Tạo deck nhanh ngay trong panel.
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const hasDecks = !!decks && decks.length > 0;

  const deckOptions = useMemo<SelectOption[]>(
    () =>
      (decks ?? []).map((deck) => ({
        value: deck.id,
        label: deck.name,
        icon: deck.icon ?? "📘",
      })),
    [decks],
  );

  const handleCreateDeck = async () => {
    const name = newDeckName.trim();
    if (!name) {
      toast.error("Nhập tên deck");
      return;
    }
    try {
      const deck = await createDeck.mutateAsync({
        name,
        color: DEFAULT_DECK_COLOR,
      });
      setDeckId(deck.id); // tự chọn deck vừa tạo
      setCreatingDeck(false);
      setNewDeckName("");
      toast.success(`Đã tạo deck "${deck.name}" 📘`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi tạo deck");
    }
  };

  const cancelCreateDeck = () => {
    setCreatingDeck(false);
    setNewDeckName("");
  };

  const handleAdd = async () => {
    if (!deckId) {
      toast.error("Hãy chọn một deck");
      return;
    }
    if (!meaning.trim()) {
      toast.error("Hãy nhập nghĩa cho từ");
      return;
    }
    try {
      await createCard.mutateAsync({
        deckId,
        word: result.word,
        meaning: meaning.trim(),
        partOfSpeech,
        phonetic: result.phonetic ?? null,
        example,
        tags: [],
        synonyms: result.synonyms.filter((s) => s.length <= 60).slice(0, 20),
        antonyms: result.antonyms.filter((a) => a.length <= 60).slice(0, 20),
      });
      const deckName = decks?.find((d) => d.id === deckId)?.name ?? "deck";
      toast.success(`Đã thêm "${result.word}" vào ${deckName} ✅`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi thêm thẻ");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <p className="text-sm font-semibold">Thêm vào deck</p>

      <div>
        <Label htmlFor="add-meaning" className="mb-1.5 block text-sm">
          Nghĩa (có thể sửa lại tiếng Việt)
        </Label>
        <Textarea
          id="add-meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          rows={2}
          placeholder="Nhập nghĩa của từ..."
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="add-deck" className="mb-1.5 block text-sm">
            Deck
          </Label>
          {creatingDeck ? (
            <div className="flex gap-2">
              <Input
                id="add-deck-new"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Tên deck mới..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateDeck();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelCreateDeck();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleCreateDeck}
                disabled={createDeck.isPending}
                aria-label="Tạo deck"
                title="Tạo deck"
              >
                {createDeck.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelCreateDeck}
                disabled={createDeck.isPending}
                aria-label="Huỷ"
                title="Huỷ"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <SelectMenu
                id="add-deck"
                value={deckId}
                onChange={setDeckId}
                options={deckOptions}
                placeholder={isLoading ? "Đang tải..." : "Chọn deck..."}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCreatingDeck(true)}
                aria-label="Tạo deck mới"
                title="Tạo deck mới"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <Button
          onClick={handleAdd}
          disabled={createCard.isPending || !hasDecks || creatingDeck}
        >
          <Plus className="mr-1 h-4 w-4" />
          Thêm
        </Button>
      </div>
    </div>
  );
}
