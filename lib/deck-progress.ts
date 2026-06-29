import { prisma } from "./db";

/** Lấy số thứ tự Unit từ tên deck ("Unit 10: ..." → 10); không có → null. */
export function getDeckUnitNumber(name: string): number | null {
  const match = name.match(/unit\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

/** Thông tin tối thiểu để tính trạng thái khóa/mở. */
export interface DeckLockInput {
  id: string;
  name: string;
  learnedAt: Date | string | null;
}

export interface DeckLockStatus {
  learned: boolean;
  locked: boolean;
}

/**
 * Tính trạng thái khóa tuần tự kiểu Duolingo cho từng deck.
 *
 * - `learned`: đã đánh dấu học xong (`learnedAt != null`).
 * - `locked`: deck có số Unit nhưng tồn tại một Unit nhỏ hơn CHƯA học xong.
 * - Deck không có số Unit: luôn mở khóa (không nằm trong chuỗi tuần tự).
 *
 * Khóa được SUY DIỄN hoàn toàn từ `learnedAt` nên bỏ đánh dấu một deck sẽ tự khóa lại các deck sau.
 */
export function computeDeckLockStatus(decks: readonly DeckLockInput[]): Map<string, DeckLockStatus> {
  const result = new Map<string, DeckLockStatus>();

  // Các deck có số Unit, sắp theo Unit tăng dần để duyệt tuần tự.
  const unitDecks = decks
    .map((d) => ({ deck: d, unit: getDeckUnitNumber(d.name) }))
    .filter((x): x is { deck: DeckLockInput; unit: number } => x.unit !== null)
    .sort((a, b) => a.unit - b.unit);

  let allPriorLearned = true;
  for (const { deck } of unitDecks) {
    const learned = deck.learnedAt != null;
    // Mở khóa nếu mọi Unit trước đã học xong.
    result.set(deck.id, { learned, locked: !allPriorLearned });
    if (!learned) allPriorLearned = false;
  }

  // Deck không có số Unit: luôn mở khóa.
  for (const d of decks) {
    if (!result.has(d.id)) {
      result.set(d.id, { learned: d.learnedAt != null, locked: false });
    }
  }

  return result;
}

/**
 * (Server) Kiểm tra một deck có đang mở khóa để Học/Quiz không.
 * Tải tất cả deck chưa xoá để xác định chuỗi Unit.
 */
export async function isDeckUnlocked(deckId: string): Promise<boolean> {
  const decks = await prisma.deck.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, learnedAt: true },
  });
  const status = computeDeckLockStatus(decks).get(deckId);
  // Không tìm thấy (deck mới/khác) → coi như mở khóa để không chặn nhầm.
  return status ? !status.locked : true;
}
