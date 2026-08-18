import { handleError, ok } from "@/lib/api-helpers";
import { syncAchievements } from "@/lib/achievement-service";

/**
 * Trả về huy hiệu đã mở khoá + số liệu hiện tại. Mỗi lần gọi cũng xét lại điều
 * kiện và ghi nhận huy hiệu mới (rẻ, chỉ vài count query).
 */
export async function GET() {
  try {
    const result = await syncAchievements();
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
