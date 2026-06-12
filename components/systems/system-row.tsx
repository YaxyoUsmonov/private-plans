"use client";

import { memo, useCallback, useRef } from "react";
import { Check, Flame, Layers3, Target, Zap } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import type { TodaySystemView } from "@/lib/mock-data";

type SystemRowProps = {
  system: TodaySystemView;
  enableLayoutAnimation?: boolean;
  enableStatusAnimation?: boolean;
  onSwipeReflect?: (system: TodaySystemView) => void;
  onSwipeGoalProgress?: (system: TodaySystemView) => void;
  onUndo?: (system: TodaySystemView) => void;
  onOpenDetails?: (system: TodaySystemView) => void;
};

const SWIPE_REFLECT_THRESHOLD = -78;
const SWIPE_REFLECT_RIGHT_THRESHOLD = 78;
const SWIPE_VISUAL_THRESHOLD = 5;
const SWIPE_DRAG_RATIO = 0.8;
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
    label: "text-slate-400",
  },
  completed: {
    bg: "bg-[#050816] shadow-[inset_0_1px_0_rgba(255,255,255,.018)] hover:bg-[#050816]",
    label: "text-slate-400",
  },
  missed: {
    bg: "bg-[#050816] shadow-[inset_0_1px_0_rgba(255,255,255,.018)] hover:bg-[#050816]",
    label: "text-slate-400",
  },
};

function SystemRowComponent({
  system,
  enableLayoutAnimation = true,
  onSwipeReflect,
  onSwipeGoalProgress,
  onUndo,
  onOpenDetails,
}: SystemRowProps) {
  const EntityIcon = system.routineId ? Zap : system.goalId ? Target : Layers3;
  const styles = statusStyles[system.today.status];
  const shouldReduceMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const isPlanned = system.today.status === "planned";
  const isGoal = system.type === "goal";
  const canSwipeHabit = isPlanned && system.type === "habit";
  const canSwipeGoal = isPlanned && isGoal;
  const canSwipe = canSwipeHabit || canSwipeGoal;
  const goalProgressPercent =
    isGoal && system.goal && system.goal.target > 0
      ? Math.min(100, Math.max(0, Math.round((system.goal.current / system.goal.target) * 100)))
      : 0;
  const suppressClickRef = useRef(false);
  const pendingReflectRef = useRef(false);
  const pendingGoalProgressRef = useRef(false);

  const resetSwipe = useCallback(() => {
    const resetRow = animate(
      dragX,
      0,
      shouldReduceMotion
        ? { duration: 0.01 }
        : {
            type: "spring",
            stiffness: 380,
            damping: 38,
            mass: 0.75,
          },
    );
    return resetRow.then(() => {
      if (!pendingReflectRef.current) return;
      pendingReflectRef.current = false;
      onSwipeReflect?.(system);
    }).then(() => {
      if (!pendingGoalProgressRef.current) return;
      pendingGoalProgressRef.current = false;
      onSwipeGoalProgress?.(system);
    });
  }, [dragX, onSwipeGoalProgress, onSwipeReflect, shouldReduceMotion, system]);

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      if (!canSwipe) return;
      suppressClickRef.current =
        Math.abs(info.offset.x) >= SWIPE_VISUAL_THRESHOLD;

      if (canSwipeGoal) {
        if (
          info.offset.x > SWIPE_REFLECT_RIGHT_THRESHOLD ||
          info.offset.x < SWIPE_REFLECT_THRESHOLD
        ) {
          pendingGoalProgressRef.current = true;
        }
        await resetSwipe();
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 180);
        return;
      }

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
    [canSwipe, canSwipeGoal, resetSwipe],
  );

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      if (!canSwipe) return;
      dragX.set(info.offset.x * SWIPE_DRAG_RATIO);
    },
    [canSwipe, dragX],
  );

  const handleStatusClick = useCallback(() => {
    if (system.today.status !== "completed" || isGoal) return;
    dragX.set(0);
    onUndo?.(system);
  }, [dragX, isGoal, onUndo, system]);

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
        drag={canSwipe ? "x" : false}
        dragConstraints={{ left: -112, right: 112 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleRowClick}
        onClick={handleRowClick}
        style={{ x: dragX, touchAction: "pan-y", willChange: "transform" }}
        className={`group relative w-full overflow-visible px-3.5 py-2 transition-colors duration-300 sm:px-5 ${styles.bg}`}
      >
        {canSwipeHabit ? (
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
        {canSwipeGoal ? (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-full top-0 h-full bg-[#7F00FF]/24"
              initial={false}
              animate={{ width: ACTION_BACKGROUND_WIDTH }}
              style={{ transformOrigin: "right center" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-full top-0 flex h-full w-28 items-center justify-end gap-1.5 pr-5 text-violet-100"
            >
              <Target size={18} strokeWidth={2.25} />
              <span className="text-xs font-black">Progress</span>
            </motion.span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-full top-0 h-full bg-[#7F00FF]/24"
              initial={false}
              animate={{ width: ACTION_BACKGROUND_WIDTH }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-full top-0 flex h-full w-28 items-center justify-start gap-1.5 pl-5 text-violet-100"
            >
              <Target size={18} strokeWidth={2.25} />
              <span className="text-xs font-black">Progress</span>
            </motion.span>
          </>
        ) : null}
        <div className="relative z-10 flex min-w-0 items-center gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              aria-label={
                system.today.status === "completed" && !isGoal
                  ? `${system.name} statusini qaytarish`
                  : undefined
              }
              disabled={system.today.status !== "completed" || isGoal}
              onClick={(event) => {
                if (system.today.status !== "completed" || isGoal) return;
                event.stopPropagation();
                handleStatusClick();
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 disabled:cursor-default"
            >
              <EntityIcon
                size={18}
                className={
                  system.today.status === "completed"
                    ? "icon-tone-success"
                    : system.today.status === "missed"
                      ? "icon-tone-danger"
                      : "text-white"
                }
                style={{
                  color:
                    system.today.status === "completed"
                      ? "#008000"
                      : system.today.status === "missed"
                        ? "var(--status-missed)"
                        : "#FFFFFF",
                }}
              />
            </button>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-black text-white">{system.name}</h3>
              {isGoal && system.goal ? (
                <p className={`mt-1.5 truncate text-xs font-semibold ${styles.label}`}>
                  {system.goal.current} / {system.goal.target} {system.goal.unit} · {goalProgressPercent}%
                </p>
              ) : (
                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">
                  <span className="inline-flex items-center gap-1 text-orange-100/90">
                    <Flame size={13} className="icon-tone-warning" />
                    {system.streak} kun ketma-ket
                  </span>
                </div>
              )}
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
