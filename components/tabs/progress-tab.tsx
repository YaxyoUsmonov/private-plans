"use client";

import { useCallback, useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  CalendarClock,
  ChevronRight,
  Flame,
  History,
  Layers3,
  MessageSquareText,
  Sparkles,
  Target,
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
import { applyCreationPayload, iconRegistry, toRoutineDetailView, toSystemListViews, type CreateSystemPayload, type System, type SystemListView } from "@/lib/mock-data";
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

const progressSections = [
  { key: "systems-list", title: uz.progress.systems, subtitle: uz.progress.systemsSubtitle, icon: Layers3 },
  { key: "ai", title: uz.progress.aiCoach, subtitle: uz.progress.aiSubtitle, icon: Bot },
  { key: "weekly", title: uz.progress.weeklyReview, subtitle: uz.progress.weeklySubtitle, icon: MessageSquareText },
  { key: "snapshot", title: uz.progress.growthSnapshot, subtitle: uz.progress.snapshotSubtitle, icon: Sparkles },
  { key: "systems", title: uz.progress.systemsProgress, subtitle: uz.progress.systemsProgressSubtitle, icon: Target },
  { key: "consistency", title: uz.progress.consistency, subtitle: uz.progress.consistencySubtitle, icon: Flame },
  { key: "missed", title: uz.progress.missedPatterns, subtitle: uz.progress.missedSubtitle, icon: BookOpen },
  { key: "energy", title: uz.progress.energyInsights, subtitle: uz.progress.energySubtitle, icon: Zap },
  { key: "schedule", title: uz.progress.scheduleSuggestions, subtitle: uz.progress.scheduleSubtitle, icon: CalendarClock },
] satisfies Array<{ key: ProgressSectionKey; title: string; subtitle: string; icon: typeof Bot }>;

const systemDetailPages = ["Tizimlar", "Odatlar", "Maqsadlar"] as const;

type ProgressTabProps = {
  systems: System[];
  onSystemsChange: React.Dispatch<React.SetStateAction<System[]>>;
};

export function ProgressTab({ systems, onSystemsChange }: ProgressTabProps) {
  const [activeSection, setActiveSection] = useState<ProgressSectionKey | null>(null);
  const activeMeta = progressSections.find((section) => section.key === activeSection) ?? null;
  const systemViews = toSystemListViews(systems);

  return (
    <div className="space-y-5 pt-2">
      <header>
        <h1 className="text-[34px] font-black leading-none tracking-tight text-white">{uz.progress.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{uz.progress.subtitle}</p>
      </header>

      <section className="space-y-2">
        {progressSections.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className="flex min-h-[72px] w-full items-center gap-3 rounded-[24px] border border-violet-200/10 bg-white/[0.035] px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.055)] transition duration-300 active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">{section.title}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{section.subtitle}</span>
              </span>
              <ChevronRight size={17} className="shrink-0 text-slate-500" />
            </button>
          );
        })}
      </section>

      <DetailPanel
        open={Boolean(activeMeta)}
        title={activeMeta?.title ?? ""}
        subtitle={activeMeta?.subtitle}
        icon={activeMeta?.icon}
        mode="drawer"
        onClose={() => setActiveSection(null)}
      >
        {activeMeta?.key === "systems-list" ? <ProgressSystemsDetail systems={systems} systemViews={systemViews} onSystemsChange={onSystemsChange} /> : null}
        {activeMeta?.key === "ai" ? <AiCoachDetail /> : null}
        {activeMeta?.key === "weekly" ? <WeeklyReviewDetail systems={systems} /> : null}
        {activeMeta?.key === "snapshot" ? <GrowthSnapshotDetail systems={systems} /> : null}
        {activeMeta?.key === "systems" ? <SystemsProgressDetail systems={systems} /> : null}
        {activeMeta?.key === "consistency" ? <ConsistencyDetail systems={systems} /> : null}
        {activeMeta?.key === "missed" ? <MissedPatternsDetail systems={systems} /> : null}
        {activeMeta?.key === "energy" ? <EnergyInsightsDetail /> : null}
        {activeMeta?.key === "schedule" ? <ScheduleSuggestionsDetail /> : null}
      </DetailPanel>
    </div>
  );
}

