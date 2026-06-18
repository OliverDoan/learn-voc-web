import { handleError, ok } from "@/lib/api-helpers";
import { resetStreak } from "@/lib/progress-service";

export async function POST() {
  try {
    const updated = await resetStreak();
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
