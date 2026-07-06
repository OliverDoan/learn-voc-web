import { cn } from "@/lib/utils";

interface StoryProseProps {
  text: string;
  className?: string;
}

/**
 * Hiển thị truyện dạng văn xuôi thuần (full tiếng Việt hoặc full tiếng Anh),
 * dùng cùng kiểu chữ với StoryRenderer để giao diện đồng nhất.
 */
export function StoryProse({ text, className }: StoryProseProps) {
  return (
    <div
      className={cn(
        "font-serif whitespace-pre-wrap text-[19px] leading-[2] text-[#252525] dark:text-foreground",
        className,
      )}
    >
      {text}
    </div>
  );
}