function ProgressSystemsDetail({
  systems,
  systemViews,
  onSystemsChange,
}: {
  systems: System[];
  systemViews: SystemListView[];
  onSystemsChange: React.Dispatch<React.SetStateAction<System[]>>;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [habitFlowSystemId, setHabitFlowSystemId] = useState<string | null>(null);
  const [routineDetail, setRoutineDetail] = useState<{ systemId: string; routineId: string } | null>(null);
  const pendingHabitSystemRef = useRef<string | null>(null);
  const pendingRoutineRef = useRef<{ systemId: string; routineId: string } | null>(null);
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
    [onSystemsChange],
  );

  const deleteSelectedSystem = useCallback(
    (systemId: string) => {
      onSystemsChange((current) => current.filter((system) => system.id !== systemId));
      setSelectedSystemId(null);
    },
    [onSystemsChange],
  );

  const createHabitForSelectedSystem = useCallback(
    (payload: CreateSystemPayload) => {
      onSystemsChange((current) => applyCreationPayload(current, payload));
    },
    [onSystemsChange],
  );

  const requestAddHabit = useCallback((systemId: string) => {
    pendingHabitSystemRef.current = systemId;
    setSelectedSystemId(null);
  }, []);

  const requestHabitDetail = useCallback((systemId: string, routineId: string) => {
    pendingRoutineRef.current = { systemId, routineId };
    setSelectedSystemId(null);
  }, []);

  const handleDetailExitComplete = useCallback(() => {
    const routine = pendingRoutineRef.current;
    pendingRoutineRef.current = null;
    if (routine) {
      setRoutineDetail(routine);
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
    pendingDetailSystemRef.current = routineDetail?.systemId ?? null;
    setRoutineDetail(null);
  }, [routineDetail]);

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
            <SystemRoutinesPage systems={systems} />
          </SwipePage>
          <SwipePage>
            <SystemGoalsPage systems={systems} />
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

function SystemRoutinesPage({ systems }: { systems: System[] }) {
  const hasRoutines = systems.some((system) => system.routines.length > 0);

  if (!hasRoutines) {
    return <PanelEmptyState title="Hali odatlar yo'q" description="Tizim ichida odat yaratilganda shu yerda ko'rinadi." icon={BookOpen} />;
  }

  return (
    <div className="space-y-3">
      {systems.map((system) => (
        <div key={system.id} className="space-y-2">
          <h3 className="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-violet-100/70">{system.title}</h3>
          {system.routines.map((routine) => {
            const Icon = iconRegistry[routine.iconKey];

            return (
              <CompactRow
                key={routine.id}
                icon={<Icon size={17} />}
                title={routine.title}
                subtitle={`${routine.cadence}${routine.targetAmount ? ` · ${routine.targetAmount} ${routine.unit ?? ""}` : ""}`}
                meta={`${routine.streak} kun`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SystemGoalsPage({ systems }: { systems: System[] }) {
  const hasGoals = systems.some((system) => system.goals.length > 0);

  if (!hasGoals) {
    return <PanelEmptyState title="Hali maqsad yo'q" description="Tizim ichida maqsad yaratilganda shu yerda ko'rinadi." icon={Target} />;
  }

  return (
    <div className="space-y-3">
      {systems.map((system) =>
        system.goals.length ? (
          <div key={system.id} className="space-y-2">
            <h3 className="px-1 text-[11px] font-black uppercase tracking-[0.14em] text-violet-100/70">{system.title}</h3>
            {system.goals.map((goal) => (
              <CompactRow
                key={goal.id}
                icon={<Target size={17} />}
                title={goal.title}
                subtitle={`${goal.current} / ${goal.target} ${goal.unit}`}
                meta={goal.status === "completed" ? "Bajarildi" : "Faol"}
              />
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}

function CompactRow({
  icon,
  title,
  subtitle,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  meta?: string;
}) {
  return (
    <div className="flex min-h-[68px] items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3 py-2.5">
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

function WeeklyReviewDetail({ systems }: { systems: System[] }) {
  const logs = getCompletionLogs(systems);
  const completedCount = logs.filter((log) => log.status === "completed").length;
  const missedCount = logs.filter((log) => log.status === "missed").length;

  if (!logs.length) {
    return <PanelEmptyState title="Tahlil uchun hali yetarli ma'lumot yo'q" description="Completion loglar paydo bo'lganda haftalik tahlil shu yerda ko'rinadi." icon={MessageSquareText} />;
  }

  return (
    <div className="space-y-4">
      <DetailGroup title={uz.progress.weeklyReview}>
        <StatGrid stats={[[uz.common.completed, String(completedCount)], [uz.common.missed, String(missedCount)], ["Jami", String(logs.length)]]} />
      </DetailGroup>
    </div>
  );
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

function StatGrid({ stats }: { stats: Array<[string, string]> }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-[18px] border border-violet-200/10 bg-white/[0.035] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
          <p className="mt-1 text-lg font-black text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
