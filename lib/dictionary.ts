const BASE_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

export interface DictionaryDefinition {
  definition: string;
  example?: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: DictionaryMeaning[];
}

interface RawPhonetic {
  text?: string;
  audio?: string;
}

interface RawDefinition {
  definition: string;
  example?: string;
}

interface RawMeaning {
  partOfSpeech: string;
  definitions: RawDefinition[];
}

interface RawEntry {
  word: string;
  phonetic?: string;
  phonetics?: RawPhonetic[];
  meanings: RawMeaning[];
}

export async function lookupWord(word: string): Promise<DictionaryResult | null> {
  const trimmed = word.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(trimmed)}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RawEntry[] | { title?: string };
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const phonetic =
      entry.phonetic ??
      entry.phonetics?.find((p) => p.text)?.text;
    const audioUrl = entry.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio;

    return {
      word: entry.word,
      phonetic,
      audioUrl,
      meanings: entry.meanings.map((m) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: m.definitions.slice(0, 3).map((d) => ({
          definition: d.definition,
          example: d.example,
        })),
      })),
    };
  } catch {
    return null;
  }
}
