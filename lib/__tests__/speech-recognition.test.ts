import { describe, expect, it } from "vitest";
import {
  matchPronunciation,
  STRICT_MATCH_THRESHOLD,
  DEFAULT_MATCH_THRESHOLD,
} from "@/lib/speech-recognition";

const STRICT = 0.95; // ngưỡng của mức "Nghiêm ngặt"

describe("matchPronunciation — chế độ thường (khoan dung)", () => {
  it("chấp nhận khớp tuyệt đối", () => {
    expect(matchPronunciation("cat", ["cat"], DEFAULT_MATCH_THRESHOLD).matched).toBe(true);
  });

  it("chấp nhận từ đích là một token trong câu dài (nói dư chữ)", () => {
    expect(matchPronunciation("cat", ["the cat sat"], DEFAULT_MATCH_THRESHOLD).matched).toBe(true);
  });

  it("chấp nhận khi từ đích nằm ở phương án xếp sau", () => {
    expect(matchPronunciation("cat", ["cut", "cat"], DEFAULT_MATCH_THRESHOLD).matched).toBe(true);
  });
});

describe("matchPronunciation — chế độ nghiêm ngặt", () => {
  it("vẫn chấp nhận khi đọc đúng tuyệt đối", () => {
    expect(matchPronunciation("cat", ["cat"], STRICT).matched).toBe(true);
  });

  it("KHÔNG chấp nhận từ đích chỉ là token trong câu dài", () => {
    expect(matchPronunciation("cat", ["the cat sat"], STRICT).matched).toBe(false);
  });

  it("KHÔNG vớt từ đích ở phương án xếp sau (chỉ tin phương án tốt nhất)", () => {
    expect(matchPronunciation("cat", ["cut", "cat"], STRICT).matched).toBe(false);
  });

  it("KHÔNG chấp nhận từ đọc sai gần giống (cut ≠ cat)", () => {
    expect(matchPronunciation("cat", ["cut"], STRICT).matched).toBe(false);
  });

  it("ngưỡng nghiêm ngặt đúng như định nghĩa", () => {
    expect(STRICT).toBeGreaterThanOrEqual(STRICT_MATCH_THRESHOLD);
  });
});
