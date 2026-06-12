"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SystemRow } from "@/components/systems/system-row";
import { PanelEmptyState } from "@/components/ui/detail-panel";
import type { TodaySystemView } from "@/lib/mock-data";

type SystemSectionProps = {
  title: string;
  accent: "pending" | "completed" | "missed";
  systems: TodaySystemView[];
  enableRowLayoutAnimation?: boolean;
  onSwipeReflect?: (system: TodaySystemView) => void;
  onSwipeGoalProgress?: (system: TodaySystemView) => void;
  onUndo?: (system: TodaySystemView) => void;
  onOpenDetails?: (system: TodaySystemView) => void;
};

const sectionStyles = {
  pending: {
    title: "text-white",
    pill: "border-[#7F00FF]/25 bg-[#3A025B] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]",
  },
  completed: {
    title: "text-[#C9FFD0]",
    pill: "border-[#25EB2F]/28 bg-[#25EB2F]/14 shadow-[inset_0_1px_0_rgba(255,255,255,.10)]",
  },
  missed: {
    title: "text-[#FFD1CD]",
    pill: "border-[color-mix(in_srgb,var(--status-missed)_28%,transparent)] bg-[color-mix(in_srgb,var(--status-missed)_14%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,.10)]",
  },
};

export function SystemSection({
  title,
  accent,
  systems,
  enableRowLayoutAnimation = true,
  onSwipeReflect,
  onSwipeGoalProgress,
  onUndo,
  onOpenDetails,
}: SystemSectionProps) {
  const styles = sectionStyles[accent];
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-0">
      <motion.div
        layout
        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative -mx-3.5 mb-0 flex justify-center sm:-mx-5"
      >
        <h2
          className={`w-full rounded-none border-y border-x-0 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] ${styles.title} ${styles.pill}`}
        >
          {title}: {systems.length}
        </h2>
      </motion.div>

      {systems.length > 0 ? (
        <div className="relative -mx-3.5 divide-y divide-white/[0.07] sm:-mx-5">
          <AnimatePresence initial={false}>
            {systems.map((system) => (
              <SystemRow
                key={system.id}
                system={system}
                enableLayoutAnimation={enableRowLayoutAnimation}
                enableStatusAnimation={enableRowLayoutAnimation}
                onSwipeReflect={accent === "pending" ? onSwipeReflect : undefined}
                onSwipeGoalProgress={accent === "pending" ? onSwipeGoalProgress : undefined}
                onUndo={accent === "completed" ? onUndo : undefined}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.18, ease: "easeOut" }}
          className="px-3 py-2 sm:px-5"
        >
          <PanelEmptyState title="Bu yerda hali tizim yo‘q" description="Bu bo‘lim hozircha bo‘sh." compact />
        </motion.div>
      )}
    </section>
  );
}
