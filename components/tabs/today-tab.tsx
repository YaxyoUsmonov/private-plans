"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ChevronRight, ListFilter, Search, Zap } from "lucide-react";
import { FocusModeModal } from "@/components/focus/focus-mode-modal";
import { ReflectionModal } from "@/components/reflection/reflection-modal";
import { GoalProgressSheet } from "@/components/goals/goal-progress-sheet";
import { DateStrip } from "@/components/tabs/date-strip";
import { SystemDetailSheet } from "@/components/systems/system-detail-sheet";
import { SystemSection } from "@/components/systems/system-section";
import { SystemRowEntityIcon } from "@/components/systems/system-row";
import { DetailPanel, PanelEmptyState } from "@/components/ui/detail-panel";
import {
  applyAutoMissedLogs,
  toGoalDetailView,
  toRoutineDetailView,
  toTodaySystemViews,
  type ActionStatus,
  type System,
  type TodaySystemView,
  type WeekdayKey,
} from "@/lib/mock-data";
import { uz } from "@/lib/uz";
import { toDateKey } from "@/lib/date-utils";

type TodayTabProps = {
  systems: System[];
  onSystemsChange: React.Dispatch<React.SetStateAction<System[]>>;
  onStatusPersist: (
    system: System,
    action: System["dailyActions"][number],
    date: string,
    status: ActionStatus,
    reflectionBody?: string,
  ) => void;
  onNamePersist: (view: TodaySystemView, name: string) => void;
  onSchedulePersist: (
    view: TodaySystemView,
    cadence: string,
    days: WeekdayKey[],
  ) => void;
  onGoalProgressPersist: (input: {
    goalId: string;
    systemId: string;
    date: string;
    currentAmount: number;
    targetAmount: number;
    unit: string;
  }) => void;
};

type TodayFilter =
  | "all"
  | "habits"
  | "goals"
  | "planned"
  | "completed";

const todayFilterOptions: Array<{ value: TodayFilter; label: string }> = [
  { value: "all", label: "Barchasi" },
  { value: "habits", label: "Odatlar" },
  { value: "goals", label: "Maqsadlar" },
  { value: "planned", label: "Kutilayotgan" },
  { value: "completed", label: "Bajarilgan" },
];

function optionalTags(value: unknown) {
  if (!value || typeof value !== "object" || !("tags" in value)) return [];

  const tags = (value as { tags?: unknown }).tags;
  return Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === "string")
    : [];
}

function searchMatchRank(
  query: string,
  item: {
    name: string;
    category: string;
    systemName: string;
    tags: string[];
  },
) {
  if (item.name.toLocaleLowerCase("uz").includes(query)) return 0;
  if (item.category.toLocaleLowerCase("uz").includes(query)) return 1;
  if (item.systemName.toLocaleLowerCase("uz").includes(query)) return 2;
  if (item.tags.some((tag) => tag.toLocaleLowerCase("uz").includes(query))) {
    return 3;
  }

  return Number.POSITIVE_INFINITY;
}

