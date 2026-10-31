import { describe, expect, it } from "vitest";
import {
  filterInbox,
  formatMailDate,
  inboxSearch,
  parseInboxLocation,
  isUnread,
  mailDateOf,
  mailPreview,
  paginate,
  splitDeckName,
  parseFolder,
  unreadCount,
  type InboxCard,
} from "../inbox";

const NOW = new Date("2026-10-29T10:00:00");

function card(over: Partial<InboxCard> = {}): InboxCard {
  return {
    id: "c1",
    word: "apple",
    meaning: "quả táo",
    example: "I eat an apple.",
    note: null,
    state: "REVIEW",
    nextReviewDate: "2026-10-28T09:00:00",
    favorite: false,
    deck: { id: "d1", name: "Unit 1" },
    ...over,
  };
}

describe("isUnread", () => {
  it("thẻ mới chưa học là chưa đọc", () => {
    expect(isUnread(card({ state: "NEW", nextReviewDate: "2027-01-01" }), NOW)).toBe(true);
  });
  it("thẻ đến hạn ôn là chưa đọc", () => {
    expect(isUnread(card(), NOW)).toBe(true);
  });
  it("thẻ chưa tới hạn là đã đọc", () => {
    expect(isUnread(card({ nextReviewDate: "2026-11-05" }), NOW)).toBe(false);
  });
  it("thẻ tạm ngưng không bao giờ chưa đọc", () => {
    expect(isUnread(card({ state: "SUSPENDED" }), NOW)).toBe(false);
  });
});

describe("filterInbox", () => {
  const cards = [
    card({ id: "new", state: "NEW", nextReviewDate: "2026-10-29T09:00:00" }),
    card({ id: "due", state: "REVIEW" }),
    card({ id: "later", state: "MATURE", nextReviewDate: "2026-12-01", favorite: true }),
    card({ id: "other", state: "LEARNING", deck: { id: "d2", name: "Unit 2" }, word: "river" }),
  ];
  const ids = (xs: InboxCard[]) => xs.map((c) => c.id);

  it("inbox = thẻ mới + thẻ đến hạn", () => {
    expect(ids(filterInbox(cards, { folder: "inbox" }, NOW))).toEqual(["new", "due", "other"]);
  });
  it("starred = yêu thích", () => {
    expect(ids(filterInbox(cards, { folder: "starred" }, NOW))).toEqual(["later"]);
  });
  it("snoozed = đã học nhưng chưa tới hạn", () => {
    expect(ids(filterInbox(cards, { folder: "snoozed" }, NOW))).toEqual(["later"]);
  });
  it("sent = đã thuộc (REVIEW/MATURE)", () => {
    expect(ids(filterInbox(cards, { folder: "sent" }, NOW))).toEqual(["due", "later"]);
  });
  it("drafts = thẻ mới", () => {
    expect(ids(filterInbox(cards, { folder: "drafts" }, NOW))).toEqual(["new"]);
  });
  it("label lọc theo deck và bỏ qua folder", () => {
    expect(ids(filterInbox(cards, { folder: "drafts", labelId: "d2" }, NOW))).toEqual(["other"]);
  });
  it("tìm kiếm không phân biệt hoa thường trên từ/nghĩa/ví dụ", () => {
    expect(ids(filterInbox(cards, { folder: "all", query: "  RIVER " }, NOW))).toEqual(["other"]);
    expect(filterInbox(cards, { folder: "all", query: "táo" }, NOW)).toHaveLength(4);
  });
  it("không đổi mảng gốc", () => {
    const copy = [...cards];
    filterInbox(cards, { folder: "inbox" }, NOW);
    expect(cards).toEqual(copy);
  });
});

