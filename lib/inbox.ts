import { format, isSameDay, isSameYear } from "date-fns";

/**
 * Logic thuần cho giao diện "hộp thư" kiểu Gmail: mỗi thẻ từ là một "mail",
 * mỗi deck là một "nhãn". Không phụ thuộc React/DB để test được.
 */

export const INBOX_FOLDERS = [
  "inbox",
  "starred",
  "snoozed",
  "sent",
  "drafts",
  "all",
  "trash",
] as const;

export type InboxFolder = (typeof INBOX_FOLDERS)[number];

/** Nhãn hiển thị của từng thư mục. */
export const FOLDER_LABELS: Record<InboxFolder, string> = {
  inbox: "Hộp thư đến",
  starred: "Có gắn dấu sao",
  snoozed: "Đã tạm ẩn",
  sent: "Đã thuộc",
  drafts: "Từ mới",
  all: "Tất cả từ",
  trash: "Thùng rác",
};

/** Số dòng mỗi trang — giống Gmail. */
export const INBOX_PAGE_SIZE = 50;

/** Tối thiểu các field của thẻ mà hộp thư cần. */
export interface InboxCard {
  id: string;
  word: string;
  meaning: string;
  example: string | null;
  note: string | null;
  state: string;
  nextReviewDate: string;
  favorite: boolean;
  deck: { id: string; name: string };
}

export interface InboxFilter {
  folder: InboxFolder;
  /** deckId — khi có thì xem toàn bộ thẻ của nhãn, bỏ qua folder. */
  labelId?: string | null;
  query?: string | null;
}

const LEARNED_STATES = new Set(["REVIEW", "MATURE"]);

function isScheduled(card: InboxCard): boolean {
  return card.state !== "NEW" && card.state !== "SUSPENDED";
}

/** "Chưa đọc" = cần xử lý hôm nay: thẻ mới hoặc thẻ đã tới hạn ôn. */
export function isUnread(card: InboxCard, now: Date): boolean {
  if (card.state === "NEW") return true;
  return isScheduled(card) && new Date(card.nextReviewDate) <= now;
}

function matchesFolder(card: InboxCard, folder: InboxFolder, now: Date): boolean {
  switch (folder) {
    case "inbox":
      return isUnread(card, now);
    case "starred":
      return card.favorite;
    case "snoozed":
      return isScheduled(card) && new Date(card.nextReviewDate) > now;
    case "sent":
      return LEARNED_STATES.has(card.state);
    case "drafts":
      return card.state === "NEW";
    case "all":
    case "trash":
      return true;
    default: {
      const never: never = folder;
      return never;
    }
  }
}

function matchesQuery(card: InboxCard, query: string): boolean {
  const haystack = `${card.word}\n${card.meaning}\n${card.example ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

/** Lọc thẻ theo thư mục / nhãn / từ khoá. Trả về mảng mới. */
export function filterInbox<T extends InboxCard>(
  cards: readonly T[],
  filter: InboxFilter,
  now: Date,
): T[] {
  const query = filter.query?.trim().toLowerCase() ?? "";
  return cards.filter((card) => {
    const inScope = filter.labelId
      ? card.deck.id === filter.labelId
      : matchesFolder(card, filter.folder, now);
    return inScope && (query === "" || matchesQuery(card, query));
  });
}

export function unreadCount(cards: readonly InboxCard[], now: Date): number {
  return cards.reduce((n, c) => (isUnread(c, now) ? n + 1 : n), 0);
}

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  /** Vị trí 1-based của dòng đầu/cuối trang ("1–50 trên 1.613"). */
  from: number;
  to: number;
  total: number;
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    page: current,
    pageCount,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
    total,
  };
}

/** Định dạng ngày ở cột phải: cùng ngày → giờ, cùng năm → "19 thg 10", khác năm → dd/MM/yyyy. */
export function formatMailDate(value: string | Date, now: Date): string {
  const date = new Date(value);
  if (isSameDay(date, now)) return format(date, "HH:mm");
  if (isSameYear(date, now)) return format(date, "d 'thg' M");
  return format(date, "dd/MM/yyyy");
}

/** Đoạn xem trước sau tiêu đề: câu ví dụ, không có thì ghi chú. */
export function mailPreview(card: Pick<InboxCard, "example" | "note">): string {
  return (card.example ?? card.note ?? "").trim();
}

export function parseFolder(raw: string | null | undefined): InboxFolder {
  return (INBOX_FOLDERS as readonly string[]).includes(raw ?? "")
    ? (raw as InboxFolder)
    : "inbox";
}

export interface MailDateSource {
  state: string;
  nextReviewDate: string;
  createdAt: string;
  deletedAt: string | null;
}

/** Ngày mail hiển thị: thùng rác → lúc xoá, từ mới → lúc tạo, còn lại → hạn ôn. */
export function mailDateOf(card: MailDateSource): string {
  if (card.deletedAt) return card.deletedAt;
  return card.state === "NEW" ? card.createdAt : card.nextReviewDate;
}

export interface InboxLocation {
  folder: InboxFolder;
  labelId?: string | null;
  query?: string | null;
  page?: number;
}

/** Query string giữ ngữ cảnh hộp thư khi chuyển giữa danh sách và trang đọc. Bỏ giá trị mặc định. */
export function inboxSearch(loc: InboxLocation): string {
  const params = new URLSearchParams();
  if (loc.labelId) params.set("label", loc.labelId);
  else if (loc.folder !== "inbox") params.set("folder", loc.folder);
  const q = loc.query?.trim();
  if (q) params.set("q", q);
  if (loc.page && loc.page > 1) params.set("page", String(loc.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

/** Đọc ngữ cảnh hộp thư từ URLSearchParams. */
export function parseInboxLocation(params: { get(name: string): string | null }): InboxLocation {
  const page = Number(params.get("page"));
  return {
    folder: parseFolder(params.get("folder")),
    labelId: params.get("label"),
    query: params.get("q"),
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : 1,
  };
}

/** Tên deck "Bài 1: 你好" → người gửi "Bài 1" + tiêu đề "你好" (dòng mail kiểu Gmail). */
export function splitDeckName(name: string): { sender: string; subject: string } {
  const i = name.indexOf(":");
  if (i < 0) return { sender: name.trim(), subject: "" };
  return { sender: name.slice(0, i).trim(), subject: name.slice(i + 1).trim() };
}
