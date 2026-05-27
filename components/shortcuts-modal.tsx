"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutItem {
  keys: string[];
  desc: string;
}

interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    title: "Toàn ứng dụng",
    items: [
      { keys: ["?"], desc: "Mở bảng phím tắt" },
      { keys: ["⌘", "K"], desc: "Tìm kiếm nhanh deck / từ / truyện" },
      { keys: ["Esc"], desc: "Đóng hộp thoại / quay lại" },
    ],
  },
  {
    title: "Phiên học (Flashcard)",
    items: [
      { keys: ["Space"], desc: "Lật thẻ / hiện đáp án" },
      { keys: ["Enter"], desc: "Lật thẻ" },
      { keys: ["1"], desc: "Đánh giá Again (quên)" },
      { keys: ["2"], desc: "Đánh giá Hard (khó)" },
      { keys: ["3"], desc: "Đánh giá Good (đúng)" },
      { keys: ["4"], desc: "Đánh giá Easy (dễ)" },
    ],
  },
  {
    title: "Quiz",
    items: [
      { keys: ["Enter"], desc: "Gửi đáp án (typing quiz)" },
      { keys: ["1", "—", "4"], desc: "Chọn đáp án trắc nghiệm (sắp tới)" },
    ],
  },
];

function isInEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isInEditable(e.target)) return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" /> Phím tắt
          </DialogTitle>
          <DialogDescription>
            Nhấn <Kbd>?</Kbd> bất cứ lúc nào để mở/đóng bảng này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {SHORTCUTS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((item, i) => (
                  <li key={`${group.title}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground/90">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, ki) => (
                        <Kbd key={ki}>{k}</Kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] text-foreground shadow-sm">
      {children}
    </kbd>
  );
}
