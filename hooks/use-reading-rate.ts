"use client";

import { useEffect, useState } from "react";

/** Các mức tốc độ đọc truyện chêm — đồng bộ với "Đọc tất cả" của deck. */
export const READING_SPEEDS = [
  { label: "Chậm", value: 0.7 },
  { label: "Vừa", value: 0.95 },
  { label: "Nhanh", value: 1.2 },
] as const;

const DEFAULT_RATE = 0.95;
const LS_KEY = "voca-story-rate";

/**
 * Quản lý tốc độ đọc truyện, lưu vào localStorage để giữ lựa chọn giữa các trang.
 * Trả về rate hiện tại và hàm đổi rate (kèm lưu lại).
 */
export function useReadingRate(): { rate: number; setRate: (v: number) => void } {
  const [rate, setRateState] = useState(DEFAULT_RATE);

  useEffect(() => {
    const stored = Number(localStorage.getItem(LS_KEY));
    if (READING_SPEEDS.some((s) => s.value === stored)) setRateState(stored);
  }, []);

  const setRate = (v: number) => {
    setRateState(v);
    localStorage.setItem(LS_KEY, String(v));
  };

  return { rate, setRate };
}
