"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  src: string;
  alt: string;
  /** Class cho ảnh thu nhỏ (giữ nguyên kiểu hiển thị sẵn có). */
  className?: string;
  /** Class cho thẻ <img> bên trong. Mặc định crop (object-cover). */
  imgClassName?: string;
}

/**
 * Ảnh thu nhỏ; nhấn vào sẽ mở overlay xem ảnh phóng to.
 * Nhấn ra ngoài, nút X hoặc phím Esc để đóng.
 */
export function ImageLightbox({ src, alt, className, imgClassName }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Phóng to ảnh: ${alt}`}
        className={cn("group relative block cursor-zoom-in overflow-hidden", className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={cn("h-full w-full object-cover", imgClassName)} />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
          <ZoomIn className="h-7 w-7 text-white drop-shadow" />
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng"
            className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] max-w-[92vw] cursor-zoom-out rounded-lg object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </>
  );
}
