import { cn } from "@/lib/utils";

interface StoryProseProps {
  text: string;
  className?: string;
  /** Ghi đè style gốc — dùng cho cỡ chữ tuỳ chỉnh ở chế độ đọc toàn màn hình. */
  style?: React.CSSProperties;
}

/**
 * Hiển thị truyện dạng văn xuôi thuần (full tiếng Việt hoặc full tiếng Anh),
 * dùng cùng kiểu chữ với StoryRenderer để giao diện đồng nhất.
 */
export function StoryProse({ text, className, style }: StoryProseProps) {
  return (
    <div
      className={cn(
        "font-serif whitespace-pre-wrap text-[19px] leading-[2] text-[#252525] dark:text-foreground",
        className,
      )}
      style={style}
    >
      {text}
    </div>
  );
}