describe("unreadCount", () => {
  it("đếm thẻ chưa đọc", () => {
    expect(unreadCount([card(), card({ nextReviewDate: "2027-01-01" })], NOW)).toBe(1);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 120 }, (_, i) => i);
  it("trang đầu", () => {
    expect(paginate(items, 1, 50)).toMatchObject({ from: 1, to: 50, total: 120, pageCount: 3, page: 1 });
  });
  it("trang cuối thiếu", () => {
    const p = paginate(items, 3, 50);
    expect(p.items).toHaveLength(20);
    expect(p).toMatchObject({ from: 101, to: 120 });
  });
  it("kẹp trang ngoài phạm vi", () => {
    expect(paginate(items, 99, 50).page).toBe(3);
    expect(paginate(items, 0, 50).page).toBe(1);
  });
  it("danh sách rỗng", () => {
    expect(paginate([], 1, 50)).toMatchObject({ from: 0, to: 0, total: 0, pageCount: 1 });
  });
});

describe("formatMailDate", () => {
  it("cùng ngày → giờ", () => {
    expect(formatMailDate("2026-10-29T08:05:00", NOW)).toBe("08:05");
  });
  it("cùng năm → ngày tháng", () => {
    expect(formatMailDate("2026-10-19T08:05:00", NOW)).toBe("19 thg 10");
  });
  it("khác năm → dd/MM/yyyy", () => {
    expect(formatMailDate("2025-03-04T08:05:00", NOW)).toBe("04/03/2025");
  });
});

describe("mailPreview", () => {
  it("ưu tiên câu ví dụ, rồi ghi chú", () => {
    expect(mailPreview(card())).toBe("I eat an apple.");
    expect(mailPreview(card({ example: null, note: "ghi chú" }))).toBe("ghi chú");
    expect(mailPreview(card({ example: null, note: null }))).toBe("");
  });
});

describe("parseFolder", () => {
  it("giá trị lạ → inbox", () => {
    expect(parseFolder("trash")).toBe("trash");
    expect(parseFolder("xyz")).toBe("inbox");
    expect(parseFolder(null)).toBe("inbox");
  });
});

describe("mailDateOf", () => {
  const base = { state: "REVIEW", nextReviewDate: "R", createdAt: "C", deletedAt: null };
  it("thẻ đang học → hạn ôn", () => expect(mailDateOf(base)).toBe("R"));
  it("thẻ mới → ngày tạo", () => expect(mailDateOf({ ...base, state: "NEW" })).toBe("C"));
  it("thẻ trong thùng rác → ngày xoá", () =>
    expect(mailDateOf({ ...base, state: "NEW", deletedAt: "D" })).toBe("D"));
});

describe("inboxSearch / parseInboxLocation", () => {
  it("bỏ giá trị mặc định", () => {
    expect(inboxSearch({ folder: "inbox", page: 1 })).toBe("");
  });
  it("nhãn thay cho folder, kèm q và page", () => {
    expect(inboxSearch({ folder: "starred", labelId: "d1", query: " cat ", page: 2 })).toBe(
      "?label=d1&q=cat&page=2",
    );
  });
  it("đọc ngược lại đúng ngữ cảnh, page lỗi → 1", () => {
    const loc = parseInboxLocation(new URLSearchParams("folder=sent&q=x&page=abc"));
    expect(loc).toEqual({ folder: "sent", labelId: null, query: "x", page: 1 });
    expect(parseInboxLocation(new URLSearchParams("page=3")).page).toBe(3);
  });
});

describe("splitDeckName", () => {
  it("tách 'Bài 1: tiêu đề' thành người gửi + tiêu đề", () => {
    expect(splitDeckName("Bài 1: 你好 (Xin chào)")).toEqual({ sender: "Bài 1", subject: "你好 (Xin chào)" });
  });
  it("chỉ tách ở dấu ':' đầu tiên", () => {
    expect(splitDeckName("Unit 2: A: B")).toEqual({ sender: "Unit 2", subject: "A: B" });
  });
  it("không có ':' → cả tên là người gửi", () => {
    expect(splitDeckName("Daily Life")).toEqual({ sender: "Daily Life", subject: "" });
  });
});
