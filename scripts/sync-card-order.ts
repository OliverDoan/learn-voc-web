import { PrismaClient } from "@prisma/client";
import { extractWords } from "../lib/story-parser";

const prisma = new PrismaClient();

/**
 * Đồng bộ thứ tự thẻ trong mỗi deck theo thứ tự từ xuất hiện trong truyện chêm.
 *
 * Nguồn chuẩn là NỘI DUNG truyện (parse markup [[word|nghĩa]]) — không dựa vào
 * bảng StoryCard vì link có thể cũ/thiếu so với nội dung hiện tại.
 *
 * - Thẻ có trong truyện xếp trước theo đúng trật tự chêm (loại trùng, giữ lần đầu).
 * - Thẻ chưa được chêm vào truyện xếp sau, giữ thứ tự cũ (order, createdAt).
 * - Đồng thời dựng lại StoryCard cho khớp nội dung truyện.
 *
 * Nếu một deck có nhiều truyện, dùng truyện cũ nhất làm chuẩn sắp xếp.
 */
async function main() {
  const decks = await prisma.deck.findMany({
    where: { deletedAt: null },
    include: {
      cards: {
        where: { deletedAt: null },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, word: true },
      },
      stories: { orderBy: { createdAt: "asc" } },
    },
  });

  for (const deck of decks) {
    const story = deck.stories[0];
    if (!story) {
      console.log(`⏭️  "${deck.name}": không có truyện, bỏ qua`);
      continue;
    }

    const wordToCardId = new Map(deck.cards.map((c) => [c.word.trim().toLowerCase(), c.id]));

    // Thứ tự chuẩn = từ xuất hiện trong nội dung truyện, loại trùng (giữ lần đầu).
    const tokens = extractWords(story.content);
    const inStory: string[] = [];
    const inStorySet = new Set<string>();
    for (const t of tokens) {
      const cardId = wordToCardId.get(t.word.trim().toLowerCase());
      if (cardId && !inStorySet.has(cardId)) {
        inStorySet.add(cardId);
        inStory.push(cardId);
      }
    }

    const orderedCardIds = [
      ...inStory,
      ...deck.cards.map((c) => c.id).filter((id) => !inStorySet.has(id)),
    ];

    // Cập nhật order thẻ + dựng lại StoryCard cho khớp nội dung truyện.
    await prisma.$transaction([
      ...orderedCardIds.map((id, index) =>
        prisma.card.update({ where: { id }, data: { order: index } }),
      ),
      prisma.storyCard.deleteMany({ where: { storyId: story.id } }),
      ...inStory.map((cardId, index) =>
        prisma.storyCard.create({
          data: { storyId: story.id, cardId, order: index },
        }),
      ),
    ]);

    const missing = deck.cards.length - inStory.length;
    console.log(
      `✅ "${deck.name}": sắp xếp ${orderedCardIds.length} thẻ theo truyện "${story.title}"` +
        ` (chêm ${inStory.length}/${deck.cards.length}` +
        (missing ? `, ${missing} thẻ chưa có trong truyện` : "") +
        `)`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
