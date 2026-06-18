"use client";

import { use } from "react";
import Link from "next/link";
import { GrammarTopicView } from "@/components/grammar/grammar-topic-view";
import { getGrammarTopic } from "@/lib/grammar";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function GrammarTopicPage({ params }: PageProps) {
  const { topicId } = use(params);
  const topic = getGrammarTopic(topicId);

  if (!topic) {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <p className="mb-2">Không tìm thấy chủ đề ngữ pháp này.</p>
        <Link href="/grammar" className="text-primary underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return <GrammarTopicView topic={topic} />;
}
