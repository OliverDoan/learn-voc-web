import { handleError, ok } from "@/lib/api-helpers";
import { resetAllProgress, resetDeckLearnedStatus } from "@/lib/reset-service";
import { progressResetSchema } from "@/lib/schemas";

/**
 * Đặt lại dữ liệu học.
 * - `scope: "learned"` → chỉ bỏ đánh dấu "đã học xong" ở mọi deck.
 * - `scope: "all"` → xoá toàn bộ lịch sử, tiến độ SRS, yêu thích, chuỗi, huy hiệu.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scope } = progressResetSchema.parse(body);

    if (scope === "learned") {
      const decksUnlearned = await resetDeckLearnedStatus();
      return ok({ scope, decksUnlearned });
    }

    const summary = await resetAllProgress();
    return ok({ scope, ...summary });
  } catch (error) {
    return handleError(error);
  }
}
