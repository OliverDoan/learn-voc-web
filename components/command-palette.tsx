"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, Layers, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { SearchResults } from "@/app/api/search/route";

function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface FlatItem {
  key: string;
  group: "deck" | "card" | "story";
  label: string;
  sublabel?: string;
  href: string;
}

function isInEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebounced(q, 200);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => apiFetch<SearchResults>(`/api/search?q=${encodeURIComponent(debounced)}`),
    enabled: open && debounced.trim().length > 0,
    staleTime: 30_000,
  });

  const items = useMemo<FlatItem[]>(() => {
    if (!data) return [];
    const list: FlatItem[] = [];
    for (const d of data.decks) {
      list.push({
        key: `deck-${d.id}`,
        group: "deck",
        label: d.name,
        sublabel: "Deck",
        href: `/decks/${d.id}`,
      });
    }
    for (const c of data.cards) {
      list.push({
        key: `card-${c.id}`,
        group: "card",
        label: `${c.word} — ${c.meaning}`,
        sublabel: `Từ · ${c.deckName}`,
        href: `/decks/${c.deckId}`,
      });
    }
    for (const s of data.stories) {
      list.push({
        key: `story-${s.id}`,
        group: "story",
        label: s.title,
        sublabel: `Truyện · ${s.deckName}`,
        href: `/stories/${s.id}`,
      });
    }
    return list;
  }, [data]);

  useEffect(() => {
    setHighlight(0);
  }, [debounced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!mod && e.key === "/" && !isInEditable(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQ("");
      setHighlight(0);
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(0, items.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = items[highlight];
      if (target) go(target.href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0">
        <DialogTitle className="sr-only">Tìm kiếm nhanh</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onListKey}
            placeholder="Tìm deck, từ vựng, truyện..."
            className="h-12 border-0 bg-transparent focus-visible:ring-0"
          />
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {debounced.trim().length === 0 ? (
            <EmptyHint />
          ) : items.length === 0 && !isFetching ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Không có kết quả cho &ldquo;{debounced}&rdquo;
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((it, idx) => (
                <li key={it.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => go(it.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm",
                      idx === highlight ? "bg-accent text-foreground" : "text-foreground/80",
                    )}
                  >
                    <GroupIcon group={it.group} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{it.label}</p>
                      {it.sublabel ? (
                        <p className="truncate text-xs text-muted-foreground">{it.sublabel}</p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span>
            <kbd className="rounded border px-1">↑</kbd>{" "}
            <kbd className="rounded border px-1">↓</kbd> di chuyển ·{" "}
            <kbd className="rounded border px-1">Enter</kbd> mở
          </span>
          <span>
            <kbd className="rounded border px-1">Esc</kbd> đóng
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GroupIcon({ group }: { group: FlatItem["group"] }) {
  if (group === "deck") return <Layers className="h-4 w-4 shrink-0 text-primary" />;
  if (group === "card") return <BookOpen className="h-4 w-4 shrink-0 text-emerald-500" />;
  return <FileText className="h-4 w-4 shrink-0 text-orange-500" />;
}

function EmptyHint() {
  return (
    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
      <p>Gõ để tìm trong toàn bộ ứng dụng.</p>
      <p className="mt-1 text-xs">
        Mẹo: <kbd className="rounded border px-1">⌘K</kbd> để mở,{" "}
        <kbd className="rounded border px-1">/</kbd> nhanh hơn.
      </p>
    </div>
  );
}
