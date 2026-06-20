"use client";

import { Info, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { speak } from "@/lib/tts";
import type { DictionaryResult } from "@/lib/dictionary";
import { AddToDeckPanel } from "./add-to-deck-panel";

interface WordResultProps {
  result: DictionaryResult;
  /** Tên các deck đã chứa từ này (nếu có). */
  existingDeckNames: string[];
}

export function WordResult({ result, existingDeckNames }: WordResultProps) {
  const playAudio = () => {
    if (result.audioUrl) {
      const audio = new Audio(result.audioUrl);
      audio.play().catch(() => speak(result.word));
    } else {
      speak(result.word);
    }
  };

  const isNew = existingDeckNames.length === 0;

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-5">
      {/* Tiêu đề từ */}
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold">{result.word}</h2>
        {result.phonetic && (
          <span className="font-phonetic text-muted-foreground">{result.phonetic}</span>
        )}
        <button
          type="button"
          onClick={playAudio}
          aria-label="Phát âm"
          className="rounded-full p-2 text-primary transition-colors hover:bg-primary/10"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      {/* Trạng thái: mới hoàn toàn hay đã có trong deck */}
      {isNew ? (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <Info className="h-4 w-4" />
          Từ mới — chưa có trong deck nào. Thêm vào deck bên dưới để học.
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          <Info className="h-4 w-4" />
          Từ này đã có trong: {existingDeckNames.join(", ")}
        </div>
      )}

      {/* Các nghĩa */}
      <div className="space-y-4">
        {result.meanings.map((meaning, i) => (
          <div key={`${meaning.partOfSpeech}-${i}`} className="space-y-2">
            <Badge variant="secondary" className="italic">
              {meaning.partOfSpeech}
            </Badge>
            <ol className="ml-1 space-y-2">
              {meaning.definitions.map((def, j) => (
                <li key={j} className="text-sm">
                  <span>{def.definition}</span>
                  {def.example && (
                    <p className="mt-0.5 text-muted-foreground italic">
                      &ldquo;{def.example}&rdquo;
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Đồng nghĩa / trái nghĩa */}
      {(result.synonyms.length > 0 || result.antonyms.length > 0) && (
        <div className="space-y-2 text-sm">
          {result.synonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground">Đồng nghĩa:</span>
              {result.synonyms.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          )}
          {result.antonyms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground">Trái nghĩa:</span>
              {result.antonyms.map((a) => (
                <Badge key={a} variant="outline">
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <AddToDeckPanel result={result} />
    </div>
  );
}
