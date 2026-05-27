import { NextRequest } from "next/server";
import { lookupWord } from "@/lib/dictionary";
import { fail, handleError, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const word = new URL(req.url).searchParams.get("word")?.trim();
    if (!word) return fail("Thiếu tham số 'word'", 400);
    const result = await lookupWord(word);
    if (!result) return fail("Không tìm thấy từ trong từ điển", 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
