"use client";

import { Sprout } from "lucide-react";
import { cn, displayRootWord, parseTags, posBadgeClass } from "@/lib/utils";
import { parseWordForms, parseWordFormMeanings, WORD_FORM_ORDER } from "@/lib/word-forms";
import { CardExamples } from "@/components/deck/card-examples";
import { DialectBadge } from "@/components/deck/dialect-badge";
import type { Card } from "@/lib/types";

interface MailBodyProps {
  card: Card;
}

/** Thân "mail": nghĩa, từ gốc, câu ví dụ, đồng/trái nghĩa, dạng từ, ghi chú. */
export function MailBody({ card }: MailBodyProps) {
  const synonyms = parseTags(card.synonyms);
  const antonyms = parseTags(card.antonyms);
  const tags = parseTags(card.tags);
  const root = displayRootWord(card.word, card.rootWord);
  const forms = parseWordForms(card.wordForms);
  const formMeanings = parseWordFormMeanings(card.wordFormMeanings);
  const formRows = WORD_FORM_ORDER.filter((pos) => forms[pos]);

  return (
    <div className="space-y-5 text-sm leading-relaxed">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-lg">{card.meaning}</p>
        {card.partOfSpeech ? (
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", posBadgeClass(card.partOfSpeech))}>
            {card.partOfSpeech}
          </span>
        ) : null}
      </div>

      <DialectBadge dialect={card.dialect} variantWord={card.variantWord} variant="full" />

      {root ? (
        <p className="flex flex-wrap items-center gap-1.5">
          <Sprout className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Từ gốc:</span>
          <b>{root}</b>
          {card.rootWordMeaning ? <span className="text-muted-foreground">— {card.rootWordMeaning}</span> : null}
        </p>
      ) : null}

      <CardExamples card={card} />

      {synonyms.length > 0 ? (
        <p>
          <span className="font-medium text-[#188038]">≈ Đồng nghĩa: </span>
          <span className="text-muted-foreground">{synonyms.join(", ")}</span>
        </p>
      ) : null}
      {antonyms.length > 0 ? (
        <p>
          <span className="font-medium text-destructive">↔ Trái nghĩa: </span>
          <span className="text-muted-foreground">{antonyms.join(", ")}</span>
        </p>
      ) : null}

      {formRows.length > 0 ? (
        <div className="max-w-md overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              {formRows.map((pos) => (
                <tr key={pos} className="border-b last:border-b-0">
                  <td className="w-24 bg-muted px-3 py-1.5 text-xs uppercase text-muted-foreground">{pos}</td>
                  <td className="px-3 py-1.5 font-medium">{forms[pos]}</td>
                  <td className="px-3 py-1.5 text-muted-foreground">{formMeanings[pos] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {card.note ? (
        <blockquote className="border-l-2 pl-3 text-muted-foreground">{card.note}</blockquote>
      ) : null}

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded bg-foreground/[.08] px-1.5 py-px text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
