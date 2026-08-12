/**
 * Lưu danh sách mục sidebar bị ẩn (theo href) vào localStorage.
 * Dùng mô hình store nhỏ để useSyncExternalStore cập nhật live khi đổi trong Cài đặt
 * — giống store trạng thái thu gọn sidebar. SSR trả về tập rỗng để khớp server.
 */
const KEY = "voc-sidebar-hidden";
const listeners = new Set<() => void>();

const EMPTY: ReadonlySet<string> = new Set();
// Cache theo chuỗi thô để snapshot ổn định (useSyncExternalStore yêu cầu
// tham chiếu không đổi khi dữ liệu không đổi — tránh vòng render vô hạn).
let cacheRaw: string | null = null;
let cacheVal: ReadonlySet<string> = EMPTY;

export function getHiddenSnapshot(): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const arr = raw ? JSON.parse(raw) : [];
      cacheVal = new Set(
        Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [],
      );
    } catch {
      cacheVal = new Set();
    }
  }
  return cacheVal;
}

export function getHiddenServerSnapshot(): ReadonlySet<string> {
  return EMPTY;
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
  cacheRaw = localStorage.getItem(KEY);
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
export function resetHiddenNavItems() {
  persist(new Set());
}
