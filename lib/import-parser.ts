import { WORD_FORM_ORDER, type WordForms } from "@/lib/word-forms";

export interface CardImport {
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  rootWord: string | null;
  phonetic: string | null;
  example: string | null;
  exampleTranslation: string | null;
  note: string | null;
  tags: string[];
  wordForms: WordForms | null;
}

// Metadata cho deck khi import nguyên deck mới
export interface DeckMeta {
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
}

const DEFAULT_DECK_COLOR = "#3b82f6";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export interface ImportError {
  row?: number;
  message: string;
}

export interface ImportResult {
  cards: CardImport[];
  errors: ImportError[];
}

const MAX_TAGS = 10;
const MAX_WORD_LEN = 120;
const MAX_MEANING_LEN = 500;
const MAX_FIELD_LEN = 500;
const MAX_NOTE_LEN = 1000;

const REQUIRED_HEADERS = ["word", "meaning"] as const;
const KNOWN_HEADERS = [
  "word",
  "meaning",
  "partOfSpeech",
  "rootWord",
  "phonetic",
  "example",
  "exampleTranslation",
  "note",
  "tags",
] as const;

type KnownHeader = (typeof KNOWN_HEADERS)[number];

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === ",") {
        fields.push(current);
        current = "";
      } else if (ch === '"' && current === "") {
        inQuotes = true;
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function splitCsvRows(text: string): string[] {
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += ch;
      }
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      rows.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

function splitTags(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[;,]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, MAX_TAGS);
}

function emptyCard(): CardImport {
  return {
    word: "",
    meaning: "",
    partOfSpeech: null,
    rootWord: null,
    phonetic: null,
    example: null,
    exampleTranslation: null,
    note: null,
    tags: [],
    wordForms: null,
  };
}

/** Chuẩn hoá object wordForms từ JSON: chỉ giữ noun/verb/adjective/adverb là chuỗi. */
function normalizeWordForms(raw: unknown): WordForms | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const result: WordForms = {};
  for (const pos of WORD_FORM_ORDER) {
    const value = obj[pos];
    if (typeof value === "string" && value.trim()) {
      result[pos] = value.trim().slice(0, 120);
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

function nullable(raw: string | undefined, maxLen: number): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

function validateCard(card: CardImport, row: number, errors: ImportError[]): boolean {
  if (!card.word) {
    errors.push({ row, message: `Dòng ${row}: thiếu "word"` });
    return false;
  }
  if (!card.meaning) {
    errors.push({ row, message: `Dòng ${row}: thiếu "meaning"` });
    return false;
  }
  if (card.word.length > MAX_WORD_LEN) {
    errors.push({ row, message: `Dòng ${row}: "word" quá dài (tối đa ${MAX_WORD_LEN} ký tự)` });
    return false;
  }
  if (card.meaning.length > MAX_MEANING_LEN) {
    errors.push({
      row,
      message: `Dòng ${row}: "meaning" quá dài (tối đa ${MAX_MEANING_LEN} ký tự)`,
    });
    return false;
  }
  return true;
}

export function parseCsvImport(text: string): ImportResult {
  const errors: ImportError[] = [];
  const cards: CardImport[] = [];

  if (!text || !text.trim()) {
    return { cards, errors: [{ message: "File rỗng" }] };
  }

  const rows = splitCsvRows(text).filter((r) => r.trim().length > 0);
  if (rows.length === 0) {
    return { cards, errors: [{ message: "File rỗng" }] };
  }

  const headerFields = parseCsvLine(rows[0]).map((h) => h.trim());
  const missing = REQUIRED_HEADERS.filter((h) => !headerFields.includes(h));
  if (missing.length > 0) {
    return {
      cards,
      errors: [
        {
          message: `Thiếu cột bắt buộc: ${missing.join(", ")}. Cần có header: word, meaning`,
        },
      ],
    };
  }

  const headerIndex = new Map<KnownHeader, number>();
  KNOWN_HEADERS.forEach((h) => {
    const idx = headerFields.indexOf(h);
    if (idx !== -1) headerIndex.set(h, idx);
  });

  for (let i = 1; i < rows.length; i++) {
    const fields = parseCsvLine(rows[i]);
    const row = i + 1;
    const card = emptyCard();
    card.word = (fields[headerIndex.get("word") ?? -1] ?? "").trim().slice(0, MAX_WORD_LEN);
    card.meaning = (fields[headerIndex.get("meaning") ?? -1] ?? "").trim().slice(0, MAX_MEANING_LEN);
    card.partOfSpeech = nullable(fields[headerIndex.get("partOfSpeech") ?? -1], 30);
    card.rootWord = nullable(fields[headerIndex.get("rootWord") ?? -1], 120);
    card.phonetic = nullable(fields[headerIndex.get("phonetic") ?? -1], 80);
    card.example = nullable(fields[headerIndex.get("example") ?? -1], MAX_FIELD_LEN);
    card.exampleTranslation = nullable(
      fields[headerIndex.get("exampleTranslation") ?? -1],
      MAX_FIELD_LEN,
    );
    card.note = nullable(fields[headerIndex.get("note") ?? -1], MAX_NOTE_LEN);
    const tagsRaw = fields[headerIndex.get("tags") ?? -1] ?? "";
    card.tags = splitTags(tagsRaw);

    if (validateCard(card, row, errors)) {
      cards.push(card);
    }
  }

  return { cards, errors };
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, MAX_TAGS);
  }
  if (typeof raw === "string") return splitTags(raw);
  return [];
}

