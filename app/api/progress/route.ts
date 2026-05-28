import { handleError, ok } from "@/lib/api-helpers";
import { getUserProgress, updateUserProgress } from "@/lib/progress-service";
import { progressUpdateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const progress = await getUserProgress();
    return ok(progress);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = progressUpdateSchema.parse(body);
    const updated = await updateUserProgress(parsed);
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
