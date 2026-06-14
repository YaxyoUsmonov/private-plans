"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Bot,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  History,
  Layers3,
  MessageSquareText,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { AiInsightsCard } from "@/components/ai/ai-insights-card";
import { CreateSystemFlow } from "@/components/create/create-system-flow";
import { ConsistencyHeatmap } from "@/components/progress/consistency-heatmap";
import { ProgressSystemDetailSheet } from "@/components/systems/progress-system-detail-sheet";
import { SystemDetailSheet } from "@/components/systems/system-detail-sheet";
import { DetailPanel, PanelEmptyState } from "@/components/ui/detail-panel";
import { DetailTabNavigator } from "@/components/ui/detail-tab-navigator";
import { toDateKey } from "@/lib/date-utils";
import { isRoutineScheduledOnDate, toGoalDetailView, toRoutineDetailView, toSystemListViews, type CreateSystemPayload, type System, type SystemListView } from "@/lib/mock-data";
import { sheetSpring } from "@/lib/motion";
import { uz } from "@/lib/uz";

type ProgressSectionKey =
  | "systems-list"
  | "ai"
  | "weekly"
  | "snapshot"
  | "systems"
  | "consistency"
  | "missed"
  | "energy"
  | "schedule";

const progressSections: Array<{
  key: ProgressSectionKey;
  title: string;
  subtitle: string;
  icon: typeof Bot;
}> = [
  { key: "systems-list", title: uz.progress.systems, subtitle: uz.progress.systemsSubtitle, icon: Layers3 },
  { key: "ai", title: uz.progress.aiCoach, subtitle: uz.progress.aiSubtitle, icon: Bot },
  { key: "weekly", title: "Umumiy tahlil", subtitle: uz.progress.weeklySubtitle, icon: MessageSquareText },
  { key: "consistency", title: uz.progress.consistency, subtitle: uz.progress.consistencySubtitle, icon: Flame },
];

const systemDetailPages = ["Tizimlar", "Odatlar", "Maqsadlar"] as const;
const analyticsPeriods = ["Bugun", "Hafta", "Oy", "Yil"] as const;
const analyticsPages = ["Ritm", "Natija", "Xulosa"] as const;
type AnalyticsPeriod = (typeof analyticsPeriods)[number];

type ProgressTabProps = {
  systems: System[];
  onSystemsChange: React.Dispatch<React.SetStateAction<System[]>>;
  onCreate: (payload: CreateSystemPayload) => void;
  onSystemChangePersist: (systemId: string, changes: Partial<System>) => void;
  onSystemDeletePersist: (systemId: string) => void;
};

function AnalyticsPeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPosition({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const label = value === "Bugun" ? "Kun" : value;

  return (
    <div ref={rootRef} className="relative z-[70]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 min-w-[68px] items-center justify-center gap-1.5 rounded-full border border-[#7F00FF]/30 bg-[#3A025B] px-2.5 text-[10px] font-black text-white transition duration-200 active:scale-95"
      >
        {label}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
        <div
          ref={popoverRef}
          role="menu"
          className="analytics-period-popover fixed z-[100] w-[116px] overflow-hidden p-1.5"
          style={{
            top: position.top,
            right: position.right,
            backgroundColor: "#11162A",
          }}
        >
          {analyticsPeriods.map((period) => {
            const active = period === value;

            return (
              <button
                key={period}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onChange(period);
                  setOpen(false);
                }}
                className={`flex h-9 w-full items-center rounded-[11px] px-3 text-left text-[11px] font-black transition ${
                  active
                    ? "bg-[#3A025B] text-white"
                    : "bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {period === "Bugun" ? "Kun" : period}
              </button>
            );
          })}
        </div>,
        document.body,
          )
        : null}
    </div>
  );
}

export function ProgressTab({
  systems,
  onSystemsChange,
  onCreate,
  onSystemChangePersist,
  onSystemDeletePersist,
}: ProgressTabProps) {
  const [activeSection, setActiveSection] = useState<ProgressSectionKey | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] =
    useState<AnalyticsPeriod>("Hafta");
  const [weeklyRoutineDetail, setWeeklyRoutineDetail] = useState<{ systemId: string; routineId: string } | null>(null);
  const [weeklyGoalDetail, setWeeklyGoalDetail] = useState<{ systemId: string; goalId: string } | null>(null);
  const activeMeta = progressSections.find((section) => section.key === activeSection) ?? null;
  const systemViews = toSystemListViews(systems);
  const weeklyRoutineSystem = weeklyRoutineDetail
    ? systems.find((system) => system.id === weeklyRoutineDetail.systemId) ?? null
    : null;
  const weeklyRoutineView =
    weeklyRoutineDetail && weeklyRoutineSystem
      ? toRoutineDetailView(weeklyRoutineSystem, weeklyRoutineDetail.routineId)
      : null;
  const weeklyGoalSystem = weeklyGoalDetail
    ? systems.find((system) => system.id === weeklyGoalDetail.systemId) ?? null
    : null;
  const weeklyGoalView =
    weeklyGoalDetail && weeklyGoalSystem
      ? toGoalDetailView(weeklyGoalSystem, weeklyGoalDetail.goalId)
      : null;

  return (
    <div className="space-y-5 pt-2">
      <header>
        <h1 className="text-[34px] font-black leading-none tracking-tight text-white">{uz.progress.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{uz.progress.subtitle}</p>
      </header>

      <section className="space-y-1.5">
        {progressSections.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className="flex min-h-[60px] w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.055)] transition duration-300 active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">{section.title}</span>
              </span>
              <ChevronRight size={17} className="shrink-0 text-slate-500" />
            </button>
          );
        })}
      </section>

      <DetailPanel
        open={Boolean(activeMeta)}
        title={activeMeta?.title ?? ""}
        mode="sheet"
        showBack={false}
        showClose
        centerTitle
        headerTrailing={
          activeMeta?.key === "weekly" ? (
            <AnalyticsPeriodSelector
              value={analyticsPeriod}
              onChange={setAnalyticsPeriod}
            />
          ) : undefined
        }
        onClose={() => setActiveSection(null)}
      >
        {activeMeta?.key === "systems-list" ? (
          <ProgressSystemsDetail
            systems={systems}
            systemViews={systemViews}
            onSystemsChange={onSystemsChange}
            onCreate={onCreate}
            onSystemChangePersist={onSystemChangePersist}
            onSystemDeletePersist={onSystemDeletePersist}
          />
        ) : null}
        {activeMeta?.key === "ai" ? <AiCoachDetail /> : null}
        {activeMeta?.key === "weekly" ? (
          <WeeklyReviewDetail
            systems={systems}
            onOpenRoutine={(systemId, routineId) => setWeeklyRoutineDetail({ systemId, routineId })}
            onOpenGoal={(systemId, goalId) => setWeeklyGoalDetail({ systemId, goalId })}
          />
        ) : null}
        {activeMeta?.key === "snapshot" ? <GrowthSnapshotDetail systems={systems} /> : null}
        {activeMeta?.key === "systems" ? <SystemsProgressDetail systems={systems} /> : null}
        {activeMeta?.key === "consistency" ? <ConsistencyDetail systems={systems} /> : null}
        {activeMeta?.key === "missed" ? <MissedPatternsDetail systems={systems} /> : null}
        {activeMeta?.key === "energy" ? <EnergyInsightsDetail /> : null}
        {activeMeta?.key === "schedule" ? <ScheduleSuggestionsDetail /> : null}
      </DetailPanel>

      <SystemDetailSheet
        system={weeklyRoutineView}
        onClose={() => setWeeklyRoutineDetail(null)}
        onStatusChange={() => undefined}
      />
      <SystemDetailSheet
        system={weeklyGoalView}
        onClose={() => setWeeklyGoalDetail(null)}
        onStatusChange={() => undefined}
      />
    </div>
  );
}

function ProgressSystemsDetail({
  systems,
  systemViews,
  onSystemsChange,
  onCreate,
  onSystemChangePersist,
  onSystemDeletePersist,
}: {
  systems: System[];
  systemViews: SystemListView[];
  onSystemsChange: React.Dispatch<React.SetStateAction<System[]>>;
  onCreate: (payload: CreateSystemPayload) => void;
  onSystemChangePersist: (systemId: string, changes: Partial<System>) => void;
  onSystemDeletePersist: (systemId: string) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [habitFlowSystemId, setHabitFlowSystemId] = useState<string | null>(null);
  const [routineDetail, setRoutineDetail] = useState<{ systemId: string; routineId: string } | null>(null);
  const [goalDetail, setGoalDetail] = useState<{ systemId: string; goalId: string } | null>(null);
  const pendingHabitSystemRef = useRef<string | null>(null);
  const pendingRoutineRef = useRef<{ systemId: string; routineId: string } | null>(null);
  const pendingGoalRef = useRef<{ systemId: string; goalId: string } | null>(null);
  const routineReturnsToSystemRef = useRef(false);
  const goalReturnsToSystemRef = useRef(false);
  const pendingDetailSystemRef = useRef<string | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef(false);
  const selectedSystem = systems.find((system) => system.id === selectedSystemId) ?? null;
  const habitFlowSystem = systems.find((system) => system.id === habitFlowSystemId) ?? null;
  const routineDetailSystem = routineDetail
    ? systems.find((system) => system.id === routineDetail.systemId) ?? null
    : null;
  const routineDetailView =
    routineDetail && routineDetailSystem
      ? toRoutineDetailView(routineDetailSystem, routineDetail.routineId)
      : null;
  const goalDetailSystem = goalDetail
    ? systems.find((system) => system.id === goalDetail.systemId) ?? null
    : null;
  const goalDetailView =
    goalDetail && goalDetailSystem
      ? toGoalDetailView(goalDetailSystem, goalDetail.goalId)
      : null;

  const goNext = useCallback(() => setPageIndex((current) => Math.min(systemDetailPages.length - 1, current + 1)), []);
  const goPrevious = useCallback(() => setPageIndex((current) => Math.max(0, current - 1)), []);

  const resolveSwipe = useCallback(
    (dx: number, dy: number) => {
      if (swipeHandledRef.current) return;
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.08) return;

      swipeHandledRef.current = true;
      if (dx < 0) goNext();
      if (dx > 0) goPrevious();
    },
    [goNext, goPrevious],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    swipeHandledRef.current = false;
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start) return;

      resolveSwipe(event.clientX - start.x, event.clientY - start.y);
    },
    [resolveSwipe],
  );

  const handlePointerCancel = useCallback(() => {
    pointerStartRef.current = null;
    swipeHandledRef.current = false;
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

  const updateSelectedSystem = useCallback(
    (systemId: string, changes: Partial<System>) => {
      onSystemChangePersist(systemId, changes);
      onSystemsChange((current) =>
        current.map((system): System =>
          system.id === systemId
            ? {
                ...system,
                ...changes,
              }
            : system,
        ),
      );
    },
    [onSystemChangePersist, onSystemsChange],
  );

  const deleteSelectedSystem = useCallback(
    (systemId: string) => {
      onSystemDeletePersist(systemId);
      onSystemsChange((current) => current.filter((system) => system.id !== systemId));
      setSelectedSystemId(null);
    },
    [onSystemDeletePersist, onSystemsChange],
  );

  const createHabitForSelectedSystem = useCallback(
    (payload: CreateSystemPayload) => {
      onCreate(payload);
    },
    [onCreate],
  );

  const requestAddHabit = useCallback((systemId: string) => {
    pendingHabitSystemRef.current = systemId;
    setSelectedSystemId(null);
  }, []);

  const requestHabitDetail = useCallback((systemId: string, routineId: string) => {
    routineReturnsToSystemRef.current = true;
    pendingRoutineRef.current = { systemId, routineId };
    setSelectedSystemId(null);
  }, []);

  const openRoutineFromList = useCallback(
    (routine: { systemId: string; routineId: string }) => {
      routineReturnsToSystemRef.current = false;
      setRoutineDetail(routine);
    },
    [],
  );

  const requestGoalDetail = useCallback((systemId: string, goalId: string) => {
    goalReturnsToSystemRef.current = true;
    pendingGoalRef.current = { systemId, goalId };
    setSelectedSystemId(null);
  }, []);

  const openGoalFromList = useCallback((goal: { systemId: string; goalId: string }) => {
    goalReturnsToSystemRef.current = false;
    setGoalDetail(goal);
  }, []);

  const handleDetailExitComplete = useCallback(() => {
    const routine = pendingRoutineRef.current;
    pendingRoutineRef.current = null;
    if (routine) {
      setRoutineDetail(routine);
      return;
    }

    const goal = pendingGoalRef.current;
    pendingGoalRef.current = null;
    if (goal) {
      setGoalDetail(goal);
      return;
    }

    const systemId = pendingHabitSystemRef.current;
    pendingHabitSystemRef.current = null;
    if (systemId) setHabitFlowSystemId(systemId);
  }, []);

  const closeHabitFlow = useCallback(() => {
    pendingDetailSystemRef.current = habitFlowSystemId;
    setHabitFlowSystemId(null);
  }, [habitFlowSystemId]);

  const handleHabitExitComplete = useCallback(() => {
    const systemId = pendingDetailSystemRef.current;
    pendingDetailSystemRef.current = null;
    if (systemId && systems.some((system) => system.id === systemId)) {
      setSelectedSystemId(systemId);
    }
  }, [systems]);

  const closeRoutineDetail = useCallback(() => {
    pendingDetailSystemRef.current = routineReturnsToSystemRef.current
      ? routineDetail?.systemId ?? null
      : null;
    routineReturnsToSystemRef.current = false;
    setRoutineDetail(null);
  }, [routineDetail]);

  const closeGoalDetail = useCallback(() => {
    pendingDetailSystemRef.current = goalReturnsToSystemRef.current
      ? goalDetail?.systemId ?? null
      : null;
    goalReturnsToSystemRef.current = false;
    setGoalDetail(null);
  }, [goalDetail]);

  const handleRoutineExitComplete = useCallback(() => {
    const systemId = pendingDetailSystemRef.current;
    pendingDetailSystemRef.current = null;
    if (systemId && systems.some((system) => system.id === systemId)) {
      setSelectedSystemId(systemId);
    }
  }, [systems]);

  return (
    <section
      className="space-y-3"
      onPointerDownCapture={handlePointerDown}
      onPointerUpCapture={handlePointerUp}
      onPointerCancelCapture={handlePointerCancel}
      onTouchStartCapture={handleTouchStart}
      onTouchEndCapture={handleTouchEnd}
      onTouchCancelCapture={handleTouchCancel}
      style={{ touchAction: "pan-y" }}
    >
      <DetailTabNavigator pages={systemDetailPages} pageIndex={pageIndex} onChange={setPageIndex} />

      <div className="overflow-hidden">
        <motion.div className="flex" animate={{ x: `-${pageIndex * 100}%` }} transition={sheetSpring}>
          <SwipePage>
            <SystemsCompactPage systems={systemViews} onSelect={setSelectedSystemId} />
          </SwipePage>
          <SwipePage>
            <SystemRoutinesPage systems={systems} onSelect={openRoutineFromList} />
          </SwipePage>
          <SwipePage>
            <SystemGoalsPage systems={systems} onSelect={openGoalFromList} />
          </SwipePage>
        </motion.div>
      </div>

      <ProgressSystemDetailSheet
        system={selectedSystem}
        onClose={() => setSelectedSystemId(null)}
        onChange={updateSelectedSystem}
        onDelete={deleteSelectedSystem}
        onRequestAddHabit={requestAddHabit}
        onRequestHabitDetail={requestHabitDetail}
        onRequestGoalDetail={requestGoalDetail}
        onExitComplete={handleDetailExitComplete}
      />

      <CreateSystemFlow
        open={Boolean(habitFlowSystem)}
        systems={habitFlowSystem ? [habitFlowSystem] : []}
        mode="attach-to-existing-system"
        existingSystemId={habitFlowSystemId ?? undefined}
        onClose={closeHabitFlow}
        onExitComplete={handleHabitExitComplete}
        onCreate={createHabitForSelectedSystem}
      />

      <SystemDetailSheet
        system={routineDetailView}
        onClose={closeRoutineDetail}
        onExitComplete={handleRoutineExitComplete}
        onStatusChange={() => undefined}
      />
      <SystemDetailSheet
        system={goalDetailView}
        onClose={closeGoalDetail}
        onExitComplete={handleRoutineExitComplete}
        onStatusChange={() => undefined}
      />
    </section>
  );
}

function SwipePage({ children }: { children: React.ReactNode }) {
  return <div className="w-full shrink-0">{children}</div>;
}

function SystemsCompactPage({ systems, onSelect }: { systems: SystemListView[]; onSelect: (systemId: string) => void }) {
  if (!systems.length) {
    return <PanelEmptyState title="Hali tizim yaratilmagan" description="Yangi tizim yaratilganda shu yerda ko'rinadi." icon={Layers3} />;
  }

  return (
    <div className="space-y-2">
      {systems.map((system) => {
        const Icon = system.icon;

        return (
          <button
            key={system.id}
            type="button"
            onClick={() => onSelect(system.id)}
            className="flex min-h-[64px] w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3 py-2.5 text-left transition duration-300 active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-black text-white">{system.title}</span>
            <ChevronRight size={17} className="shrink-0 text-slate-500" />
          </button>
        );
      })}
    </div>
  );
}

function SystemRoutinesPage({
  systems,
  onSelect,
}: {
  systems: System[];
  onSelect: (routine: { systemId: string; routineId: string }) => void;
}) {
  const routines = systems
    .flatMap((system) =>
      system.routines.map((routine) => ({
        routine,
        systemId: system.id,
      })),
    )
    .sort((left, right) => {
      if (!left.routine.createdAt || !right.routine.createdAt) return 0;
      return right.routine.createdAt.localeCompare(left.routine.createdAt);
    });

  if (!routines.length) {
    return <PanelEmptyState title="Hali odatlar yo'q" description="Tizim ichida odat yaratilganda shu yerda ko'rinadi." icon={BookOpen} />;
  }

  return (
    <div className="space-y-2">
      {routines.map(({ routine, systemId }) => (
          <CompactRow
            key={routine.id}
            onClick={() => onSelect({ systemId, routineId: routine.id })}
            icon={<Zap size={17} />}
            title={routine.title}
            subtitle={`${routine.cadence}${routine.targetAmount ? ` · ${routine.targetAmount} ${routine.unit ?? ""}` : ""}`}
            meta={`${routine.streak} kun`}
          />
      ))}
    </div>
  );
}

function SystemGoalsPage({
  systems,
  onSelect,
}: {
  systems: System[];
  onSelect: (goal: { systemId: string; goalId: string }) => void;
}) {
  const goals = systems
    .flatMap((system) =>
      system.goals.map((goal) => ({
        goal,
        systemId: system.id,
      })),
    )
    .sort((left, right) => {
      if (!left.goal.createdAt || !right.goal.createdAt) return 0;
      return right.goal.createdAt.localeCompare(left.goal.createdAt);
    });

  if (!goals.length) {
    return <PanelEmptyState title="Hali maqsad yo'q" description="Tizim ichida maqsad yaratilganda shu yerda ko'rinadi." icon={Target} />;
  }

  return (
    <div className="space-y-2">
      {goals.map(({ goal, systemId }) => (
        <CompactRow
          key={goal.id}
          onClick={() => onSelect({ systemId, goalId: goal.id })}
          icon={<Target size={17} />}
          title={goal.title}
          subtitle={`${goal.current} / ${goal.target} ${goal.unit}`}
          meta={goal.status === "completed" ? "Bajarildi" : "Faol"}
        />
      ))}
    </div>
  );
}

function CompactRow({
  icon,
  title,
  subtitle,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  meta?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-white">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{subtitle}</span>
      </span>
      {meta ? (
        <span className="shrink-0 rounded-full border border-violet-200/10 bg-violet-400/10 px-2.5 py-1 text-[10px] font-black text-violet-100">
          {meta}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[68px] w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3 py-2.5 text-left transition active:scale-[0.99]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-h-[68px] items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3 py-2.5">
      {content}
    </div>
  );
}

function AiCoachDetail() {
  return (
    <div className="space-y-4">
      <AiInsightsCard state="empty" />
    </div>
  );
}

function WeeklyReviewDetail({
  systems,
  onOpenRoutine,
  onOpenGoal,
}: {
  systems: System[];
  onOpenRoutine: (systemId: string, routineId: string) => void;
  onOpenGoal: (systemId: string, goalId: string) => void;
}) {
const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [pageIndex, setPageIndex] = useState(0);
  const { current } = getWeeklyRanges();
  const allLogs = getCompletionLogs(systems);
  const logs = allLogs.filter(
    (log) => log.date >= current.start && log.date <= current.end,
  );
  const completedLogs = logs.filter((log) => log.status === "completed");
  const rhythmLogs = logs.filter(
    (log) => log.status === "completed" || log.status === "missed",
  );
  const missedCount = logs.filter((log) => log.status === "missed").length;
  const completedCount = completedLogs.length;
  const totalCount = completedCount + missedCount;
  const mostActiveHabit = getRoutineInsight(systems, completedLogs, "completed");
  const weakestHabit = getRoutineInsight(systems, logs, "missed", mostActiveHabit.id);
  const goalChanges = getWeeklyGoalChanges(systems, allLogs, current.start, current.end);
  const weakestGoal = getWeakGoal(systems, allLogs, current.start, goalChanges[0]?.goalId);
  const timeline = getWeeklyTimeline(systems, rhythmLogs, current.start);
  const mostActiveDay = timeline.reduce((best, day) =>
    day.count > best.count ? day : best,
  );
  const selectedDay =
    timeline.find((day) => day.date === selectedDate) ?? mostActiveDay;
  const maxRhythmCount = Math.max(...timeline.map((day) => day.count), 1);
  const rhythmMinHeight = 10;
  const rhythmMaxHeight = 82;
  const rhythmEmptyHeight = 18;
  const busiestDays = getBusiestDayLabels(
    getWeeklyTimeline(systems, completedLogs, current.start),
  );
  const hasMultipleBusiestDays = busiestDays.includes(" va ") || busiestDays.includes(",");
  const summaryLines = totalCount
    ? [
        `Bu hafta ${completedCount} faoliyat bajarildi.`,
        busiestDays
          ? `${busiestDays} eng faol ${hasMultipleBusiestDays ? "kunlar" : "kun"} bo‘ldi.`
          : null,
        goalChanges[0] ? `${goalChanges[0].title} maqsadida progress kuzatildi.` : null,
        weakestGoal.hasIssue
          ? `Keyingi hafta ${weakestGoal.value}ga ko‘proq e'tibor berish tavsiya etiladi.`
          : weakestHabit.count
            ? `Keyingi hafta ${weakestHabit.value} odatida ritmni tiklash tavsiya etiladi.`
            : "Keyingi hafta odat barqarorligini davom ettirish tavsiya etiladi.",
      ].filter((line): line is string => Boolean(line))
    : ["Haftalik xulosa uchun ma’lumot yetarli emas."];

  return (
    <div className="space-y-3">
      <DetailTabNavigator
        pages={analyticsPages}
        pageIndex={pageIndex}
        onChange={setPageIndex}
      />

      {pageIndex === 0 ? (
        <>
          <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.025] p-3.5">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
          Haftalik ritm
        </p>
        <div className="mx-auto mt-3 grid h-[92px] w-full max-w-[330px] grid-cols-7 items-end gap-2">
          {timeline.map((day) => {
            const height =
              day.count === 0
                ? rhythmEmptyHeight
                : rhythmMinHeight +
                  (day.count / maxRhythmCount) *
                    (rhythmMaxHeight - rhythmMinHeight);

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className="group flex h-full min-w-0 touch-manipulation flex-col items-center justify-end"
                aria-label={`${day.label}: ${day.count} ta faoliyat`}
                aria-pressed={selectedDay.date === day.date}
              >
                <span
                  className={`relative flex w-7 overflow-hidden rounded-[9px] transition-[transform,box-shadow] duration-200 group-active:scale-95 ${
                    day.count ? "text-white" : "bg-white/[0.06] text-slate-400"
                  } ${
                    selectedDay.date === day.date
                      ? "shadow-[0_0_0_2px_var(--accent),0_0_14px_rgba(127,0,255,0.22)]"
                      : ""
                  }`}
                  style={{ height }}
                >
                  {day.count ? (
                    <span className="flex h-full w-full flex-col">
                      {day.missedCount ? (
                        <span
                          className="w-full bg-[var(--status-missed)]"
                          style={{
                            height: `${(day.missedCount / day.count) * 100}%`,
                          }}
                        />
                      ) : null}
                      {day.completedCount ? (
                        <span
                          className="w-full bg-[#008000]"
                          style={{
                            height: `${(day.completedCount / day.count) * 100}%`,
                          }}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1.5 block text-center text-[10px] font-black text-slate-300">
                  {day.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {!totalCount ? (
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">
            Hali haftalik ma’lumot yig‘ilmagan
          </p>
        ) : null}
          </div>

          <section>
            <h3 className="mb-2 pl-1 text-sm font-black text-white">
              {selectedDay.label}
            </h3>
            <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.025] px-3.5">
              <div className="divide-y divide-white/[0.06]">
                {selectedDay.completedItems.length ? (
                  <WeeklyDayActivityGroup
                    title="Bajarilganlar"
                    items={selectedDay.completedItems}
                    emptyLabel="Bajarilgan faoliyat yo‘q"
                    status="completed"
                  />
                ) : (
                  <p className="py-3 text-xs font-semibold leading-5 text-slate-500">
                    Bajarilgan faoliyat yo‘q
                  </p>
                )}
                {selectedDay.missedItems.length ? (
                  <WeeklyDayActivityGroup
                    title="Bajarilmaganlar"
                    items={selectedDay.missedItems}
                    emptyLabel="Bajarilmagan faoliyat yo‘q"
                    status="missed"
                  />
                ) : null}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {pageIndex === 1 ? (
        <section>
        <div className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.025]">
          <div className="px-4 py-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0 text-center">
                {mostActiveHabit.id && mostActiveHabit.systemId ? (
                  <button
                    type="button"
                    onClick={() => onOpenRoutine(mostActiveHabit.systemId!, mostActiveHabit.id!)}
                    className="w-full rounded-[16px] px-1 py-1.5 text-center transition duration-200 active:scale-[0.97] active:bg-white/[0.04]"
                  >
                    <span className="block text-[11px] font-black text-[#008000]">🔥 Eng faol</span>
                    <span className="mt-1 block truncate text-sm font-black text-white">{mostActiveHabit.value}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      {mostActiveHabit.count} marta bajarildi
                    </span>
                  </button>
                ) : (
                  <>
                    <p className="text-[11px] font-black text-[#008000]">🔥 Eng faol</p>
                    <p className="mt-1 truncate text-sm font-black text-white">Hali odat faoliyati yo‘q</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">Bu hafta</p>
                  </>
                )}
              </div>
              <div className="min-w-0 border-l border-white/[0.06] pl-3 text-center">
                {weakestHabit.count && weakestHabit.id && weakestHabit.systemId ? (
                  <button
                    type="button"
                    onClick={() => onOpenRoutine(weakestHabit.systemId!, weakestHabit.id!)}
                    className="w-full rounded-[16px] px-1 py-1.5 text-center transition duration-200 active:scale-[0.97] active:bg-white/[0.04]"
                  >
                    <span className="block text-[11px] font-black text-[#FF3B30]/80">⚠️ Eng sust</span>
                    <span className="mt-1 block truncate text-sm font-black text-white">{weakestHabit.value}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      {weakestHabit.count} marta bajarilmadi
                    </span>
                  </button>
                ) : (
                  <p className="flex min-h-[52px] items-center justify-center text-xs font-semibold leading-5 text-slate-500">
                    Hozircha sust odat yo‘q
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] px-4 py-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0 text-center">
                <p className="text-[11px] font-black text-[#008000]">🚀 O‘sish</p>
                {goalChanges[0] ? (
                  <button
                    type="button"
                    onClick={() => onOpenGoal(goalChanges[0].systemId, goalChanges[0].goalId)}
                    className="w-full rounded-[16px] px-1 py-1.5 text-center transition duration-200 active:scale-[0.97] active:bg-white/[0.04]"
                  >
                    <span className="block truncate text-sm font-black text-white">{goalChanges[0].title}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">
                      {goalChanges[0].previousAmount === null
                        ? `${goalChanges[0].currentAmount} ${goalChanges[0].unit} gacha yangilandi`
                        : `${goalChanges[0].previousAmount} → ${goalChanges[0].currentAmount} ${goalChanges[0].unit}`}
                    </span>
                  </button>
                ) : (
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Hali maqsad progressi yo‘q</p>
                )}
              </div>
              <div className="min-w-0 border-l border-white/[0.06] pl-3 text-center">
                {weakestGoal.hasIssue ? (
                  <button
                    type="button"
                    onClick={() => onOpenGoal(weakestGoal.systemId!, weakestGoal.goalId!)}
                    className="w-full rounded-[16px] px-1 py-1.5 text-center transition duration-200 active:scale-[0.97] active:bg-white/[0.04]"
                  >
                    <span className="block text-[11px] font-black text-[#FF3B30]/80">⚠️ To‘xtagan</span>
                    <span className="mt-1 block truncate text-sm font-black text-white">{weakestGoal.value}</span>
                    <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">{weakestGoal.meta}</span>
                  </button>
                ) : (
                  <p className="flex min-h-[52px] items-center justify-center text-xs font-semibold leading-5 text-slate-500">
                    Hozircha sust maqsad yo‘q
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        </section>
      ) : null}

      {pageIndex === 2 ? (
        <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.025] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
          Haftalik xulosa
        </p>
        <div className="mt-2 space-y-1 text-sm font-semibold leading-5 text-slate-200">
          {summaryLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        </div>
      ) : null}

    </div>
  );
}

function WeeklyDayActivityGroup({
  title,
  items,
  emptyLabel,
  status,
}: {
  title: string;
  items: ReturnType<typeof getWeeklyTimeline>[number]["items"];
  emptyLabel: string;
  status: "completed" | "missed";
}) {
  return (
    <div className="min-w-0 py-3 first:pt-2 last:pb-0">
      <p
        className={`text-[10px] font-black uppercase tracking-[0.1em] ${
          status === "completed"
            ? "text-[#008000]"
            : "text-[var(--status-missed)]"
        }`}
      >
        {title}
      </p>
      {items.length ? (
        <div className="mt-1.5 divide-y divide-white/[0.05]">
          {items.map((item) => (
            <WeeklyDayActivityRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
          — {emptyLabel}
        </p>
      )}
    </div>
  );
}

function WeeklyDayActivityRow({
  item,
}: {
  item: ReturnType<typeof getWeeklyTimeline>[number]["items"][number];
}) {
  const completed = item.status === "completed";

  return (
    <div className="flex min-h-10 items-center gap-2.5 py-2">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
          completed ? "text-[#008000]" : "text-[var(--status-missed)]"
        }`}
      >
        {completed ? (
          <Check size={15} strokeWidth={2.6} />
        ) : (
          <X size={15} strokeWidth={2.6} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-white">{item.title}</span>
        {item.detail ? (
          <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">
            {item.detail}
          </span>
        ) : null}
      </span>
    </div>
  );
}

function getWeeklyRanges() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysFromMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return {
    current: {
      start: toDateKey(start),
      end: toDateKey(end),
    },
  };
}

const weeklyDayLabels = [
  { full: "Dushanba", short: "D" },
  { full: "Seshanba", short: "S" },
  { full: "Chorshanba", short: "C" },
  { full: "Payshanba", short: "P" },
  { full: "Juma", short: "J" },
  { full: "Shanba", short: "Sh" },
  { full: "Yakshanba", short: "Y" },
] as const;

function getBusiestDayLabels(
  timeline: ReturnType<typeof getWeeklyTimeline>,
) {
  const highestCount = Math.max(...timeline.map((day) => day.count));
  if (!highestCount) return "";

  const labels = timeline
    .filter((day) => day.count === highestCount)
    .map((day) => day.label);

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} va ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} va ${labels.at(-1)}`;
}

function getWeeklyTimeline(
  systems: System[],
  logs: System["completionLogs"],
  weekStart: string,
) {
  const titles = new Map<string, { title: string; type: "habit" | "goal" }>();
  systems.forEach((system) => {
    system.routines.forEach((routine) => {
      titles.set(`routine:${routine.id}`, {
        title: routine.title,
        type: "habit",
      });
    });
    system.goals.forEach((goal) => {
      titles.set(`goal:${goal.id}`, {
        title: goal.title,
        type: "goal",
      });
    });
  });

  const [year, month, day] = weekStart.split("-").map(Number);
  const start = new Date(year, month - 1, day);

  return weeklyDayLabels.map((label, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const dateKey = toDateKey(date);
    const items = logs.flatMap((log) => {
      const key = log.routineId
        ? `routine:${log.routineId}`
        : log.goalId
          ? `goal:${log.goalId}`
          : "";
      const entity = titles.get(key);
      if (log.date !== dateKey || !entity) return [];

      return [
        {
          id: log.id,
          title:
            entity.type === "goal" && log.status === "completed"
              ? `${entity.title} progress yangilandi`
              : entity.title,
          type: entity.type,
          status: log.status,
          detail:
            entity.type === "goal" &&
            log.status === "completed" &&
            typeof log.actualAmount === "number"
              ? `${log.actualAmount}${typeof log.plannedAmount === "number" ? ` / ${log.plannedAmount}` : ""} ${log.unit ?? ""}`.trim()
              : undefined,
        },
      ];
    });
    const completedItems = items.filter((item) => item.status === "completed");
    const missedItems = items.filter((item) => item.status === "missed");

    return {
      date: dateKey,
      label: label.full,
      shortLabel: label.short,
      displayDate: `${String(date.getDate()).padStart(2, "0")}.${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`,
      count: items.length,
      completedCount: completedItems.length,
      missedCount: missedItems.length,
      completedItems,
      missedItems,
      items,
    };
  });
}

function getWeeklyGoalChanges(
  systems: System[],
  logs: System["completionLogs"],
  weekStart: string,
  weekEnd: string,
) {
  return systems
    .flatMap((system) =>
      system.goals.map((goal) => ({
        goal,
        systemId: system.id,
      })),
    )
    .flatMap(({ goal, systemId }) => {
      const goalLogs = logs
        .filter(
          (log) =>
            log.goalId === goal.id &&
            log.status === "completed" &&
            typeof log.actualAmount === "number",
        )
        .sort(
          (left, right) =>
            left.date.localeCompare(right.date) ||
            left.createdAt.localeCompare(right.createdAt),
        );
      const weeklyLogs = goalLogs.filter(
        (log) => log.date >= weekStart && log.date <= weekEnd,
      );
      const latestWeeklyLog = weeklyLogs.at(-1);

      if (!latestWeeklyLog || typeof latestWeeklyLog.actualAmount !== "number") {
        return [];
      }

      const previousLog = goalLogs
        .filter((log) => log.date < weekStart)
        .at(-1);
      const previousAmount =
        typeof previousLog?.actualAmount === "number"
          ? previousLog.actualAmount
          : weeklyLogs.length > 1 && typeof weeklyLogs[0].actualAmount === "number"
            ? weeklyLogs[0].actualAmount
            : null;

      if (previousAmount === latestWeeklyLog.actualAmount) {
        return [];
      }

      return [
        {
          goalId: goal.id,
          systemId,
          title: goal.title,
          previousAmount,
          currentAmount: latestWeeklyLog.actualAmount,
          unit: latestWeeklyLog.unit ?? goal.unit,
          lastUpdatedAt: latestWeeklyLog.createdAt,
        },
      ];
    })
    .sort((left, right) => right.lastUpdatedAt.localeCompare(left.lastUpdatedAt))
    .slice(0, 3);
}

function getRoutineInsight(
  systems: System[],
  logs: System["completionLogs"],
  status: "completed" | "missed",
  excludedRoutineId?: string,
) {
  const routineDetails = new Map(
    systems.flatMap((system) =>
      system.routines.map(
        (routine) =>
          [
            routine.id,
            {
              title: routine.title,
              iconKey: routine.iconKey,
              routine,
              system,
            },
          ] as const,
      ),
    ),
  );
  const counts = new Map<string, number>();

  logs.forEach((log) => {
    if (
      log.status !== status ||
      !log.routineId ||
      log.routineId === excludedRoutineId ||
      !routineDetails.has(log.routineId)
    ) {
      return;
    }

    const routineDetail = routineDetails.get(log.routineId);
    if (
      status === "missed" &&
      routineDetail &&
      !isRoutineScheduledOnDate(routineDetail.system, routineDetail.routine, log.date)
    ) {
      return;
    }

    counts.set(log.routineId, (counts.get(log.routineId) ?? 0) + 1);
  });

  const topRoutine = [...counts.entries()].sort(
    ([leftId, leftCount], [rightId, rightCount]) =>
      rightCount - leftCount || leftId.localeCompare(rightId),
  )[0];

  return {
    id: topRoutine?.[0],
    systemId: topRoutine ? routineDetails.get(topRoutine[0])?.system.id : undefined,
    value: topRoutine
      ? routineDetails.get(topRoutine[0])?.title ?? "Hali ma'lumot yo'q"
      : "Hali ma'lumot yo'q",
    iconKey: topRoutine ? routineDetails.get(topRoutine[0])?.iconKey : undefined,
    count: topRoutine?.[1] ?? 0,
    streak: topRoutine
      ? systems
          .flatMap((system) => system.routines)
          .find((routine) => routine.id === topRoutine[0])?.streak ?? 0
      : 0,
  };
}

function getWeakGoal(
  systems: System[],
  allLogs: System["completionLogs"],
  weekStart: string,
  excludedGoalId?: string,
) {
  const activeGoals = systems
    .flatMap((system) =>
      system.goals.map((goal) => ({
        goal,
        systemId: system.id,
      })),
    )
    .filter(
      ({ goal }) =>
        goal.id !== excludedGoalId &&
        goal.status === "active" &&
        goal.current < goal.target,
    );

  const weakestGoal = activeGoals
    .map(({ goal, systemId }) => {
      const latestGoalLog = allLogs
        .filter((log) => log.goalId === goal.id && log.status === "completed")
        .sort(
          (left, right) =>
            right.date.localeCompare(left.date) ||
            right.createdAt.localeCompare(left.createdAt),
        )[0];
      const referenceDate =
        latestGoalLog?.date ??
        goal.startDate ??
        goal.createdAt?.slice(0, 10) ??
        weekStart;
      const daysWithoutProgress = Math.max(
        1,
        Math.floor(
          (new Date().getTime() - new Date(`${referenceDate}T00:00:00`).getTime()) /
            86_400_000,
        ),
      );

      return { goal, systemId, daysWithoutProgress };
    })
    .filter(({ daysWithoutProgress }) => daysWithoutProgress >= 5)
    .sort(
      (left, right) =>
        right.daysWithoutProgress - left.daysWithoutProgress ||
        left.goal.id.localeCompare(right.goal.id),
    )[0];

  if (weakestGoal) {
    return {
      value: weakestGoal.goal.title,
      goalId: weakestGoal.goal.id,
      systemId: weakestGoal.systemId,
      meta: `${weakestGoal.daysWithoutProgress} kundan beri progress yangilanmagan`,
      hasIssue: true,
    };
  }

  return {
    value: "Hozircha sust maqsad yo‘q",
    goalId: undefined,
    systemId: undefined,
    meta: "",
    hasIssue: false,
  };
}

function GrowthSnapshotDetail({ systems }: { systems: System[] }) {
  const logs = getCompletionLogs(systems);
  const completedCount = logs.filter((log) => log.status === "completed").length;
  const score = logs.length ? Math.round((completedCount / logs.length) * 100) : null;

  if (score === null) {
    return <PanelEmptyState title="Hali ma'lumot yo'q" description="Kun bahosi completion loglar asosida ko'rinadi." icon={Sparkles} />;
  }

  return (
    <div className="space-y-4">
      <DetailGroup title="Kun bahosi">
        <div className="rounded-[24px] border border-violet-200/10 bg-white/[0.035] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-100/60">Barqarorlik</p>
          <p className="mt-2 text-4xl font-black text-white">{score}%</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{completedCount} / {logs.length} real log</p>
        </div>
      </DetailGroup>
    </div>
  );
}

function SystemsProgressDetail({ systems }: { systems: System[] }) {
  const goals = systems.flatMap((system) => system.goals.map((goal) => ({ ...goal, systemTitle: system.title })));

  if (!goals.length) {
    return <PanelEmptyState title="Hali maqsad qo'shilmagan" description="Maqsadlar yaratilganda tizim progressi shu yerda ko'rinadi." icon={Target} />;
  }

  return (
    <div className="space-y-4">
      <DetailGroup title={uz.progress.systemsProgress}>
        {goals.map((goal) => (
          <CompactInsight key={goal.id} label={goal.systemTitle} text={`${goal.title} · ${goal.current}/${goal.target} ${goal.unit}`} />
        ))}
      </DetailGroup>
    </div>
  );
}

function ConsistencyDetail({ systems }: { systems: System[] }) {
  const logs = getCompletionLogs(systems);

  if (!logs.length) {
    return <PanelEmptyState title="Hali ma'lumot yo'q" description="Barqarorlik xaritasi completion loglar asosida quriladi." icon={Flame} />;
  }

  return (
    <div className="space-y-4">
      <ConsistencyHeatmap logs={logs} />
    </div>
  );
}

function MissedPatternsDetail({ systems }: { systems: System[] }) {
  const missedLogs = getCompletionLogs(systems).filter((log) => log.status === "missed");

  if (!missedLogs.length) {
    return <PanelEmptyState title="Bajarilmagan loglar yo'q" description="Missed holatlar paydo bo'lsa shu yerda ko'rinadi." icon={History} />;
  }

  return (
    <DetailGroup title="Bajarilmaganlar">
      {missedLogs.map((log) => (
        <CompactInsight key={log.id} label={log.date} text={`${log.actualAmount ?? 0} / ${log.plannedAmount ?? 0} ${log.unit ?? ""}`} tone="danger" />
      ))}
    </DetailGroup>
  );
}

function EnergyInsightsDetail() {
  return <PanelEmptyState title="Hali ma'lumot yo'q" description="Energiya tahlili uchun real reset yoki reflection data kerak." icon={Zap} />;
}

function ScheduleSuggestionsDetail() {
  return <PanelEmptyState title="Hali tahlil yo'q" description="Jadval tavsiyalari real completion loglar va AI tahlil paydo bo'lganda ko'rinadi." icon={CalendarClock} />;
}

function getCompletionLogs(systems: System[]) {
  return systems.flatMap((system) => system.completionLogs);
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function CompactInsight({ label, text, tone = "default" }: { label: string; text: string; tone?: "default" | "danger" }) {
  return (
    <div className={`rounded-[22px] border p-3 ${tone === "danger" ? "border-[#FF3B30]/16 bg-[#FF3B30]/8" : "border-violet-200/10 bg-white/[0.035]"}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${tone === "danger" ? "text-[#FFD1CD]/70" : "text-violet-100/60"}`}>{label}</p>
      <p className="mt-1 text-sm font-bold leading-5 text-white">{text}</p>
    </div>
  );
}
