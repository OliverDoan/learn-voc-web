import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleDeck = {
  name: "Daily Life",
  description: "Từ vựng tiếng Anh trong cuộc sống hàng ngày",
  color: "#3b82f6",
  icon: "🏡",
};

const sampleCards = [
  {
    word: "wake up",
    meaning: "thức dậy",
    partOfSpeech: "phrasal verb",
    phonetic: "/weɪk ʌp/",
    example: "I wake up at 6 AM every day.",
    exampleTranslation: "Tôi thức dậy lúc 6 giờ sáng mỗi ngày.",
  },
  {
    word: "exhausted",
    meaning: "kiệt sức",
    partOfSpeech: "adjective",
    phonetic: "/ɪɡˈzɔː.stɪd/",
    example: "I feel exhausted after working out.",
    exampleTranslation: "Tôi cảm thấy kiệt sức sau khi tập thể dục.",
  },
  {
    word: "hiking",
    meaning: "leo núi",
    partOfSpeech: "noun",
    phonetic: "/ˈhaɪ.kɪŋ/",
    example: "We went hiking last weekend.",
    exampleTranslation: "Chúng tôi đi leo núi cuối tuần trước.",
  },
  {
    word: "coffee",
    meaning: "cà phê",
    partOfSpeech: "noun",
    phonetic: "/ˈkɒf.i/",
    example: "She drinks coffee every morning.",
    exampleTranslation: "Cô ấy uống cà phê mỗi sáng.",
  },
  {
    word: "balcony",
    meaning: "ban công",
    partOfSpeech: "noun",
    phonetic: "/ˈbæl.kə.ni/",
    example: "We sat on the balcony to watch the sunrise.",
    exampleTranslation: "Chúng tôi ngồi trên ban công ngắm bình minh.",
  },
  {
    word: "commute",
    meaning: "đi làm hàng ngày",
    partOfSpeech: "verb",
    phonetic: "/kəˈmjuːt/",
    example: "I commute by bike.",
    exampleTranslation: "Tôi đi làm bằng xe đạp.",
  },
];

const sampleStory = {
  title: "Buổi sáng yên bình",
  content: `Sáng nay tôi [[wake up|thức dậy]] lúc 6 giờ, cảm thấy hơi [[exhausted|kiệt sức]] vì hôm qua đi [[hiking|leo núi]] với bạn. Tôi quyết định pha một ly [[coffee|cà phê]] và ngồi ngoài [[balcony|ban công]] ngắm bình minh.

Hôm nay là thứ Hai, tôi cần [[commute|đi làm]] đúng giờ.`,
};

async function main() {
  console.log("🌱 Seeding database...");

  const existing = await prisma.deck.findFirst({ where: { name: sampleDeck.name } });
  if (existing) {
    console.log(`⏭️  Deck "${sampleDeck.name}" already exists, skipping.`);
    return;
  }

  const deck = await prisma.deck.create({ data: sampleDeck });
  console.log(`✅ Created deck: ${deck.name}`);

  for (const c of sampleCards) {
    await prisma.card.create({ data: { ...c, deckId: deck.id, tags: "[]" } });
  }
  console.log(`✅ Created ${sampleCards.length} cards`);

  const cards = await prisma.card.findMany({ where: { deckId: deck.id } });
  const wordMap = new Map(cards.map((c) => [c.word.toLowerCase(), c]));

  const storyCardLinks = ["wake up", "exhausted", "hiking", "coffee", "balcony", "commute"]
    .map((w, idx) => {
      const c = wordMap.get(w);
      return c ? { cardId: c.id, order: idx } : null;
    })
    .filter((x): x is { cardId: string; order: number } => x !== null);

  await prisma.story.create({
    data: {
      deckId: deck.id,
      ...sampleStory,
      storyCards: { create: storyCardLinks },
    },
  });
  console.log(`✅ Created story: ${sampleStory.title}`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
