import { describe, expect, it } from "vitest";
import { deckCreateSchema, deckUpdateSchema } from "@/lib/schemas";

describe("deckCreateSchema", () => {
  it("điền giá trị mặc định khi tạo deck", () => {
    expect(deckCreateSchema.parse({ name: "Deck mới" })).toEqual({
      name: "Deck mới",
      color: "#3b82f6",
      language: "en",
    });
  });

  it("giữ nguyên ngôn ngữ được truyền vào", () => {
    expect(
      deckCreateSchema.parse({ name: "Hán ngữ", language: "zh" }).language,
    ).toBe("zh");
  });
});

describe("deckUpdateSchema", () => {
  it("KHÔNG tự thêm mặc định — PATCH chỉ đụng trường được gửi lên", () => {
    // Nếu update kế thừa `.default()`, mọi PATCH sẽ ghi đè color/language
    // và deck tiếng Trung sẽ bị đổi thành "en" rồi biến mất khỏi /chinese.
    expect(deckUpdateSchema.parse({ name: "Đổi tên" })).toEqual({
      name: "Đổi tên",
    });
    expect(deckUpdateSchema.parse({ customColumns: "[]" })).toEqual({
      customColumns: "[]",
    });
  });

  it("vẫn validate giá trị khi có gửi lên", () => {
    expect(() => deckUpdateSchema.parse({ color: "xanh" })).toThrow();
    expect(() => deckUpdateSchema.parse({ language: "jp" })).toThrow();
  });
});
