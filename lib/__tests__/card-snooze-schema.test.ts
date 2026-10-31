import { describe, expect, it } from "vitest";
import { cardUpdateSchema } from "../schemas";

describe("cardUpdateSchema.nextReviewDate (tạm ẩn thẻ)", () => {
  it("nhận chuỗi ISO và chuyển thành Date", () => {
    const parsed = cardUpdateSchema.parse({ nextReviewDate: "2026-11-05T00:00:00.000Z" });
    expect(parsed.nextReviewDate).toBeInstanceOf(Date);
  });
  it("không gửi thì để undefined (không động tới lịch ôn)", () => {
    expect(cardUpdateSchema.parse({ favorite: true }).nextReviewDate).toBeUndefined();
  });
  it("từ chối ngày không hợp lệ", () => {
    expect(() => cardUpdateSchema.parse({ nextReviewDate: "abc" })).toThrow();
  });
});
