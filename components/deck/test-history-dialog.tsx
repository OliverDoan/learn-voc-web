"use client";

import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TestHistory } from "@/components/deck/test-history";
import {
  clearTestHistory,
  loadTestHistory,
  MAX_ATTEMPTS,
  type TestAttempt,
} from "@/lib/test-history";

interface TestHistoryDialogProps {
  deckId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Dialog xem lịch sử từ sai — mở được từ trang deck ở bất kỳ chế độ xem nào. */
export function TestHistoryDialog({ deckId, open, onOpenChange }: TestHistoryDialogProps) {
  const [history, setHistory] = useState<TestAttempt[]>([]);

  // Nạp lại lịch sử mỗi lần mở dialog (dữ liệu ở localStorage có thể vừa thay đổi).
  useEffect(() => {
    if (open) setHistory(loadTestHistory(deckId));
  }, [open, deckId]);

  const handleClear = () => {
    clearTestHistory(deckId);
    setHistory([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 pr-6">
            <History className="h-5 w-5 text-primary" /> Lịch sử từ sai
            <span className="text-sm font-normal text-muted-foreground">
              ({history.length}/{MAX_ATTEMPTS} lần gần nhất)
            </span>
          </DialogTitle>
        </DialogHeader>

        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có lịch sử. Vào tab <strong>Kiểm tra</strong> làm bài rồi bấm{" "}
            <strong>Chấm điểm</strong> — các từ sai sẽ được lưu lại đây.
          </p>
        ) : (
          <>
            <TestHistory history={history} onClear={handleClear} hideHeader />
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Xoá lịch sử
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
