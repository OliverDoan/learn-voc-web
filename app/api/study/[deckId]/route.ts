import { NextRequest } from "next/server";
import { handleError, ok } from "@/lib/api-helpers";
import { getReviewQueue } from "@/lib/daily-queue";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

const MAX_SUBSET = 500;

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids")?.trim();

    if (idsParam) {
      const cardIds = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, MAX_SUBSET);
      const queue = await getReviewQueue(deckId, { cardIds });
      return ok(queue);
    }

    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const queue = await getReviewQueue(deckId, {
      newCardLimit: Number.isFinite(limit) ? limit : undefined,
    });
    return ok(queue);
  } catch (error) {
    return handleError(error);
  }
}
