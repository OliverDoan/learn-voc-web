"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { useCreateCard, useUpdateCard } from "@/hooks/use-cards";
import { apiFetch } from "@/lib/api-client";
import { parseTags } from "@/lib/utils";
import {
  parseWordForms,
  parseWordFormMeanings,
  WORD_FORM_LABEL,
  WORD_FORM_ORDER,
} from "@/lib/word-forms";
import { speak } from "@/lib/tts";
import { WordBreakdown } from "@/components/word-formation/word-breakdown";
import type { Card } from "@/lib/types";
import type { WordFormsInput, WordFormMeaningsInput } from "@/lib/schemas";
import type { DictionaryResult } from "@/lib/dictionary";

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  card?: Card;
}

export function CardFormDialog({ open, onOpenChange, deckId, card }: CardFormDialogProps) {
  const isEdit = !!card;
  const [word, setWord] = useState(card?.word ?? "");
  const [meaning, setMeaning] = useState(card?.meaning ?? "");
  const [partOfSpeech, setPartOfSpeech] = useState(card?.partOfSpeech ?? "");
  const [rootWord, setRootWord] = useState(card?.rootWord ?? "");
  const [rootWordMeaning, setRootWordMeaning] = useState(card?.rootWordMeaning ?? "");
  const [phonetic, setPhonetic] = useState(card?.phonetic ?? "");
  const [example, setExample] = useState(card?.example ?? "");
  const [exampleTranslation, setExampleTranslation] = useState(card?.exampleTranslation ?? "");
  const [note, setNote] = useState(card?.note ?? "");
  const [dialect, setDialect] = useState<"" | "british" | "american">(
    (card?.dialect as "british" | "american" | undefined) ?? "",
  );
  const [variantWord, setVariantWord] = useState(card?.variantWord ?? "");
  const [tagsInput, setTagsInput] = useState(parseTags(card?.tags).join(", "));
  const [synonymsInput, setSynonymsInput] = useState(parseTags(card?.synonyms).join(", "));
  const [antonymsInput, setAntonymsInput] = useState(parseTags(card?.antonyms).join(", "));
  const [wordForms, setWordForms] = useState<WordFormsInput>(() => parseWordForms(card?.wordForms));
  const [wordFormMeanings, setWordFormMeanings] = useState<WordFormMeaningsInput>(() =>
    parseWordFormMeanings(card?.wordFormMeanings),
  );

  const debouncedWord = useDebounce(word, 500);

  const createMut = useCreateCard();
  const updateMut = useUpdateCard(card?.id ?? "");

  useEffect(() => {
    if (open) {
      setWord(card?.word ?? "");
      setMeaning(card?.meaning ?? "");
      setPartOfSpeech(card?.partOfSpeech ?? "");
      setRootWord(card?.rootWord ?? "");
      setRootWordMeaning(card?.rootWordMeaning ?? "");
      setPhonetic(card?.phonetic ?? "");
      setExample(card?.example ?? "");
      setExampleTranslation(card?.exampleTranslation ?? "");
      setNote(card?.note ?? "");
      setDialect((card?.dialect as "british" | "american" | undefined) ?? "");
      setVariantWord(card?.variantWord ?? "");
      setTagsInput(parseTags(card?.tags).join(", "));
      setSynonymsInput(parseTags(card?.synonyms).join(", "));
      setAntonymsInput(parseTags(card?.antonyms).join(", "));
      setWordForms(parseWordForms(card?.wordForms));
      setWordFormMeanings(parseWordFormMeanings(card?.wordFormMeanings));
    }
  }, [open, card]);

  const dictQuery = useQuery({
    queryKey: ["dictionary", debouncedWord],
    queryFn: () => apiFetch<DictionaryResult>(`/api/dictionary?word=${encodeURIComponent(debouncedWord)}`),
    enabled: !isEdit && debouncedWord.trim().length > 1 && !phonetic && !example,
    retry: false,
  });

  useEffect(() => {
    if (!dictQuery.data) return;
    const d = dictQuery.data;
    if (!phonetic && d.phonetic) setPhonetic(d.phonetic);
    if (!partOfSpeech && d.meanings[0]?.partOfSpeech) setPartOfSpeech(d.meanings[0].partOfSpeech);
    const firstDef = d.meanings[0]?.definitions[0];
    if (!example && firstDef?.example) setExample(firstDef.example);
    if (!synonymsInput && d.synonyms.length > 0) setSynonymsInput(d.synonyms.join(", "));
    if (!antonymsInput && d.antonyms.length > 0) setAntonymsInput(d.antonyms.join(", "));
  }, [dictQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const isPending = createMut.isPending || updateMut.isPending;

  const handleSubmit = async () => {
    if (!word.trim()) return toast.error("Từ không được trống");
    if (!meaning.trim()) return toast.error("Nghĩa không được trống");

    const splitList = (value: string) =>
      value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const tags = splitList(tagsInput);
    const synonyms = splitList(synonymsInput);
    const antonyms = splitList(antonymsInput);

    const payload = {
      word: word.trim(),
      meaning: meaning.trim(),
      partOfSpeech: partOfSpeech || null,
      rootWord: rootWord || null,
      rootWordMeaning: rootWordMeaning || null,
      phonetic: phonetic || null,
      example: example || null,
      exampleTranslation: exampleTranslation || null,
      note: note || null,
      dialect: dialect || null,
      variantWord: variantWord.trim() || null,
      tags,
      synonyms,
      antonyms,
      wordForms,
      wordFormMeanings,
    };

    try {
      if (isEdit && card) {
        await updateMut.mutateAsync(payload);
        toast.success("Đã cập nhật từ");
      } else {
        await createMut.mutateAsync({ ...payload, deckId });
        toast.success("Đã thêm từ mới");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa từ" : "Thêm từ mới"}</DialogTitle>
          <DialogDescription>
            Gõ từ tiếng Anh — app sẽ tự gợi ý phonetic và ví dụ từ từ điển.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="word">
              Từ (tiếng Anh)
              {dictQuery.isFetching ? (
                <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-muted-foreground" />
              ) : null}
            </Label>
            <div className="flex gap-2">
              <Input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="apple"
                autoFocus
              />
              {word ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => speak(word)}
                  aria-label="Phát âm"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {debouncedWord.trim().length > 3 ? (
            <div className="md:col-span-2">
              <WordBreakdown word={debouncedWord.trim()} />
            </div>
          ) : null}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="meaning">Nghĩa (tiếng Việt)</Label>
            <Input
              id="meaning"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="quả táo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pos">Loại từ</Label>
            <Input
              id="pos"
              value={partOfSpeech ?? ""}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              placeholder="noun"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonetic">Phonetic (IPA)</Label>
            <Input
              id="phonetic"
              value={phonetic ?? ""}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="/ˈæp.əl/"
              className="font-phonetic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="root-word">Từ gốc</Label>
            <Input
              id="root-word"
              value={rootWord ?? ""}
              onChange={(e) => setRootWord(e.target.value)}
              placeholder="progress (noun, verb)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="root-word-meaning">Nghĩa từ gốc</Label>
            <Input
              id="root-word-meaning"
              value={rootWordMeaning ?? ""}
              onChange={(e) => setRootWordMeaning(e.target.value)}
              placeholder="tiến bộ; sự tiến triển"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="example">Ví dụ</Label>
            <Textarea
              id="example"
              value={example ?? ""}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              placeholder="I eat an apple every day."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="example-tr">Dịch ví dụ</Label>
            <Textarea
              id="example-tr"
              value={exampleTranslation ?? ""}
              onChange={(e) => setExampleTranslation(e.target.value)}
              rows={2}
              placeholder="Tôi ăn một quả táo mỗi ngày."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Các dạng từ (word forms — cho bài biến đổi từ)</Label>
            <p className="text-xs text-muted-foreground">
              Tuỳ chọn. Điền dạng cùng họ và nghĩa tiếng Việt của từng dạng.
            </p>
            <div className="space-y-2">
              {WORD_FORM_ORDER.map((pos) => (
                <div key={pos} className="grid grid-cols-[5rem_1fr_1.2fr] items-center gap-2">
                  <Label htmlFor={`wf-${pos}`} className="text-xs text-muted-foreground">
                    {WORD_FORM_LABEL[pos]}
                  </Label>
                  <Input
                    id={`wf-${pos}`}
                    value={wordForms[pos] ?? ""}
                    onChange={(e) =>
                      setWordForms((prev) => ({ ...prev, [pos]: e.target.value }))
                    }
                    placeholder={
                      pos === "noun"
                        ? "beauty"
                        : pos === "verb"
                          ? "beautify"
                          : pos === "adjective"
                            ? "beautiful"
                            : "beautifully"
                    }
                  />
                  <Input
                    id={`wfm-${pos}`}
                    value={wordFormMeanings[pos] ?? ""}
                    onChange={(e) =>
                      setWordFormMeanings((prev) => ({ ...prev, [pos]: e.target.value }))
                    }
                    placeholder={
                      pos === "noun"
                        ? "vẻ đẹp"
                        : pos === "verb"
                          ? "làm đẹp"
                          : pos === "adjective"
                            ? "đẹp"
                            : "một cách đẹp đẽ"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="synonyms">Đồng nghĩa (phân cách dấu phẩy)</Label>
            <Input
              id="synonyms"
              value={synonymsInput}
              onChange={(e) => setSynonymsInput(e.target.value)}
              placeholder="glad, joyful"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="antonyms">Trái nghĩa (phân cách dấu phẩy)</Label>
            <Input
              id="antonyms"
              value={antonymsInput}
              onChange={(e) => setAntonymsInput(e.target.value)}
              placeholder="sad, unhappy"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="business, B2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialect">Biến thể tiếng Anh</Label>
            <select
              id="dialect"
              value={dialect}
              onChange={(e) => setDialect(e.target.value as "" | "british" | "american")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Dùng chung (không đánh dấu)</option>
              <option value="british">🇬🇧 Anh–Anh (BrE)</option>
              <option value="american">🇺🇸 Anh–Mỹ (AmE)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant-word">Từ tương đương (biến thể còn lại)</Label>
            <Input
              id="variant-word"
              value={variantWord ?? ""}
              onChange={(e) => setVariantWord(e.target.value)}
              placeholder="center"
              disabled={!dialect}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={note ?? ""}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Đang lưu..." : isEdit ? "Lưu" : "Thêm từ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
