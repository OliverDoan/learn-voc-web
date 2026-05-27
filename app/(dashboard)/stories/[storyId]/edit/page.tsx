"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StoryEditor } from "@/components/story/story-editor";
import { useStory } from "@/hooks/use-stories";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default function EditStoryPage({ params }: PageProps) {
  const { storyId } = use(params);
  const router = useRouter();
  const { data: story, isLoading } = useStory(storyId);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!story) return <div className="p-6">Không tìm thấy truyện</div>;

  return (
    <StoryEditor
      deckId={story.deckId}
      story={story}
      onDone={() => router.push(`/stories/${storyId}`)}
      onCancel={() => router.back()}
    />
  );
}
