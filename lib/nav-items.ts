import {
  ArrowLeftRight,
  Blocks,
  BookMarked,
  BookText,
  CircleAlert,
  GraduationCap,
  History,
  Layers,
  Library,
  type LucideIcon,
  Search,
  Settings,
  Sprout,
  Star,
  Trash2,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  /** Chỉ prefetch tự động vài route hay dùng; còn lại chỉ prefetch khi hover
   *  (tránh bắn ~15 request RSC cùng lúc gây nghẽn hàng đợi kết nối). */
  prefetch?: boolean;
  /** Luôn hiển thị, không cho ẩn (để trang Cài đặt luôn truy cập được). */
  pinned?: boolean;
  /** Thuộc bộ mặc định: hiện sẵn khi chưa cấu hình gì / sau khi reset. */
  defaultVisible?: boolean;
}

/** Danh sách mục điều hướng dùng chung cho sidebar + trang cấu hình. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/decks", label: "Decks", icon: Layers, mobile: true, prefetch: true, defaultVisible: true },
  { href: "/search", label: "Tra từ", icon: Search, mobile: false },
  {
    href: "/stories",
    label: "Truyện chêm",
    icon: BookMarked,
    mobile: true,
    prefetch: true,
    defaultVisible: true,
  },
  { href: "/words", label: "Tất cả từ", icon: Library, mobile: false },
  { href: "/favorites", label: "Yêu thích", icon: Star, mobile: false },
  { href: "/history", label: "Lịch sử", icon: History, mobile: false },
  { href: "/mistakes", label: "Xem lỗi sai", icon: CircleAlert, mobile: false },
  { href: "/ielts", label: "IELTS", icon: GraduationCap, mobile: true },
  { href: "/grammar", label: "Ngữ pháp", icon: BookText, mobile: true },
  { href: "/word-formation", label: "Cấu tạo từ", icon: Blocks, mobile: false },
  { href: "/word-roots", label: "Từ gốc", icon: Sprout, mobile: false },
  { href: "/confusing-words", label: "Từ dễ lẫn", icon: ArrowLeftRight, mobile: false },
  { href: "/trash", label: "Thùng rác", icon: Trash2, mobile: false },
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
    mobile: true,
    pinned: true,
    defaultVisible: true,
  },
];

/** Bộ mặc định = chỉ Decks / Truyện chêm / Cài đặt → các mục còn lại bị ẩn. */
export const DEFAULT_HIDDEN_HREFS: readonly string[] = NAV_ITEMS.filter(
  (i) => !i.pinned && !i.defaultVisible,
).map((i) => i.href);
