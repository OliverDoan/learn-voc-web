"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Quản lý chế độ toàn màn hình thật của trình duyệt (Fullscreen API),
 * giúp ẩn cả thanh địa chỉ/tab. Trả về trạng thái và hàm bật/tắt.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error("Không thể bật toàn màn hình:", error);
    }
  }, []);

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch (error) {
      console.error("Không thể thoát toàn màn hình:", error);
    }
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void exit();
    } else {
      void enter();
    }
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
