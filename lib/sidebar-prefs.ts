/**
 * Lưu danh sách mục sidebar bị ẩn (theo href) vào localStorage.
 * Dùng mô hình store nhỏ để useSyncExternalStore cập nhật live khi đổi trong Cài đặt
 * — giống store trạng thái thu gọn sidebar.
 *
 * Khi CHƯA có gì trong localStorage → dùng bộ mặc định (chỉ Decks / Truyện chêm /
 * Cài đặt hiện). Ghi mảng rỗng `[]` nghĩa là "hiện tất cả" — khác với chưa cấu hình.
 */
import { DEFAULT_HIDDEN_HREFS } from "@/lib/nav-items";

const KEY = "voc-sidebar-hidden";
const listeners = new Set<() => void>();

const DEFAULT_HIDDEN: ReadonlySet<string> = new Set(DEFAULT_HIDDEN_HREFS);

// Cache theo chuỗi thô để snapshot ổn định (useSyncExternalStore yêu cầu
// tham chiếu không đổi khi dữ liệu không đổi — tránh vòng render vô hạn).
// Sentinel `undefined` = cache chưa khởi tạo (phân biệt với raw === null).
let cacheRaw: string | null | undefined;
let cacheVal: ReadonlySet<string> = DEFAULT_HIDDEN;

function parseHidden(raw: string | null): ReadonlySet<string> {
  if (raw === null) return DEFAULT_HIDDEN;
  try {
    const arr = JSON.parse(raw);
    return new Set(
      Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [],
    );
  } catch {
    return DEFAULT_HIDDEN;
  }
}

export function getHiddenSnapshot(): ReadonlySet<string> {
  if (typeof window === "undefined") return DEFAULT_HIDDEN;
  const raw = localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheVal = parseHidden(raw);
  }
  return cacheVal;
}

export function getHiddenServerSnapshot(): ReadonlySet<string> {
  return DEFAULT_HIDDEN;
}

export function subscribeHidden(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function persist(next: ReadonlySet<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* bỏ qua lỗi quota/private mode */
  }
  // Cập nhật cache ngay để snapshot phản ánh liền sau khi ghi.
  cacheRaw = JSON.stringify([...next]);
  cacheVal = next;
  listeners.forEach((cb) => cb());
}

/** Ẩn/hiện một mục sidebar. */
export function setNavItemHidden(href: string, hidden: boolean) {
  const cur = new Set(getHiddenSnapshot());
  if (hidden) cur.add(href);
  else cur.delete(href);
  persist(cur);
}

/** Hiện lại tất cả mục (xoá danh sách ẩn). */
export function showAllNavItems() {
  persist(new Set());
}

/** Đưa sidebar về bộ mặc định (chỉ Decks / Truyện chêm / Cài đặt). */
export function resetNavItemsToDefault() {
  persist(new Set(DEFAULT_HIDDEN));
}

/** Đang ở đúng bộ mặc định? (dùng để mờ nút reset) */
export function isDefaultHidden(hidden: ReadonlySet<string>): boolean {
  return (
    hidden.size === DEFAULT_HIDDEN.size &&
    [...DEFAULT_HIDDEN].every((href) => hidden.has(href))
  );
}
