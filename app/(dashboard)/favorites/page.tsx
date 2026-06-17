"use client";

import Link from "next/link";
import { Loader2, Star, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites, useToggleFavorite } from "@/hooks/use-cards";
import { speak } from "@/lib/tts";
import type { FavoriteCard } from "@/hooks/use-cards";

export default function FavoritesPage() {
  const { data: cards, isLoading } = useFavorites();
  const toggleFavoriteMut = useToggleFavorite();

  const handleUnfavorite = async (card: FavoriteCard) => {
    try {
      await toggleFavoriteMut.mutateAsync({ cardId: card.id, favorite: false });
      toast.success("Đã bỏ yêu thích");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Star className="h-6 w-6 fill-amber-400 text-amber-400" /> Từ yêu thích
        </h1>
        <p className="text-sm text-muted-foreground">
          Những từ bạn đã đánh dấu sao — gom từ tất cả các deck.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !cards || cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Star className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Chưa có từ yêu thích</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Nhấn vào icon ngôi sao ở danh sách từ trong mỗi deck để thêm vào đây.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{cards.length} từ</p>
          <ul className="space-y-2 pb-24">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0"
                  onClick={() => speak(card.word)}
                  aria-label="Phát âm"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold">{card.word}</span>
                    {card.phonetic ? (
                      <span className="font-phonetic text-xs text-muted-foreground">
                        {card.phonetic}
                      </span>
                    ) : null}
                    {card.partOfSpeech ? (
                      <Badge variant="outline" className="text-xs">
                        {card.partOfSpeech}
                      </Badge>
                    ) : null}
                    <Link href={`/decks/${card.deck.id}`}>
                      <Badge
                        variant="secondary"
                        className="text-xs transition-colors hover:bg-secondary/70"
                      >
                        {card.deck.icon ?? "📘"} {card.deck.name}
                      </Badge>
                    </Link>
                  </div>
                  <p className="mt-1 text-sm">{card.meaning}</p>
                  {card.example ? (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      &ldquo;{card.example}&rdquo;
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 shrink-0"
                  onClick={() => handleUnfavorite(card)}
                  aria-label="Bỏ yêu thích"
                  title="Bỏ yêu thích"
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
