"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, CalendarDays, Flame, ListChecks, NotebookPen, Pencil, Plus, Target, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PanelEmptyState } from "@/components/ui/detail-panel";
import type { SystemListView } from "@/lib/mock-data";
import { sheetSpring } from "@/lib/motion";

type SystemDetailModalProps = {
  system: SystemListView | null;
  onClose: () => void;
};

const pages = ["Tizimlar", "Odatlar", "Maqsadlar"] as const;

export function SystemDetailModal({ system, onClose }: SystemDetailModalProps) {
  return (
    <AnimatePresence>
      {system ? <SystemDetailContent key={system.id} system={system} onClose={onClose} /> : null}
    </AnimatePresence>
  );
}

function SystemDetailContent({ system, onClose }: { system: SystemListView; onClose: () => void }) {
  const [pageIndex, setPageIndex] = useState(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef(false);
  const Icon = system.icon;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setPageIndex((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight") setPageIndex((current) => Math.min(pages.length - 1, current + 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const goNext = useCallback(() => setPageIndex((current) => Math.min(pages.length - 1, current + 1)), []);
  const goPrevious = useCallback(() => setPageIndex((current) => Math.max(0, current - 1)), []);
  const resolveSwipe = useCallback(
    (dx: number, dy: number) => {
      if (swipeHandledRef.current) return;
      if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.08) return;

      swipeHandledRef.current = true;
      if (dx < 0) goNext();
      if (dx > 0) goPrevious();
    },
    [goNext, goPrevious],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    swipeHandledRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      if (!start) return;

      resolveSwipe(event.clientX - start.x, event.clientY - start.y);
    },
    [resolveSwipe],
  );

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLElement>) => {
    pointerStartRef.current = null;
    swipeHandledRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    swipeHandledRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      const touch = event.changedTouches[0];
      if (!start || !touch) return;

      resolveSwipe(touch.clientX - start.x, touch.clientY - start.y);
    },
    [resolveSwipe],
  );

  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    swipeHandledRef.current = false;
  }, []);

  return (
    <motion.div className="plans-overlay pointer-events-auto fixed inset-0 z-[60]" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.01 }}>
      <motion.button
        type="button"
        aria-label="Tizim tafsilotini yopish"
        className="absolute inset-0 touch-manipulation bg-black/64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={onClose}
      />

      <motion.aside
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden border-l border-white/[0.06] bg-[#11162A]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={sheetSpring}
        onPointerDownCapture={handlePointerDown}
        onPointerUpCapture={handlePointerUp}
        onPointerCancelCapture={handlePointerCancel}
        onTouchStartCapture={handleTouchStart}
        onTouchEndCapture={handleTouchEnd}
        onTouchCancelCapture={handleTouchCancel}
        style={{ touchAction: "pan-y" }}
      >
        <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/14 bg-violet-400/12 text-violet-100">
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black text-white">{system.title}</h2>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-violet-100/65">{pages[pageIndex]}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full border border-violet-200/12 bg-violet-400/10 px-2.5 py-1 text-violet-100">{system.category}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200/12 bg-orange-400/10 px-2.5 py-1 text-orange-100">
                    <Flame size={13} className="icon-tone-warning" />
                    {system.streak} kun streak
                  </span>
                  <span className="rounded-full border border-emerald-200/12 bg-emerald-400/10 px-2.5 py-1 text-emerald-100">{system.status}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/12 bg-white/[0.045] text-slate-300 transition duration-300 active:scale-95"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
          {pages.map((page, index) => (
            <button
              key={page}
              type="button"
              onClick={() => setPageIndex(index)}
              className={`h-1.5 rounded-full transition duration-300 ${index === pageIndex ? "bg-violet-200" : "bg-white/10"}`}
              aria-label={page}
            />
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          <motion.div className="flex h-full" animate={{ x: `-${pageIndex * 100}%` }} transition={sheetSpring}>
            <DetailPage>
              <SystemOverviewPage system={system} />
            </DetailPage>
            <DetailPage>
              <RoutinesPage system={system} />
            </DetailPage>
            <DetailPage>
              <GoalsPage system={system} />
            </DetailPage>
          </motion.div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function DetailPage({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full shrink-0 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+18px)]">{children}</div>;
}

function SystemOverviewPage({ system }: { system: SystemListView }) {
  return (
    <div className="space-y-3">
      <DetailSection icon={ListChecks} title="Bugungi harakat">
        <p className="text-sm font-bold text-white">{system.todayAction}</p>
        <p className="mt-1 text-xs text-slate-500">Bugungi faol rutin yoki harakat.</p>
      </DetailSection>

      <DetailSection icon={CalendarDays} title="Jadval">
        <p className="text-sm font-bold text-white">{system.cadence}</p>
      </DetailSection>

      <DetailSection icon={NotebookPen} title="Izohlar / refleksiya">
        <PanelEmptyState title="Hali izohlar yo'q" description="Refleksiya yozilganda shu yerda ko'rinadi." compact />
      </DetailSection>

      <div className="grid grid-cols-3 gap-2 pt-2">
        {[
          { label: "Tizimni tahrirlash", icon: Pencil },
          { label: "Rutin qo'shish", icon: Plus },
          { label: "Arxivlash", icon: Archive },
        ].map((action) => {
          const ActionIcon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-2 text-center text-xs font-black text-slate-200 transition duration-300 active:scale-[0.98]"
            >
              <ActionIcon size={18} className="text-violet-100" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoutinesPage({ system }: { system: SystemListView }) {
  return (
    <div className="space-y-3">
      <DetailSection icon={ListChecks} title="Bugungi harakat">
        <p className="text-sm font-bold text-white">{system.todayAction}</p>
        <p className="mt-1 text-xs text-slate-500">Daily action root canonical System[] ichidagi dailyActions’dan keladi.</p>
      </DetailSection>

      <DetailSection icon={NotebookPen} title="Odatlar">
        {system.routines.length ? (
          <div className="flex flex-wrap gap-2">
            {system.routines.map((routine) => (
              <span key={routine} className="rounded-full border border-violet-200/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200">
                {routine}
              </span>
            ))}
          </div>
        ) : (
          <PanelEmptyState title="Hali odat yo'q" description="Yangi odat yaratilganda shu yerda ko'rinadi." compact />
        )}
      </DetailSection>
    </div>
  );
}

function GoalsPage({ system }: { system: SystemListView }) {
  return (
    <div className="space-y-3">
      <DetailSection icon={Target} title="Maqsadlar">
        {system.linkedGoals.length ? (
          <div className="space-y-2">
            {system.linkedGoals.map((goal) => (
              <div key={goal} className="rounded-2xl border border-violet-200/10 bg-white/[0.035] px-3 py-2 text-sm font-bold text-white">
                {goal}
              </div>
            ))}
          </div>
        ) : (
          <PanelEmptyState title="Hali maqsad yo'q" description="Yangi maqsad yaratilganda shu yerda ko'rinadi." compact />
        )}
      </DetailSection>
    </div>
  );
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ListChecks;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-violet-200/10 bg-white/[0.035] p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="text-violet-100" />
        <h3 className="text-sm font-black text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}
