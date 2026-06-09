"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Zap } from "lucide-react";
import { FocusModeModal } from "@/components/focus/focus-mode-modal";
import { ReflectionModal } from "@/components/reflection/reflection-modal";
import { DateStrip } from "@/components/tabs/date-strip";
import { SystemDetailSheet } from "@/components/systems/system-detail-sheet";
import { SystemSection } from "@/components/systems/system-section";
import { applyAutoMissedLogs, toTodaySystemViews, type ActionStatus, type System, type TodaySystemView, type WeekdayKey } from "@/lib/mock-data";
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
};

export function TodayTab({
  systems,
  onSystemsChange,
  onStatusPersist,
  onNamePersist,
  onSchedulePersist,
}: TodayTabProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [reflectionSystem, setReflectionSystem] = useState<TodaySystemView | null>(null);
  const [detailSystem, setDetailSystem] = useState<TodaySystemView | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [rowLayoutMotionReady, setRowLayoutMotionReady] = useState(false);
  const todaySystems = toTodaySystemViews(systems, selectedDate);
  const activeCount = todaySystems.length;
  const completedCount = todaySystems.filter((system) => system.today.status === "completed").length;
  const pendingSystems = todaySystems.filter((system) => system.today.status === "planned");
  const completedSystems = todaySystems.filter((system) => system.today.status === "completed");
  const missedSystems = todaySystems.filter((system) => system.today.status === "missed");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = new Date();
      setSelectedDate(toDateKey(now));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

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

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

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
      <header className="pt-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-black leading-none tracking-tight text-white">{uz.today.title}</h1>
            <p className="mt-2 inline-flex rounded-full border border-violet-200/12 bg-white/[0.04] px-3 py-1 text-[11px] font-black text-violet-100">
              {uz.today.consistency}
            </p>
          </div>
          <div className="mb-0.5 rounded-full border border-violet-200/12 bg-white/[0.045] px-3 py-2 text-xs font-bold text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]">
            {completedCount}/{activeCount} {uz.today.done}
          </div>
        </div>
      </header>

      <DateStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

      <FocusCard onClick={() => setFocusOpen(true)} />

      {selectedDate ? (
        <LayoutGroup>
          <div className="space-y-0">
            {activeCount === 0 ? (
              <SystemSection
                title="Kutilayotgan"
                accent="pending"
                systems={pendingSystems}
                enableRowLayoutAnimation={rowLayoutMotionReady}
                onSwipeReflect={setReflectionSystem}
                onOpenDetails={setDetailSystem}
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
                    onOpenDetails={setDetailSystem}
                  />
                ) : null}
                {completedSystems.length > 0 ? (
                  <SystemSection
                    title="Bajarildi"
                    accent="completed"
                    systems={completedSystems}
                    enableRowLayoutAnimation={rowLayoutMotionReady}
                    onUndo={(system) => updateSystemStatus(system.id, "planned")}
                    onOpenDetails={setDetailSystem}
                  />
                ) : null}
                {missedSystems.length > 0 ? (
                  <SystemSection
                    title="Bajarilmadi"
                    accent="missed"
                    systems={missedSystems}
                    enableRowLayoutAnimation={rowLayoutMotionReady}
                    onOpenDetails={setDetailSystem}
                  />
                ) : null}
              </>
            )}
          </div>
        </LayoutGroup>
      ) : null}

      <FocusModeModal open={focusOpen} onClose={() => setFocusOpen(false)} />
      <ReflectionModal
        system={reflectionSystem}
        onClose={() => setReflectionSystem(null)}
        onSave={(systemId, result, reflectionBody) => {
          updateSystemStatus(systemId, result === "completed" ? "completed" : "missed", reflectionBody);
          setReflectionSystem(null);
        }}
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
