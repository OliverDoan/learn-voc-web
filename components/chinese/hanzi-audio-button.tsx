"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHINESE_TTS_LANG } from "@/lib/chinese";
import { isSpeakable, speak } from "@/lib/tts";
import { cn } from "@/lib/utils";

interface HanziAudioButtonProps {
  text: string;
  /** Tốc độ đọc — chữ đơn nên chậm hơn câu để nghe rõ thanh điệu */
  rate?: number;
  label?: string;
  className?: string;
  size?: "sm" | "icon";
}

/** Nút phát âm tiếng Trung (giọng zh-CN) — dùng chung cho mọi màn hình tiếng Trung. */
export function HanziAudioButton({
  text,
  rate = 0.85,
  label = "Phát âm",
  className,
  size = "icon",
}: HanziAudioButtonProps) {
  if (!isSpeakable(text)) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={cn("shrink-0", className)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak(text, CHINESE_TTS_LANG, rate);
      }}
      aria-label={label}
      title={label}
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}
