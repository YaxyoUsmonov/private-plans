"use client";

import { X } from "lucide-react";

type DetailSheetHeaderProps = {
  title: string;
  onClose: () => void;
  onShare?: () => void;
};

export function DetailSheetHeader({
  title,
  onClose,
  onShare,
}: DetailSheetHeaderProps) {
  return (
    <div className="relative flex min-h-11 items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.045] text-white transition duration-300 active:scale-95"
        aria-label="Yopish"
      >
        <X size={18} />
      </button>

      <h2 className="w-full truncate px-[86px] text-center text-xl font-black text-white">
        {title}
      </h2>

      <button
        type="button"
        onClick={onShare}
        className="absolute right-0 top-1/2 h-9 -translate-y-1/2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-black text-white transition duration-300 active:scale-95"
      >
        Ulashish
      </button>
    </div>
  );
}
