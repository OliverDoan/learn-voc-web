import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

interface RouteParams {
  params: Promise<{ storyId: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { storyId } = await params;
    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        readCount: { increment: 1 },
        lastReadAt: new Date(),
      },
    });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
