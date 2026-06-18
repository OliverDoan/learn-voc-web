"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Đồng hồ thời gian thực + ngày tháng tiếng Việt. */
export function ClockDisplay() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const raf = requestAnimationFrame(update); // giá trị đầu, sau lần paint
    const id = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="font-sans text-[18vw] font-bold leading-none tabular-nums tracking-tight md:text-[15vw]">
        {now ? format(now, "HH:mm") : "--:--"}
      </div>
      <div className="mt-4 text-base font-semibold text-muted-foreground md:text-2xl">
        {now ? capitalize(format(now, "EEEE, d MMMM, yyyy", { locale: vi })) : " "}
      </div>
    </div>
  );
}
