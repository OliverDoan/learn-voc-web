"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { BookText } from "lucide-react";
import { grammarChaptersWithTopics } from "@/lib/grammar";

export default function GrammarPage() {
  const router = useRouter();
  const chapters = grammarChaptersWithTopics();

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookText className="h-6 w-6 text-primary" /> Ngữ pháp
        </h1>
        <p className="text-sm text-muted-foreground">
          Toàn bộ ngữ pháp tiếng Anh theo thứ tự 20 chương — mỗi chủ đề gồm lý thuyết, công
          thức, ví dụ và bảng tổng hợp.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="w-44 px-4 py-2.5 font-semibold">Chương</th>
                <th className="px-4 py-2.5 font-semibold">Chủ đề</th>
                <th className="hidden px-4 py-2.5 font-semibold md:table-cell">Mô tả</th>
                <th className="w-16 px-4 py-2.5 text-center font-semibold">Mục</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map(({ chapter, topics }) => (
                <Fragment key={chapter.num}>
                  {topics.map((topic, i) => (
                    <tr
                      key={topic.id}
                      onClick={() => router.push(`/grammar/${topic.id}`)}
                      className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/40"
                    >
                      {i === 0 ? (
                        <td
                          rowSpan={topics.length}
                          className="border-r bg-muted/20 px-4 py-3 align-top"
                        >
                          <div className="flex items-start gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                              {chapter.num}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold leading-snug">{chapter.titleVi}</div>
                              <div className="text-xs text-muted-foreground">{chapter.title}</div>
                            </div>
                          </div>
                        </td>
                      ) : null}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{topic.icon}</span>
                          <div className="min-w-0">
                            <div className="font-medium leading-snug">{topic.nameVi}</div>
                            <div className="text-xs text-muted-foreground">{topic.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                        <span className="line-clamp-2">{topic.summary}</span>
                      </td>
                      <td className="px-4 py-3 text-center align-top text-muted-foreground">
                        {topic.rules.length}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
