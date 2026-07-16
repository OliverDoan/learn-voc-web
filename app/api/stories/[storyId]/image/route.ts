import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ storyId: string }>;
}

/**
 * Phục vụ ảnh minh hoạ truyện dưới dạng file nhị phân, thay vì nhồi base64 vào
 * JSON danh sách (xem GET /api/stories). Ảnh lưu trong DB dạng data URL
 * (data:image/...;base64,...) — endpoint này giải mã và trả binary kèm cache dài
 * (URL đã có ?v=updatedAt nên đổi ảnh sẽ tự bust cache).
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { storyId } = await params;
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { imageUrl: true },
    });
    if (!story?.imageUrl) {
      return new Response(null, { status: 404 });
    }

    // Ảnh do người dùng dán URL ngoài (http...) — chuyển hướng sang URL đó.
    if (!story.imageUrl.startsWith("data:")) {
      return Response.redirect(story.imageUrl, 302);
    }

    const match = story.imageUrl.match(/^data:(.+?);base64,(.*)$/);
    if (!match) {
      return new Response(null, { status: 404 });
    }
    const [, mime, base64] = match;
    const buffer = Buffer.from(base64, "base64");

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buffer.length),
        // URL có ?v=updatedAt nên an toàn cache lâu dài (đổi ảnh -> đổi URL).
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
