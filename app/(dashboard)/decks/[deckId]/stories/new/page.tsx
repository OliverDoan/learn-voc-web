"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { StoryEditor } from "@/components/story/story-editor";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function NewStoryPage({ params }: PageProps) {
  const { deckId } = use(params);
  const router = useRouter();

  return (
    <StoryEditor
      deckId={deckId}
      onDone={(storyId) => router.push(`/stories/${storyId}`)}
      onCancel={() => router.back()}
    />
  );
}
