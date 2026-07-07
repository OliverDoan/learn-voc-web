"use client";

import { useState, type ComponentType } from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  Maximize2,
  Repeat,
  Search,
  Target,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { READING_SPEEDS } from "@/hooks/use-reading-rate";
import type { StoryViewMode } from "./story-mode-toggle";
import type { DeckOption } from "./story-deck-picker";

const LANGS: { key: StoryViewMode; label: string }[] = [
  { key: "cham", label: "Chêm (song ngữ)" },
  { key: "vi", label: "Tiếng Việt" },
  { key: "en", label: "English" },
];

interface ReadingSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  // Deck muốn đọc (multi-select)
  decks: readonly DeckOption[];
  excludedDeckIds: ReadonlySet<string>;
  onToggleDeck: (id: string) => void;
  onSelectAllDecks: () => void;
  onClearDecks: () => void;
  // Âm thanh
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  loop: boolean;
  onToggleLoop: () => void;
  // Tốc độ đọc
  rate: number;
  onRate: (value: number) => void;
  // Ngôn ngữ hiển thị
  viewMode: StoryViewMode;
  onViewMode: (mode: StoryViewMode) => void;
  enAvailable: boolean;
  // Khi đọc (chỉ có tác dụng ở chế độ chêm)
  showMeanings: boolean;
  onToggleShowMeanings: () => void;
  focusMode: boolean;
  onToggleFocus: () => void;
  // Hình ảnh
  imageOnly: boolean;
  onToggleImageOnly: () => void;
  hasImages: boolean;
  onOpenLightbox: () => void;
  onOpenImageManager: () => void;
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
      )}
    >
      {checked ? <Check className="h-3 w-3" /> : null}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {children}
    </p>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "mb-2 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
        active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border bg-card/50 text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left font-medium">{label}</span>
      <span
        className={cn(
          "inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          active ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
            active ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

/**
 * Panel "Cài đặt đọc" trượt ra từ bên phải — gom toàn bộ tùy chọn của trang
 * đọc truyện chêm vào các nhóm có nhãn (âm thanh, tốc độ, ngôn ngữ, khi đọc, ảnh).
 */
export function ReadingSettingsPanel(props: ReadingSettingsPanelProps) {
  const {
    open,
    onClose,
    decks,
    excludedDeckIds,
    onToggleDeck,
    onSelectAllDecks,
    onClearDecks,
    autoPlay,
    onToggleAutoPlay,
    loop,
    onToggleLoop,
    rate,
    onRate,
    viewMode,
    onViewMode,
    enAvailable,
    showMeanings,
    onToggleShowMeanings,
    focusMode,
    onToggleFocus,
    imageOnly,
    onToggleImageOnly,
    hasImages,
    onOpenLightbox,
    onOpenImageManager,
  } = props;

  const [deckQuery, setDeckQuery] = useState("");
  const [deckOpen, setDeckOpen] = useState(false);

  if (!open) return null;

  const chamOnly = viewMode !== "cham";
  const q = deckQuery.trim().toLowerCase();
  const filteredDecks = q ? decks.filter((d) => d.name.toLowerCase().includes(q)) : decks;
  const selectedCount = decks.filter((d) => !excludedDeckIds.has(d.id)).length;
  const allSelected = decks.length > 0 && selectedCount === decks.length;
  const deckSummary =
    selectedCount === 0
      ? "Chưa chọn deck nào"
      : allSelected
        ? `Tất cả deck (${decks.length})`
        : `Đã chọn ${selectedCount}/${decks.length} deck`;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-[28rem] max-w-[92vw] flex-col border-l bg-card shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-label="Cài đặt đọc"
      >
        <div className="flex items-center justify-between border-b px-4 py-3.5">
          <span className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </span>
            Cài đặt đọc
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {decks.length > 0 ? (
            <>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Deck muốn đọc
              </p>

              {/* Ô select thu gọn — bấm mới bung dropdown */}
              <button
                type="button"
                onClick={() => setDeckOpen((o) => !o)}
                aria-expanded={deckOpen}
                className="flex w-full items-center justify-between gap-2 rounded-xl border bg-card/50 px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
              >
                <span className={cn("truncate", selectedCount === 0 && "text-muted-foreground")}>
                  {deckSummary}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    deckOpen && "rotate-180",
                  )}
                />
              </button>

              {deckOpen ? (
                <div className="mt-1 rounded-xl border bg-card p-1.5 shadow-lg">
                  {/* Ô tìm deck */}
                  <div className="relative mb-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={deckQuery}
                      onChange={(e) => setDeckQuery(e.target.value)}
                      placeholder="Tìm deck…"
                      className="w-full rounded-lg border bg-transparent py-1.5 pl-8 pr-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                  {/* Dòng "Tất cả": chọn/bỏ chọn toàn bộ */}
                  {!q ? (
                    <button
                      type="button"
                      onClick={allSelected ? onClearDecks : onSelectAllDecks}
                      aria-pressed={allSelected}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <CheckBox checked={allSelected} />
                      <span className="flex-1">Tất cả</span>
                    </button>
                  ) : null}

                  {filteredDecks.length === 0 ? (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                      Không tìm thấy deck.
                    </p>
                  ) : (
                    filteredDecks.map((d) => {
                      const selected = !excludedDeckIds.has(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => onToggleDeck(d.id)}
                          aria-pressed={selected}
                          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <CheckBox checked={selected} />
                          <span className="flex-1 truncate">{d.name}</span>
                        </button>
                      );
                    })
                  )}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <SectionLabel>Âm thanh</SectionLabel>
          <ToggleRow
            icon={Volume2}
            label="Tự động phát"
            active={autoPlay}
            onClick={onToggleAutoPlay}
          />
          <ToggleRow icon={Repeat} label="Lặp lại đoạn" active={loop} onClick={onToggleLoop} />

          <SectionLabel>Tốc độ đọc</SectionLabel>
          <div className="inline-flex w-full rounded-xl border bg-card/50 p-0.5">
            {READING_SPEEDS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onRate(s.value)}
                aria-pressed={rate === s.value}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
                  rate === s.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <SectionLabel>Ngôn ngữ hiển thị</SectionLabel>
          {LANGS.map((l) => {
            const disabled = l.key === "en" && !enAvailable;
            const active = viewMode === l.key;
            return (
              <button
                key={l.key}
                type="button"
                disabled={disabled}
                onClick={() => onViewMode(l.key)}
                aria-pressed={active}
                title={disabled ? "Chưa có bản tiếng Anh" : undefined}
                className={cn(
                  "mb-2 flex w-full items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card/50 text-muted-foreground hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {l.label}
              </button>
            );
          })}

          <SectionLabel>Khi đọc</SectionLabel>
          <ToggleRow
            icon={Eye}
            label="Hiện nghĩa"
            active={showMeanings && !chamOnly}
            onClick={onToggleShowMeanings}
            disabled={chamOnly}
          />
          <ToggleRow
            icon={Target}
            label="Chế độ tập trung"
            active={focusMode && !chamOnly}
            onClick={onToggleFocus}
            disabled={chamOnly}
          />

          <SectionLabel>Hình ảnh</SectionLabel>
          <ToggleRow
            icon={ImageIcon}
            label="Chỉ xem ảnh"
            active={imageOnly}
            onClick={onToggleImageOnly}
          />
          {imageOnly && hasImages ? (
            <button
              type="button"
              onClick={onOpenLightbox}
              className="mb-2 flex w-full items-center gap-2.5 rounded-xl border bg-card/50 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Maximize2 className="h-4 w-4 shrink-0" />
              Xem toàn màn hình
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenImageManager}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <ImagePlus className="h-4 w-4 shrink-0" />
            Thêm ảnh của bạn
          </button>
        </div>
      </aside>
    </>
  );
}
