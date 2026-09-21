import { describe, expect, it } from "vitest";
import { matchesMeaning, meaningVariants } from "../meaning-match";

describe("meaningVariants", () => {
  it("giữ nguyên nghĩa đơn", () => {
    expect(meaningVariants("gọn gàng")).toEqual(["gọn gàng"]);
  });

  it("tách nhiều nghĩa ngăn bởi dấu chấm phẩy", () => {
    expect(meaningVariants("tức giận; điên rồ")).toEqual([
      "tức giận; điên rồ",
      "tức giận",
      "điên rồ",
    ]);
  });

  it("tách các cách diễn đạt ngăn bởi dấu phẩy", () => {
    expect(meaningVariants("tàn nhẫn, độc ác")).toContain("tàn nhẫn");
    expect(meaningVariants("tàn nhẫn, độc ác")).toContain("độc ác");
  });

  it("không tách dấu phẩy nằm trong ngoặc, và thêm bản bỏ ngoặc", () => {
    const variants = meaningVariants("phát triển (tính cách, mối quan hệ)");
    expect(variants).toContain("phát triển (tính cách, mối quan hệ)");
    expect(variants).toContain("phát triển");
    expect(variants).not.toContain("phát triển (tính cách");
  });

  it("bỏ khoảng trắng thừa và phần rỗng", () => {
    expect(meaningVariants("  vui sướng ,  hân hoan ; ")).toEqual([
      "vui sướng , hân hoan",
      "vui sướng",
      "hân hoan",
    ]);
  });

  it("trả mảng rỗng cho chuỗi rỗng", () => {
    expect(meaningVariants("   ")).toEqual([]);
  });
});

describe("matchesMeaning", () => {
  it("chấp nhận khi gõ đủ cả chuỗi nghĩa", () => {
    expect(matchesMeaning("tức giận; điên rồ", "tức giận; điên rồ")).toBe(true);
  });

  it("chấp nhận khi chỉ gõ một nghĩa", () => {
    expect(matchesMeaning("điên rồ", "tức giận; điên rồ")).toBe(true);
    expect(matchesMeaning("tức giận", "tức giận; điên rồ")).toBe(true);
  });

  it("chấp nhận một cách diễn đạt ngăn bởi dấu phẩy", () => {
    expect(matchesMeaning("độc ác", "tàn nhẫn, độc ác")).toBe(true);
  });

  it("chấp nhận phần ngoài ngoặc", () => {
    expect(matchesMeaning("phát triển", "phát triển (tính cách, mối quan hệ)")).toBe(true);
  });

  it("bỏ qua hoa thường, khoảng trắng thừa và dấu chấm cuối", () => {
    expect(matchesMeaning("  Điên Rồ. ", "tức giận; điên rồ")).toBe(true);
  });

  it("vẫn nới lỏng vài lỗi gõ trong một nghĩa", () => {
    expect(matchesMeaning("tuc giận", "tức giận; điên rồ")).toBe(true);
  });

  it("từ chối nghĩa khác hẳn", () => {
    expect(matchesMeaning("gọn gàng", "tức giận; điên rồ")).toBe(false);
    expect(matchesMeaning("", "tức giận")).toBe(false);
  });

  it("không chấp nhận một mẩu quá ngắn của nghĩa", () => {
    expect(matchesMeaning("tức", "tức giận; điên rồ")).toBe(false);
  });

  it("chấp nhận nghĩa ngắn nhưng phải gõ đúng hẳn", () => {
    // "điểm; lớp (cấp học)" — cả hai nghĩa đều rất ngắn.
    expect(matchesMeaning("lớp", "điểm; lớp (cấp học)")).toBe(true);
    expect(matchesMeaning("điểm", "điểm; lớp (cấp học)")).toBe(true);
    expect(matchesMeaning("lá", "điểm; lớp (cấp học)")).toBe(false);
    expect(matchesMeaning("lợn", "điểm; lớp (cấp học)")).toBe(false);
  });
});
