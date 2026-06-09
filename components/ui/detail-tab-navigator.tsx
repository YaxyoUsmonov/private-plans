"use client";

import { motion } from "framer-motion";
import { sheetSpring } from "@/lib/motion";

type DetailTabNavigatorProps<T extends string> = {
  pages: readonly T[];
  pageIndex: number;
  onChange: (index: number) => void;
};

export function DetailTabNavigator<T extends string>({ pages, pageIndex, onChange }: DetailTabNavigatorProps<T>) {
  return (
    <div className="rounded-full border border-violet-200/14 bg-[#11162A] p-1">
      <div className="relative grid gap-1" style={{ gridTemplateColumns: `repeat(${pages.length}, minmax(0, 1fr))` }}>
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full border border-[#7F00FF]/25 bg-[#3A025B]"
          animate={{ x: `${pageIndex * 100}%` }}
          transition={sheetSpring}
          style={{ width: `${100 / pages.length}%` }}
        />
        {pages.map((page, index) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange(index)}
            className={`relative z-10 h-10 rounded-full px-2 text-center text-[11px] font-black transition duration-300 ${
              index === pageIndex ? "text-white" : "text-slate-500"
            }`}
            aria-label={page}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
