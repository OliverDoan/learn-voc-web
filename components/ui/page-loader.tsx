import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageLoaderProps {
  /** Text hiển thị dưới spinner. Mặc định "Đang tải...". */
  label?: string;
  /** Class bổ sung cho container ngoài cùng. */
  className?: string;
  /** Chiếm toàn bộ chiều cao viewport thay vì vùng nội dung. */
  fullScreen?: boolean;
}

/**
 * Loading spinner căn giữa màn hình, dùng cho trạng thái tải toàn trang.
 */
export function PageLoader({ label = "Đang tải...", className, fullScreen = false }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        fullScreen ? "min-h-screen" : "min-h-[60vh]",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
