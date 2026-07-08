"use client";

import { cn } from "@/lib/utils";
import {
  DIALECT_LABEL,
  DIALECT_SHORT,
  OTHER_DIALECT,
  type Dialect,
} from "@/lib/dialect-data";

interface DialectBadgeProps {
  dialect: string | null;
  variantWord: string | null;
  // "chip" = badge nhỏ gọn (list); "full" = có thêm dòng từ tương đương (chi tiết)
  variant?: "chip" | "full";
  className?: string;
}

function isDialect(v: string | null): v is Dialect {
  return v === "british" || v === "american";
}

/**
 * Hiển thị biến thể Anh–Anh / Anh–Mỹ của một từ.
 * - chip: chỉ badge ngắn (🇬🇧 BrE)
 * - full: badge + "🇺🇸 Anh–Mỹ: center"
 */
export function DialectBadge({
  dialect,
  variantWord,
  variant = "chip",
  className,
}: DialectBadgeProps) {
  if (!isDialect(dialect)) return null;

  const other = OTHER_DIALECT[dialect];
  const isBritish = dialect === "british";

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        isBritish
          ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300"
          : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
      )}
      title={`Biến thể ${DIALECT_LABEL[dialect]}`}
    >
      {DIALECT_SHORT[dialect]}
    </span>
  );

  if (variant === "chip") {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
        {badge}
        {/* Chip từ tương đương ở biến thể còn lại (vd flat → 🇺🇸 apartment) */}
        {variantWord ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              isBritish
                ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
                : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
            )}
            title={`Từ tương đương ${DIALECT_LABEL[other]}`}
          >
            {DIALECT_SHORT[other].split(" ")[0]} {variantWord}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      {badge}
      {variantWord ? (
        <span className="text-muted-foreground">
          {DIALECT_SHORT[other]} {DIALECT_LABEL[other]}:{" "}
          <span className="font-medium text-foreground">{variantWord}</span>
        </span>
      ) : null}
    </div>
  );
}
