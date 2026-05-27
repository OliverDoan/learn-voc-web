import { handleError, ok } from "@/lib/api-helpers";
import { getUserProgress } from "@/lib/progress-service";

export async function GET() {
  try {
    const progress = await getUserProgress();
    return ok(progress);
  } catch (error) {
    return handleError(error);
  }
}
