"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "voca-grammar-progress";

export interface GrammarTopicProgress {
  best: number; // % đúng cao nhất (0–100)
  attempts: number;
}

export type GrammarProgressMap = Record<string, GrammarTopicProgress>;

function readStore(): GrammarProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as GrammarProgressMap) : {};
  } catch {
    return {};
  }
}

/**
 * Quản lý tiến độ luyện ngữ pháp ở localStorage (app cá nhân, không cần DB).
 * Lưu điểm cao nhất + số lần luyện cho mỗi chủ đề.
 */
export function useGrammarProgress() {
  const [progress, setProgress] = useState<GrammarProgressMap>({});

  useEffect(() => {
    setProgress(readStore());
  }, []);

  const recordScore = useCallback((topicId: string, percent: number) => {
    setProgress((prev) => {
      const current = prev[topicId];
      const next: GrammarProgressMap = {
        ...prev,
        [topicId]: {
          best: Math.max(current?.best ?? 0, percent),
          attempts: (current?.attempts ?? 0) + 1,
        },
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage đầy hoặc bị chặn — bỏ qua, không chặn UI
      }
      return next;
    });
  }, []);

  return { progress, recordScore };
}
