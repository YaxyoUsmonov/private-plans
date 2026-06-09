"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { generateYearDates } from "@/lib/date-utils";

type DateStripProps = {
  selectedDate: string;
  onSelect: (date: string) => void;
};

export function DateStrip({ selectedDate, onSelect }: DateStripProps) {
  const [mountedYear, setMountedYear] = useState<number | null>(null);
  const didAutoScroll = useRef(false);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());

  const dates = useMemo(() => (mountedYear ? generateYearDates(mountedYear, "uz") : []), [mountedYear]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMountedYear(new Date().getFullYear());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedDate || didAutoScroll.current) {
      return;
    }

    const selectedElement = itemRefs.current.get(selectedDate);

    if (!selectedElement) {
      return;
    }

    selectedElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });
    didAutoScroll.current = true;
  }, [dates, selectedDate]);

  if (!mountedYear) {
    return (
      <div className="overflow-hidden border-y border-white/10 py-3">
        <div className="grid grid-flow-col auto-cols-[calc((100%-24px)/7)] gap-1 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <span
              key={index}
              className="aspect-square w-full rounded-full border border-violet-200/10 bg-white/[0.035]"
              aria-hidden
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border-y border-white/10 py-3">
      <div className="grid grid-flow-col auto-cols-[calc((100%-24px)/7)] gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dates.map((item) => {
          const selected = item.key === selectedDate;

          return (
            <motion.button
              key={item.key}
              ref={(node) => {
                if (node) {
                  itemRefs.current.set(item.key, node);
                } else {
                  itemRefs.current.delete(item.key);
                }
              }}
              type="button"
              onClick={() => onSelect(item.key)}
              aria-label={`${item.month} ${item.day}, ${item.weekday}`}
              animate={selected ? { scale: 1.04 } : { scale: 1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-full border border-violet-200/10 bg-white/[0.035] text-center transition duration-300 active:scale-[0.96]"
            >
              {selected ? (
                <motion.span
                  layoutId="selected-date"
                  className="pointer-events-none absolute inset-0 rounded-full border border-[#7F00FF]/25 bg-[#3A025B] shadow-[0_14px_42px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.16)]"
                  transition={{ duration: 0.32, ease: "easeOut" }}
                />
              ) : null}
              <span className={`relative text-[8px] font-bold uppercase tracking-[0.03em] ${selected ? "text-white" : "text-slate-500"}`}>
                {item.weekday}
              </span>
              <span className={`relative text-sm font-black ${selected ? "text-white" : "text-slate-300"}`}>
                {item.day}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
