"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, Inbox, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sheetSpring } from "@/lib/motion";
import { uz } from "@/lib/uz";
import { useBottomSheetDrag } from "@/components/ui/use-bottom-sheet-drag";

type DetailPanelMode = "drawer" | "sheet";

type DetailPanelProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  mode?: DetailPanelMode;
  zIndex?: string;
  backLabel?: string;
  showBack?: boolean;
  showClose?: boolean;
  centerTitle?: boolean;
  headerTrailing?: ReactNode;
  compactSheet?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  onExitComplete?: () => void;
};

export function DetailPanel({
  open,
  title,
  subtitle,
  icon: Icon,
  mode = "drawer",
  zIndex = "z-50",
  backLabel = uz.common.back,
  showBack = true,
  showClose = false,
  centerTitle = false,
  headerTrailing,
  compactSheet = false,
  footer,
  children,
  onClose,
  onExitComplete,
}: DetailPanelProps) {
  const { dragControls, handleDragEnd, startDrag } = useBottomSheetDrag(onClose);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, [open]);

  const panelClass =
    mode === "sheet"
      ? compactSheet
        ? "absolute inset-x-0 bottom-0 mx-auto flex max-h-[calc(68vh+10px)] max-w-md flex-col overflow-hidden rounded-t-[34px] border border-white/[0.06] bg-[#11162A]"
        : "absolute inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+44px)] mx-auto flex max-w-md flex-col overflow-hidden rounded-t-[34px] border border-white/[0.06] bg-[#11162A]"
      : "absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden border-l border-white/[0.06] bg-[#11162A]";

  const initial = mode === "sheet" ? { y: "100%" } : { x: "100%" };
  const animate = mode === "sheet" ? { y: 0 } : { x: 0 };
  const exit = mode === "sheet" ? { y: "100%" } : { x: "100%" };

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          className={`plans-overlay pointer-events-auto fixed inset-0 ${zIndex}`}
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.01 }}
        >
          <motion.button
            type="button"
            aria-label={`${title} oynasini yopish`}
            className="absolute inset-0 touch-manipulation bg-black/64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
          />

          <motion.aside
            className={panelClass}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={sheetSpring}
            drag={mode === "sheet" ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {mode === "sheet" ? (
              <button
                type="button"
                className="flex w-full shrink-0 touch-none justify-center pb-1 pt-3"
                onPointerDown={startDrag}
                style={{ touchAction: "none" }}
                aria-label="Pastga surib yopish"
              >
                <span className="h-1.5 w-12 rounded-full bg-white/18" />
              </button>
            ) : null}

            <header className={`sticky top-0 z-10 border-b border-white/[0.06] bg-[#11162A] px-4 pb-3 ${mode === "sheet" ? "pt-3" : "pt-[calc(env(safe-area-inset-top)+1rem)]"}`}>
              <div
                className={
                  centerTitle
                    ? "relative flex min-h-11 items-center justify-center"
                    : "flex items-start justify-between gap-4"
                }
              >
                <div
                  className={
                    centerTitle
                      ? "flex min-w-0 items-center justify-center text-center"
                      : "flex min-w-0 items-center gap-3"
                  }
                >
                  {Icon ? (
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100 ${
                        centerTitle
                          ? "absolute left-0 top-1/2 -translate-y-1/2"
                          : ""
                      }`}
                    >
                      <Icon size={19} />
                    </span>
                  ) : null}
                  <div className={`min-w-0 ${centerTitle ? "px-16" : ""}`}>
                    <h2 className="truncate text-2xl font-black text-white">{title}</h2>
                    {subtitle ? <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{subtitle}</p> : null}
                  </div>
                </div>
                {mode === "drawer" || showClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/12 bg-white/[0.045] text-slate-300 transition duration-300 active:scale-95 ${
                      centerTitle
                        ? `absolute top-1/2 -translate-y-1/2 ${
                            showClose ? "left-0" : "right-0"
                          }`
                        : ""
                    }`}
                    aria-label={uz.common.close}
                  >
                    <X size={18} />
                  </button>
                ) : null}
                {headerTrailing ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    {headerTrailing}
                  </div>
                ) : null}
              </div>

              {showBack ? (
                <button type="button" onClick={onClose} className="mt-3 flex items-center gap-2 text-sm font-black text-violet-100/80">
                  <ChevronLeft size={17} />
                  {backLabel}
                </button>
              ) : null}
            </header>

            <div className="flex-1 overscroll-contain overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              {children}
            </div>

            {footer ? (
              <div className="border-t border-white/[0.06] bg-[#11162A] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PanelEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  compact = false,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[24px] border border-violet-200/10 bg-white/[0.025] text-center ${compact ? "min-h-20 p-4" : "min-h-52 p-6"}`}>
      <Icon size={compact ? 18 : 22} className="text-violet-100/70" />
      <p className={`${compact ? "mt-2 text-xs" : "mt-3 text-sm"} font-black text-white`}>{title}</p>
      {description ? <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-500">{description}</p> : null}
    </div>
  );
}

export function PanelLoadingState({
  title = uz.common.loading,
  rows = 3,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <div className="rounded-[24px] border border-violet-200/10 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-9 w-9 animate-pulse rounded-2xl border border-violet-200/10 bg-violet-400/10" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">{title}</p>
          <span className="mt-2 block h-2 w-28 animate-pulse rounded-full bg-violet-100/10" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <span key={index} className="block h-10 animate-pulse rounded-[18px] border border-violet-200/5 bg-white/[0.035]" />
        ))}
      </div>
    </div>
  );
}