function pickString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  return typeof v === "string" ? v.trim() : "";
}

function pickNullable(
  obj: Record<string, unknown>,
  key: string,
  maxLen: number,
): string | null {
  const v = obj[key];
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export function parseJsonImport(text: string): ImportResult {
  const errors: ImportError[] = [];
  const cards: CardImport[] = [];

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "JSON không hợp lệ";
    return { cards, errors: [{ message: `JSON không hợp lệ: ${msg}` }] };
  }

  let list: unknown;
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object" && "cards" in raw) {
    list = (raw as { cards: unknown }).cards;
  } else {
    return {
      cards,
      errors: [{ message: 'JSON phải là array hoặc object có thuộc tính "cards"' }],
    };
  }

  if (!Array.isArray(list)) {
    return { cards, errors: [{ message: '"cards" phải là array' }] };
  }

  list.forEach((item, idx) => {
    const row = idx + 1;
    if (!item || typeof item !== "object") {
      errors.push({ row, message: `Phần tử ${row}: không phải object` });
      return;
    }
    const obj = item as Record<string, unknown>;
    const card: CardImport = {
      word: pickString(obj, "word").slice(0, MAX_WORD_LEN),
      meaning: pickString(obj, "meaning").slice(0, MAX_MEANING_LEN),
      partOfSpeech: pickNullable(obj, "partOfSpeech", 30),
      rootWord: pickNullable(obj, "rootWord", 120),
      phonetic: pickNullable(obj, "phonetic", 80),
      example: pickNullable(obj, "example", MAX_FIELD_LEN),
      exampleTranslation: pickNullable(obj, "exampleTranslation", MAX_FIELD_LEN),
      note: pickNullable(obj, "note", MAX_NOTE_LEN),
      tags: normalizeTags(obj.tags),
      wordForms: normalizeWordForms(obj.wordForms),
    };
    if (validateCard(card, row, errors)) {
      cards.push(card);
    }
  });

  return { cards, errors };
}

export function detectFormatByName(filename: string): "csv" | "json" | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  return null;
}

/** Bỏ phần mở rộng file để dùng làm tên deck mặc định: "Unit 1.json" -> "Unit 1". */
export function deckNameFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").trim().slice(0, 80) || "Deck mới";
}

function deckMetaFromJson(raw: unknown, fallbackName: string): DeckMeta {
  const deckRaw =
    raw && typeof raw === "object" && "deck" in raw
      ? (raw as { deck: unknown }).deck
      : null;
  const obj =
    deckRaw && typeof deckRaw === "object"
      ? (deckRaw as Record<string, unknown>)
      : {};

  const name =
    typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim().slice(0, 80)
      : fallbackName;
  const description =
    typeof obj.description === "string" && obj.description.trim()
      ? obj.description.trim().slice(0, 300)
      : null;
  const color =
    typeof obj.color === "string" && HEX_COLOR.test(obj.color)
      ? obj.color
      : DEFAULT_DECK_COLOR;
  const icon =
    typeof obj.icon === "string" && obj.icon.trim()
      ? obj.icon.trim().slice(0, 8)
      : null;

  return { name, description, color, icon };
}

export interface DeckImportResult {
  deck: DeckMeta;
  cards: CardImport[];
  errors: ImportError[];
}

/**
 * Parse file import nguyên deck mới: deck metadata + danh sách card.
 * - CSV: file chỉ chứa card → tên deck lấy từ `fallbackName` (tên file).
 * - JSON: đọc `deck` (nếu có) + `cards`.
 */
export function parseDeckImport(
  text: string,
  format: "csv" | "json",
  fallbackName: string,
): DeckImportResult {
  const defaultDeck: DeckMeta = {
    name: fallbackName,
    description: null,
    color: DEFAULT_DECK_COLOR,
    icon: null,
  };

  if (format === "csv") {
    const { cards, errors } = parseCsvImport(text);
    return { deck: defaultDeck, cards, errors };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    // parseJsonImport sẽ trả lỗi cú pháp chi tiết bên dưới
    raw = null;
  }
  const { cards, errors } = parseJsonImport(text);
  const deck = raw ? deckMetaFromJson(raw, fallbackName) : defaultDeck;
  return { deck, cards, errors };
}
