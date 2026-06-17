"use client";

// Web Speech Recognition API chưa có sẵn trong lib.dom ở nhiều cấu hình TS,
// nên khai báo tối thiểu các kiểu cần dùng ở đây.

export interface SpeechRecognitionAlt {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlt;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getCtor() !== null;
}

export function createRecognition(lang = "en-US"): SpeechRecognitionInstance | null {
  const Ctor = getCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;
  return recognition;
}

/**
 * Chuẩn hoá để so khớp: bỏ khoảng trắng thừa, dấu câu, đưa về chữ thường.
 * Dùng cho chế độ chấm "chính xác tuyệt đối" (so sau khi chuẩn hoá cơ bản).
 */
export function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'’]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Chấm chính xác tuyệt đối: ít nhất một phương án nhận dạng (alternative)
 * trùng khớp hoàn toàn với từ đích sau khi chuẩn hoá.
 */
export function isExactMatch(target: string, alternatives: readonly string[]): boolean {
  const normalizedTarget = normalizeForCompare(target);
  return alternatives.some((alt) => normalizeForCompare(alt) === normalizedTarget);
}
