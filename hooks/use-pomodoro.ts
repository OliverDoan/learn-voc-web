"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

/** Thời lượng từng phase, tính bằng phút. Key trùng với PomodoroPhase. */
export interface PomodoroDurations {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export const DEFAULT_DURATIONS: PomodoroDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

/** Số phiên tập trung trước khi được nghỉ dài. */
const SESSIONS_BEFORE_LONG_BREAK = 4;

export const PHASE_LABELS: Record<PomodoroPhase, string> = {
  focus: "Tập trung",
  shortBreak: "Nghỉ ngắn",
  longBreak: "Nghỉ dài",
};

/** Beep nhẹ khi hết một phase. Bỏ qua nếu trình duyệt chặn audio. */
function beep(): void {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio không khả dụng — bỏ qua
  }
}

export interface UsePomodoroResult {
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedFocus: number;
  durations: PomodoroDurations;
  /** Tiến độ phase hiện tại, 0 → 1. */
  progress: number;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  setDurations: (durations: PomodoroDurations) => void;
}

export function usePomodoro(
  initial: PomodoroDurations = DEFAULT_DURATIONS,
): UsePomodoroResult {
  const [durations, setDurationsState] = useState<PomodoroDurations>(initial);
  const [phase, setPhase] = useState<PomodoroPhase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(initial.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);

  const phaseSeconds = useCallback(
    (p: PomodoroPhase) => durations[p] * 60,
    [durations],
  );

  const goToPhase = useCallback(
    (p: PomodoroPhase) => {
      setPhase(p);
      setSecondsLeft(phaseSeconds(p));
      setIsRunning(false);
    },
    [phaseSeconds],
  );

  // Chuyển phase khi hết giờ (tự động): focus → break, break → focus
  const advance = useCallback(() => {
    beep();
    if (phase === "focus") {
      const next = completedFocus + 1;
      setCompletedFocus(next);
      const isLong = next % SESSIONS_BEFORE_LONG_BREAK === 0;
      goToPhase(isLong ? "longBreak" : "shortBreak");
    } else {
      goToPhase("focus");
    }
  }, [phase, completedFocus, goToPhase]);

  // Refs giữ giá trị mới nhất cho interval, tránh phụ thuộc gây tạo lại interval
  const secondsRef = useRef(secondsLeft);
  const advanceRef = useRef(advance);
  useEffect(() => {
    secondsRef.current = secondsLeft;
    advanceRef.current = advance;
  });

  // Đếm ngược mỗi giây; chạm 0 thì chuyển phase ở lần tick kế tiếp
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      if (secondsRef.current <= 0) {
        advanceRef.current();
      } else {
        setSecondsLeft((s) => s - 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const toggle = useCallback(() => {
    setSecondsLeft((s) => (s <= 0 ? phaseSeconds(phase) : s));
    setIsRunning((r) => !r);
  }, [phase, phaseSeconds]);

  const reset = useCallback(() => {
    goToPhase(phase);
  }, [goToPhase, phase]);

  // Bỏ qua phase hiện tại (thủ công, không tính là phiên hoàn thành)
  const skip = useCallback(() => {
    if (phase === "focus") {
      const isLong =
        (completedFocus + 1) % SESSIONS_BEFORE_LONG_BREAK === 0;
      goToPhase(isLong ? "longBreak" : "shortBreak");
    } else {
      goToPhase("focus");
    }
  }, [phase, completedFocus, goToPhase]);

  const setDurations = useCallback((next: PomodoroDurations) => {
    setDurationsState(next);
    setPhase("focus");
    setCompletedFocus(0);
    setIsRunning(false);
    setSecondsLeft(next.focus * 60);
  }, []);

  const progress = useMemo(() => {
    const total = phaseSeconds(phase);
    if (total <= 0) return 0;
    return 1 - secondsLeft / total;
  }, [phaseSeconds, phase, secondsLeft]);

  return {
    phase,
    secondsLeft,
    isRunning,
    completedFocus,
    durations,
    progress,
    toggle,
    reset,
    skip,
    setDurations,
  };
}
