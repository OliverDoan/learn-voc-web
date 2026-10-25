"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { useCreateCard, useUpdateCard } from "@/hooks/use-cards";
import type { Card } from "@/lib/types";

/**
 * Lưu ý: trang cha truyền `key` đổi theo thẻ đang sửa nên component được mount lại
 * mỗi lần mở — form tự khởi tạo đúng dữ liệu, không cần useEffect đồng bộ state.
 */
interface ChineseCardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  /** Có giá trị = sửa thẻ; bỏ trống = thêm thẻ mới */
  card?: Card;
}

/** Giá trị form — mọi trường đều là chuỗi để gắn thẳng vào input. */
interface FormState {
  word: string;
  phonetic: string;
  sinoVietnamese: string;
  partOfSpeech: string;
  meaning: string;
  hanziFormal: string;
  strokeCount: string;
  radical: string;
  example: string;
  examplePinyin: string;
  exampleTranslation: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  word: "",
  phonetic: "",
  sinoVietnamese: "",
  partOfSpeech: "",
  meaning: "",
  hanziFormal: "",
  strokeCount: "",
  radical: "",
  example: "",
  examplePinyin: "",
  exampleTranslation: "",
  note: "",
};

function toFormState(card?: Card): FormState {
  if (!card) return EMPTY_FORM;
  return {
    word: card.word,
    phonetic: card.phonetic ?? "",
    sinoVietnamese: card.sinoVietnamese ?? "",
    partOfSpeech: card.partOfSpeech ?? "",
    meaning: card.meaning,
    hanziFormal: card.hanziFormal ?? "",
    strokeCount: card.strokeCount != null ? String(card.strokeCount) : "",
    radical: card.radical ?? "",
    example: card.example ?? "",
    examplePinyin: card.examplePinyin ?? "",
    exampleTranslation: card.exampleTranslation ?? "",
    note: card.note ?? "",
  };
}

/** Chuỗi rỗng → null để không ghi chuỗi trống xuống DB. */
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function ChineseCardFormDialog({
  open,
  onOpenChange,
  deckId,
  card,
}: ChineseCardFormDialogProps) {
  const isEdit = !!card;
  const [form, setForm] = useState<FormState>(() => toFormState(card));

  const createMut = useCreateCard();
  const updateMut = useUpdateCard(card?.id ?? "");
  const isPending = createMut.isPending || updateMut.isPending;

  // Cập nhật bất biến: luôn tạo object mới thay vì sửa tại chỗ.
  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.word.trim()) {
      toast.error("Chưa nhập chữ Hán");
      return;
    }
    if (!form.meaning.trim()) {
      toast.error("Chưa nhập nghĩa tiếng Việt");
      return;
    }
    const strokeCount =
      form.strokeCount.trim() === "" ? null : Number(form.strokeCount);
    if (
      strokeCount !== null &&
      (!Number.isInteger(strokeCount) || strokeCount < 1)
    ) {
      toast.error("Số nét phải là số nguyên dương");
      return;
    }

    const payload = {
      word: form.word.trim(),
      meaning: form.meaning.trim(),
      phonetic: orNull(form.phonetic),
      sinoVietnamese: orNull(form.sinoVietnamese),
      partOfSpeech: orNull(form.partOfSpeech),
      hanziFormal: orNull(form.hanziFormal),
      strokeCount,
      radical: orNull(form.radical),
      example: orNull(form.example),
      examplePinyin: orNull(form.examplePinyin),
      exampleTranslation: orNull(form.exampleTranslation),
      note: orNull(form.note),
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync(payload);
        toast.success("Đã lưu thẻ");
      } else {
        // `tags/synonyms/antonyms` là trường của phần tiếng Anh — gửi mảng rỗng.
        await createMut.mutateAsync({
          deckId,
          ...payload,
          tags: [],
          synonyms: [],
          antonyms: [],
        });
        toast.success(`Đã thêm ${payload.word} 🀄`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi lưu thẻ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa thẻ" : "Thêm chữ Hán"}</DialogTitle>
          <DialogDescription>
            Chữ Hán và nghĩa là bắt buộc; các mục còn lại điền được thì tốt hơn.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="zh-word">Chữ Hán *</Label>
              <Input
                id="zh-word"
                lang="zh-CN"
                value={form.word}
                onChange={(e) => setField("word", e.target.value)}
                placeholder="你"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zh-pinyin">Pinyin</Label>
              <Input
                id="zh-pinyin"
                value={form.phonetic}
                onChange={(e) => setField("phonetic", e.target.value)}
                placeholder="nǐ"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zh-meaning">Nghĩa tiếng Việt *</Label>
            <Input
              id="zh-meaning"
              value={form.meaning}
              onChange={(e) => setField("meaning", e.target.value)}
              placeholder="bạn, anh, chị…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="zh-sino">Âm Hán Việt</Label>
              <Input
                id="zh-sino"
                value={form.sinoVietnamese}
                onChange={(e) => setField("sinoVietnamese", e.target.value)}
                placeholder="nhĩ"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zh-pos">Loại từ</Label>
              <Input
                id="zh-pos"
                value={form.partOfSpeech}
                onChange={(e) => setField("partOfSpeech", e.target.value)}
                placeholder="đại từ"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="zh-formal">Đại tả (大写)</Label>
              <Input
                id="zh-formal"
                lang="zh-CN"
                value={form.hanziFormal}
                onChange={(e) => setField("hanziFormal", e.target.value)}
                placeholder="壹"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zh-strokes">Số nét</Label>
              <Input
                id="zh-strokes"
                inputMode="numeric"
                value={form.strokeCount}
                onChange={(e) => setField("strokeCount", e.target.value)}
                placeholder="7"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zh-radical">Bộ thủ</Label>
              <Input
                id="zh-radical"
                lang="zh-CN"
                value={form.radical}
                onChange={(e) => setField("radical", e.target.value)}
                placeholder="亻"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zh-example">Câu ví dụ</Label>
            <Input
              id="zh-example"
              lang="zh-CN"
              value={form.example}
              onChange={(e) => setField("example", e.target.value)}
              placeholder="你好！"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="zh-example-pinyin">Pinyin câu ví dụ</Label>
              <Input
                id="zh-example-pinyin"
                value={form.examplePinyin}
                onChange={(e) => setField("examplePinyin", e.target.value)}
                placeholder="Nǐ hǎo!"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zh-example-vi">Dịch câu ví dụ</Label>
              <Input
                id="zh-example-vi"
                value={form.exampleTranslation}
                onChange={(e) => setField("exampleTranslation", e.target.value)}
                placeholder="Xin chào!"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zh-note">Ghi chú</Label>
            <Textarea
              id="zh-note"
              value={form.note}
              onChange={(e) => setField("note", e.target.value)}
              placeholder="Mẹo nhớ mặt chữ, biến điệu…"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Đang lưu..." : isEdit ? "Lưu" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
