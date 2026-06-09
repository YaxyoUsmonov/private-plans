"use client";

import { memo, useCallback, useRef } from "react";
import { Check, Flame, Layers3, Target, X, Zap } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import type { TodaySystemView } from "@/lib/mock-data";
import { softSpring } from "@/lib/motion";

type SystemRowProps = {
  system: TodaySystemView;
  enableLayoutAnimation?: boolean;
  enableStatusAnimation?: boolean;
  onSwipeReflect?: (system: TodaySystemView) => void;
  onUndo?: (system: TodaySystemView) => void;
  onOpenDetails?: (system: TodaySystemView) => void;
};

const SWIPE_REFLECT_THRESHOLD = -78;
const SWIPE_REFLECT_RIGHT_THRESHOLD = 78;
const SNAP_BACK_COMPLETE_DELAY_MS = 45;
const ACTION_BACKGROUND_WIDTH = "calc(100vw + 320px)";
const rowLayoutTransition = {
  type: "spring",
  stiffness: 330,
  damping: 36,
  mass: 0.82,
} as const;

const statusStyles = {
  planned: {
    bg: "bg-[#050816] shadow-[inset_0_1px_0_rgba(255,255,255,.018)] hover:bg-[#050816]",
    dot: "bg-violet-300",
    button: "border-violet-300/18 bg-violet-400/8",
    icon: "text-violet-100",
    label: "text-violet-100/85",
  },
  completed: {
    bg: "bg-[#050816] shadow-[inset_0_1px_0_rgba(255,255,255,.018)] hover:bg-[#050816]",
    dot: "bg-[#25EB2F]",
    button: "border-[#25EB2F]/28 bg-[#25EB2F]/10 text-[#E9FFEC]",
    icon: "text-[#D9FFDD]",
    label: "text-[#C9FFD0]",
  },
  missed: {
    bg: "bg-[#050816] shadow-[inset_0_1px_0_rgba(255,255,255,.018)] hover:bg-[#050816]",
    dot: "bg-[#FF3B30]",
    button: "border-[#FF3B30]/30 bg-[#FF3B30]/10 text-[#FFE7E5]",
    icon: "text-[#FFD1CD]",
    label: "text-[#FFD1CD]",
  },
};

function SystemRowComponent({
  system,
  enableLayoutAnimation = true,
  enableStatusAnimation = true,
  onSwipeReflect,
  onUndo,
  onOpenDetails,
}: SystemRowProps) {
  const EntityIcon = system.routineId ? Zap : system.goalId ? Target : Layers3;
  const styles = statusStyles[system.today.status];
  const shouldReduceMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const isPlanned = system.today.status === "planned";
  const suppressClickRef = useRef(false);
  const pendingReflectRef = useRef(false);

  const resetSwipe = useCallback(() => {
    const resetRow = animate(
      dragX,
      0,
      shouldReduceMotion
        ? { duration: 0.01 }
        : { duration: 0.15, ease: [0.2, 0.9, 0.2, 1] },
    );
    return resetRow.then(() => {
      if (pendingReflectRef.current) {
        pendingReflectRef.current = false;
        window.setTimeout(() => onSwipeReflect?.(system), shouldReduceMotion ? 0 : SNAP_BACK_COMPLETE_DELAY_MS);
      }
    });
  }, [dragX, onSwipeReflect, shouldReduceMotion, system]);

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      if (!isPlanned) return;
      suppressClickRef.current = Math.abs(info.offset.x) > 6;

      if (info.offset.x > SWIPE_REFLECT_RIGHT_THRESHOLD) {
        pendingReflectRef.current = true;
        await resetSwipe();
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 180);
        return;
      }

      if (info.offset.x < SWIPE_REFLECT_THRESHOLD) {
        pendingReflectRef.current = true;
        await resetSwipe();
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 180);
        return;
      }

      await resetSwipe();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);
    },
    [isPlanned, resetSwipe],
  );

  const handleStatusClick = useCallback(() => {
    if (system.today.status === "completed") {
      dragX.set(0);
      onUndo?.(system);
    }
  }, [dragX, onUndo, system]);

  const handleRowClick = useCallback(() => {
    if (suppressClickRef.current) return;
    onOpenDetails?.(system);
  }, [onOpenDetails, system]);

  return (
    <motion.div
      layout={enableLayoutAnimation}
      initial={false}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, transition: { duration: 0.16, ease: "easeOut" } }}
      transition={rowLayoutTransition}
      className="relative overflow-hidden bg-[#050816]"
    >
      <motion.article
        whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
        drag={isPlanned ? "x" : false}
        dragConstraints={{ left: -112, right: 112 }}
        dragDirectionLock
        dragElastic={0.09}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onTap={handleRowClick}
        onClick={handleRowClick}
        style={{ x: dragX, touchAction: "pan-y" }}
        className={`group relative w-full overflow-visible px-3.5 py-2 transition duration-300 sm:px-5 ${styles.bg}`}
      >
        {isPlanned ? (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-full top-0 h-full bg-[#25EB2F]/28"
              initial={false}
              animate={{ width: ACTION_BACKGROUND_WIDTH }}
              style={{ transformOrigin: "right center" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-full top-0 flex h-full w-20 items-center justify-end pr-5 text-[#D9FFDD]"
            >
              <Check size={20} strokeWidth={2.35} />
            </motion.span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-full top-0 h-full bg-[#25EB2F]/28"
              initial={false}
              animate={{ width: ACTION_BACKGROUND_WIDTH }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-full top-0 flex h-full w-20 items-center justify-start pl-5 text-[#D9FFDD]"
            >
              <Check size={20} strokeWidth={2.35} />
            </motion.span>
          </>
        ) : null}
        {system.today.status === "completed" ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#25EB2F]/[0.045]"
            initial={enableStatusAnimation ? { opacity: 0 } : false}
            animate={{ opacity: [0, 1, 0.35] }}
            transition={enableStatusAnimation ? { duration: 0.55, ease: "easeOut" } : { duration: 0 }}
          />
        ) : null}
        <div className="relative z-10 flex min-w-0 items-center gap-3 overflow-hidden">
          <button
            type="button"
            aria-label={`${system.name} status`}
            onClick={(event) => {
              event.stopPropagation();
              handleStatusClick();
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${styles.button} text-white transition duration-300 group-active:scale-95`}
          >
            {system.today.status === "completed" ? (
              <motion.span
                initial={shouldReduceMotion || !enableStatusAnimation ? false : { scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={shouldReduceMotion || !enableStatusAnimation ? { duration: 0 } : softSpring}
              >
                <Check size={18} />
              </motion.span>
            ) : null}
            {system.today.status === "missed" ? <X size={18} /> : null}
            {system.today.status === "planned" ? <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} /> : null}
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center text-white">
              <EntityIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-black text-white">{system.name}</h3>
              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1 text-orange-100/90">
                  <Flame size={13} className="icon-tone-warning" />
                  {system.streak} kun ketma-ket
                </span>
                {system.goal ? (
                  <span className={`truncate ${styles.label}`}>
                    {system.goal.current} / {system.goal.target} {system.goal.unit}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden min-w-[82px] text-right sm:block">
            <p className={`text-xs font-black ${styles.label}`}>{system.today.label}</p>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

export const SystemRow = memo(SystemRowComponent);
