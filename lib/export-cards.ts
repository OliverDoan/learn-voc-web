import { parseTags } from "./utils";

export interface ExportableCard {
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  phonetic: string | null;
  example: string | null;
  exampleTranslation: string | null;
  note: string | null;
  tags: string;
}

export interface ExportableDeck {
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
}

const CSV_COLUMNS = [
  "word",
  "meaning",
  "partOfSpeech",
  "phonetic",
  "example",
  "exampleTranslation",
  "note",
  "tags",
] as const;

function escapeCsvField(value: string | null | undefined): string {
  const v = value ?? "";
  if (v === "") return "";
  if (/[",\r\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function toCsv(cards: readonly ExportableCard[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = cards.map((c) => {
    const tags = parseTags(c.tags).join(";");
    return [
      escapeCsvField(c.word),
      escapeCsvField(c.meaning),
      escapeCsvField(c.partOfSpeech),
      escapeCsvField(c.phonetic),
      escapeCsvField(c.example),
      escapeCsvField(c.exampleTranslation),
      escapeCsvField(c.note),
      escapeCsvField(tags),
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

export interface JsonExportShape {
  deck: ExportableDeck;
  cards: Array<{
    word: string;
    meaning: string;
    partOfSpeech: string | null;
    phonetic: string | null;
    example: string | null;
    exampleTranslation: string | null;
    note: string | null;
    tags: string[];
  }>;
}

export function toJson(deck: ExportableDeck, cards: readonly ExportableCard[]): JsonExportShape {
  return {
    deck: {
      name: deck.name,
      description: deck.description,
      color: deck.color,
      icon: deck.icon,
    },
    cards: cards.map((c) => ({
      word: c.word,
      meaning: c.meaning,
      partOfSpeech: c.partOfSpeech,
      phonetic: c.phonetic,
      example: c.example,
      exampleTranslation: c.exampleTranslation,
      note: c.note,
      tags: parseTags(c.tags),
    })),
  };
}

export function safeFilename(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "deck"
  );
}