export function TodayTab({
  systems,
  onSystemsChange,
  onStatusPersist,
  onNamePersist,
  onSchedulePersist,
  onGoalProgressPersist,
}: TodayTabProps) {
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [reflectionSystem, setReflectionSystem] = useState<TodaySystemView | null>(null);
  const [detailSystem, setDetailSystem] = useState<TodaySystemView | null>(null);
  const [progressGoal, setProgressGoal] = useState<TodaySystemView | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearchDetail, setPendingSearchDetail] =
    useState<TodaySystemView | null>(null);
  const [activeFilter, setActiveFilter] = useState<TodayFilter>("all");
  const [rowLayoutMotionReady, setRowLayoutMotionReady] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement | null>(null);
  const todaySystems = toTodaySystemViews(systems, selectedDate);
  const activeCount = todaySystems.length;
  const completedCount = todaySystems.filter((system) => system.today.status === "completed").length;
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("uz");
  const visibleSystems = todaySystems.filter((system) => {
    if (activeFilter === "habits") return system.type === "habit";
    if (activeFilter === "goals") return system.type === "goal";
    if (activeFilter === "planned") return system.today.status === "planned";
    if (activeFilter === "completed") return system.today.status === "completed";
    return true;
  });
  const searchableItems = systems.flatMap((system) => {
    const systemTags = optionalTags(system);

    return [
      ...system.routines.flatMap((routine) => {
      const view = toRoutineDetailView(system, routine.id);
        return view
          ? [
              {
                view,
                name: view.name,
                category: system.category,
                systemName: system.title,
                tags: [...optionalTags(routine), ...systemTags],
              },
            ]
          : [];
      }),
      ...system.goals.flatMap((goal) => {
        const view = toGoalDetailView(system, goal.id);
        return view
          ? [
              {
                view,
                name: view.name,
                category: system.category,
                systemName: system.title,
                tags: [...optionalTags(goal), ...systemTags],
              },
            ]
          : [];
      }),
    ];
  });
  const searchResults = normalizedSearchQuery
    ? searchableItems
        .map((item, index) => ({
          ...item,
          index,
          rank: searchMatchRank(normalizedSearchQuery, item),
        }))
        .filter((item) => Number.isFinite(item.rank))
        .sort((left, right) => left.rank - right.rank || left.index - right.index)
        .map((item) => item.view)
    : searchableItems.map((item) => item.view);
  const pendingSystems = visibleSystems
    .filter((system) => system.today.status === "planned")
    .sort((left, right) => {
      const order = { habit: 0, system: 1, goal: 2 };
      return order[left.type] - order[right.type];
    });
  const completedSystems = visibleSystems.filter((system) => system.today.status === "completed");
  const missedSystems = visibleSystems.filter((system) => system.today.status === "missed");
  const hasListConstraint = activeFilter !== "all";

  useEffect(() => {
    if (!selectedDate) return;

    const timer = window.setTimeout(() => {
      setRowLayoutMotionReady(true);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [selectedDate]);

  useEffect(() => {
    const todayKey = toDateKey(new Date());
    onSystemsChange((current) => applyAutoMissedLogs(current, todayKey));
  }, [onSystemsChange]);

  useEffect(() => {
    if (!selectedDate) return;

    const todayKey = toDateKey(new Date());
    onSystemsChange((current) => applyAutoMissedLogs(current, todayKey, selectedDate));
  }, [onSystemsChange, selectedDate]);

  useEffect(() => {
    if (!filterOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !filterPopoverRef.current?.contains(target)
      ) {
        setFilterOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [filterOpen]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleOpenItem = useCallback((view: TodaySystemView) => {
    setDetailSystem(view);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setPendingSearchDetail(null);
  }, []);

  const openSearchResult = useCallback((view: TodaySystemView) => {
    setPendingSearchDetail(view);
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const updateGoalProgress = useCallback(
    (view: TodaySystemView, currentAmount: number) => {
      if (!view.goalId || !view.goal) return;

      const goal = view.goal;
      const actionDate = selectedDate || toDateKey(new Date());
      const now = new Date().toISOString();

      onSystemsChange((current) =>
        current.map((system): System => {
          if (system.id !== view.systemId) return system;

          const completionLogs = system.completionLogs.filter(
            (log) => !(log.goalId === view.goalId && log.date === actionDate),
          );

          return {
            ...system,
            goals: system.goals.map((goal) =>
              goal.id === view.goalId ? { ...goal, current: currentAmount } : goal,
            ),
            completionLogs: [
              ...completionLogs,
              {
                id: `goal-progress-${view.goalId}-${actionDate}`,
                systemId: view.systemId,
                goalId: view.goalId,
                dailyActionId: `goal-${view.goalId}`,
                date: actionDate,
                status: "completed",
                source: "user",
                plannedAmount: goal.target,
                actualAmount: currentAmount,
                unit: goal.unit,
                createdAt: now,
              },
            ],
            updatedAt: now,
          };
        }),
      );
      onGoalProgressPersist({
        goalId: view.goalId,
        systemId: view.systemId,
        date: actionDate,
        currentAmount,
        targetAmount: goal.target,
        unit: goal.unit,
      });
      setProgressGoal(null);
    },
    [onGoalProgressPersist, onSystemsChange, selectedDate],
  );

  const updateSystemStatus = useCallback((systemId: string, status: ActionStatus, reflectionBody = "") => {
    const sourceSystem = systems.find((system) =>
      system.dailyActions.some((action) => action.id === systemId),
    );
    const sourceAction = sourceSystem?.dailyActions.find(
      (action) => action.id === systemId,
    );
    const actionDate = selectedDate || toDateKey(new Date());
    if (sourceSystem && sourceAction) {
      onStatusPersist(
        sourceSystem,
        sourceAction,
        actionDate,
        status,
        reflectionBody,
      );
    }

    onSystemsChange((current) =>
      current.map((system): System => {
        const action = system.dailyActions.find((item) => item.id === systemId);
        if (!action) return system;

        const now = new Date().toISOString();
        const actualAmount = status === "completed" ? action.plannedAmount : status === "missed" ? 0 : undefined;
        const withoutTodayLog = system.completionLogs.filter((log) => !(log.dailyActionId === action.id && log.date === actionDate));
        const nextLogs =
          status === "planned"
            ? withoutTodayLog
            : [
                ...withoutTodayLog,
                {
                  id: `log-${action.id}-${actionDate}`,
                  systemId: system.id,
                  routineId: action.routineId,
                  goalId: action.goalId,
                  dailyActionId: action.id,
                  date: actionDate,
                  status,
                  source: "user" as const,
                  plannedAmount: action.plannedAmount,
                  actualAmount,
                  unit: action.unit,
                  createdAt: now,
                },
              ];
        const trimmedReflection = reflectionBody.trim();
        const nextReflections = trimmedReflection
          ? [
              ...system.reflections,
              {
                id: `reflection-${action.id}-${Date.now()}`,
                systemId: system.id,
                routineId: action.routineId,
                goalId: action.goalId,
                dailyActionId: action.id,
                date: actionDate,
                status,
                body: trimmedReflection,
                createdAt: now,
              },
            ]
          : system.reflections;

        return {
          ...system,
          completionLogs: nextLogs,
          reflections: nextReflections,
          updatedAt: now,
        };
      }),
    );
  }, [onStatusPersist, onSystemsChange, selectedDate, systems]);

  const renameDetailSystem = useCallback((view: TodaySystemView, name: string) => {
    onNamePersist(view, name);
    onSystemsChange((current) =>
      current.map((system): System => {
        if (system.id !== view.systemId) return system;

        const now = new Date().toISOString();

        return {
          ...system,
          title: system.id === view.id ? name : system.title,
          routines: system.routines.map((routine) => (routine.id === view.routineId ? { ...routine, title: name } : routine)),
          goals: system.goals.map((goal) => (goal.id === view.goalId ? { ...goal, title: name } : goal)),
          dailyActions: system.dailyActions.map((action) => (action.id === view.id ? { ...action, title: name } : action)),
          updatedAt: now,
        };
      }),
    );
    setDetailSystem((current) => (current?.id === view.id ? { ...current, name } : current));
  }, [onNamePersist, onSystemsChange]);

  const updateDetailSchedule = useCallback((view: TodaySystemView, days: WeekdayKey[]) => {
    const nextCadence = cadenceFromDays(days);
    onSchedulePersist(view, nextCadence, days);

    onSystemsChange((current) =>
      current.map((system): System => {
        if (system.id !== view.systemId) return system;

        const now = new Date().toISOString();

        return {
          ...system,
          cadence: view.id === system.id ? nextCadence : system.cadence,
          scheduleDays: view.id === system.id ? days : system.scheduleDays,
          routines: system.routines.map((routine) =>
            routine.id === view.routineId ? { ...routine, cadence: nextCadence, scheduleDays: days } : routine,
          ),
          dailyActions: system.dailyActions.map((action) =>
            action.id === view.id ? { ...action, cadence: nextCadence, scheduleDays: days } : action,
          ),
          updatedAt: now,
        };
      }),
    );
    setDetailSystem((current) => (current?.id === view.id ? { ...current, cadence: nextCadence, scheduleDays: days } : current));
  }, [onSchedulePersist, onSystemsChange]);

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <header className="pt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col items-start">
              <h1 className="text-[34px] font-black leading-none tracking-tight text-white">{uz.today.title}</h1>
              <p
                className="plans-static-status-badge mt-2.5 inline-flex h-6 min-w-[76px] items-center justify-center rounded-full bg-[#3A025B] px-3 text-[11px] font-bold text-white"
              >
                {completedCount}/{activeCount} {uz.today.done}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
              type="button"
              aria-label="Qidirish"
              onClick={() => {
                setFilterOpen(false);
                setSearchOpen(true);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-white transition duration-200 hover:border-[#7F00FF]/45 hover:bg-[#3A025B] active:scale-95 ${
                normalizedSearchQuery
                  ? "border-[#7F00FF]/45 bg-[#3A025B]"
                  : "border-white/[0.08] bg-white/[0.035]"
              }`}
            >
                <Search size={17} strokeWidth={2.1} />
              </button>
              <div ref={filterPopoverRef} className="relative">
                <button
                  type="button"
                  aria-label="Filtrlash"
                  aria-expanded={filterOpen}
                  aria-haspopup="menu"
                  onClick={() => {
                    closeSearch();
                    setFilterOpen((current) => !current);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-white transition duration-200 hover:border-[#7F00FF]/45 hover:bg-[#3A025B] active:scale-95 ${
                    activeFilter !== "all"
                      ? "border-[#7F00FF]/45 bg-[#3A025B]"
                      : "border-white/[0.08] bg-white/[0.035]"
                  }`}
                >
                  <ListFilter size={17} strokeWidth={2.1} />
                </button>

                <AnimatePresence>
                  {filterOpen ? (
                    <motion.div
                      role="menu"
                      aria-label="Kerak filtrlari"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.985 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="analytics-period-popover absolute right-0 top-12 z-40 w-[208px] overflow-hidden p-1.5"
                    >
                      {todayFilterOptions.map((option) => {
                        const selected = option.value === activeFilter;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selected}
                            onClick={() => setActiveFilter(option.value)}
                            className={`flex h-10 w-full items-center rounded-[11px] px-3 text-left text-[11px] font-black transition ${
                              selected
                                ? "bg-[#3A025B] text-white"
                                : "bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <DateStrip selectedDate={selectedDate} onSelect={handleDateSelect} />
      </div>

      <FocusCard onClick={() => setFocusOpen(true)} />

      {selectedDate ? (
        <LayoutGroup>
          <div className="space-y-0">
            {hasListConstraint && visibleSystems.length === 0 ? (
              <div className="pt-2">
                <PanelEmptyState title="Mos element topilmadi" compact />
              </div>
            ) : activeCount === 0 ? (
              <SystemSection
                title="Kutilayotgan"
                accent="pending"
                systems={pendingSystems}
                enableRowLayoutAnimation={rowLayoutMotionReady}
                onSwipeReflect={setReflectionSystem}
                onSwipeGoalProgress={setProgressGoal}
                onOpenDetails={handleOpenItem}
              />
            ) : (
              <>
                {pendingSystems.length > 0 ? (
                  <SystemSection
                    title="Kutilayotgan"
                    accent="pending"
                    systems={pendingSystems}
                    enableRowLayoutAnimation={rowLayoutMotionReady}
                    onSwipeReflect={setReflectionSystem}
                    onSwipeGoalProgress={setProgressGoal}
                    onOpenDetails={handleOpenItem}
                  />
                ) : null}
                {completedSystems.length > 0 ? (
                  <SystemSection
                    title="Bajarildi"
                    accent="completed"
                    systems={completedSystems}
                    enableRowLayoutAnimation={rowLayoutMotionReady}
                    onUndo={(system) => updateSystemStatus(system.id, "planned")}
                    onOpenDetails={handleOpenItem}
                  />
                ) : null}
                {missedSystems.length > 0 ? (
                  <SystemSection
                    title="Bajarilmadi"
                    accent="missed"
                    systems={missedSystems}
                    enableRowLayoutAnimation={rowLayoutMotionReady}
                    onOpenDetails={handleOpenItem}
                  />
                ) : null}
              </>
            )}
          </div>
        </LayoutGroup>
      ) : null}

      <DetailPanel
        open={searchOpen}
        title="Izlash"
        mode="sheet"
        showBack={false}
        showClose
        centerTitle
        onClose={closeSearch}
        onExitComplete={() => {
          if (!pendingSearchDetail) return;
          setDetailSystem(pendingSearchDetail);
          setPendingSearchDetail(null);
        }}
      >
        <div className="space-y-3">
          <label className="relative block">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Kerakdan izlash..."
              className="h-12 w-full rounded-[18px] border border-white/[0.08] bg-white/[0.035] pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#7F00FF]/50"
            />
          </label>
          {searchResults.length === 0 ? (
            <PanelEmptyState title="Hech narsa topilmadi" compact />
          ) : (
            <div className="overflow-hidden rounded-[18px] border border-white/[0.07] bg-white/[0.035] divide-y divide-white/[0.06]">
              {searchResults.map((item) => {
                return (
                  <button
                    key={`${item.type}-${item.systemId}-${item.id}`}
                    type="button"
                    onClick={() => openSearchResult(item)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition duration-200 hover:bg-white/[0.045] active:bg-white/[0.06]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                      <SystemRowEntityIcon system={item} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-black text-white">
                      {item.name}
                    </span>
                    <ChevronRight
                      size={17}
                      strokeWidth={2}
                      className="shrink-0 text-slate-600"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DetailPanel>

      <FocusModeModal open={focusOpen} onClose={() => setFocusOpen(false)} />
      <ReflectionModal
        system={reflectionSystem}
        onClose={() => setReflectionSystem(null)}
        onSave={(systemId, result, reflectionBody) => {
          updateSystemStatus(systemId, result === "completed" ? "completed" : "missed", reflectionBody);
          setReflectionSystem(null);
        }}
      />
      <GoalProgressSheet
        goalView={progressGoal}
        onClose={() => setProgressGoal(null)}
        onSave={(view, value) => updateGoalProgress(view, value)}
      />
      <SystemDetailSheet
        system={detailSystem}
        onClose={() => setDetailSystem(null)}
        onStatusChange={updateSystemStatus}
        onRename={renameDetailSystem}
        onScheduleChange={updateDetailSchedule}
      />
    </div>
  );
}

const scheduleWeekdays: WeekdayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function cadenceFromDays(days: WeekdayKey[]) {
  const normalized = scheduleWeekdays.filter((day) => days.includes(day));
  return normalized.length === scheduleWeekdays.length ? "Har kuni" : "Haftalik";
}

function FocusCard({ onClick }: { onClick: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="plans-focus-button flex min-h-[58px] w-full items-center justify-between rounded-[22px] border px-4 py-2.5 text-left transition duration-300 active:scale-[0.99]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-black text-white">{uz.today.focusMode}</span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/18 bg-violet-400/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)]">
        <Zap size={17} />
      </span>
    </motion.button>
  );
}
