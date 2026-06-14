"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, Bell, Calendar, Check, ChevronLeft, ChevronRight, Copy, Download, Layers3, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DetailTabNavigator } from "@/components/ui/detail-tab-navigator";
import { GoalDetailSheet } from "@/components/systems/goal-detail-sheet";
import { DetailSettingsAction, DetailSettingsGroup, DetailSettingsRow } from "@/components/systems/detail-settings-ui";
import { isTodaySystemViewScheduledOnDate, type CompletionLog, type TodaySystemView, type WeekdayKey } from "@/lib/mock-data";
import { sheetSpring } from "@/lib/motion";
import { useBottomSheetDrag } from "@/components/ui/use-bottom-sheet-drag";

type SystemDetailSheetProps = {
  system: TodaySystemView | null;
  onClose: () => void;
  onExitComplete?: () => void;
  onStatusChange: (systemId: string, status: "planned" | "completed" | "missed") => void;
  onRename?: (system: TodaySystemView, name: string) => void;
  onScheduleChange?: (system: TodaySystemView, days: WeekdayKey[]) => void;
};

type SystemDetailSheetShellProps = {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel: string;
  direction?: "bottom" | "right";
  zIndex?: string;
  onPointerDownCapture?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUpCapture?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancelCapture?: (event: React.PointerEvent<HTMLElement>) => void;
  onTouchStartCapture?: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchEndCapture?: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchCancelCapture?: (event: React.TouchEvent<HTMLElement>) => void;
};

const pages = ["Diagramma", "Tarix", "Izohlar", "Sozlamalar"] as const;
const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const weekdayLabels = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];

const statusText = {
  planned: "Kutilayotgan",
  completed: "Bajarildi",
  missed: "Bajarilmadi",
};

const statusClass = {
  planned: "border-violet-200/14 bg-violet-400/10 text-violet-100",
  completed: "border-[#25EB2F]/24 bg-[#25EB2F]/10 text-[#C9FFD0]",
  missed: "border-[#FF3B30]/24 bg-[#FF3B30]/10 text-[#FFD1CD]",
};

export function SystemDetailSheet({
  system,
  onClose,
  onExitComplete,
  onStatusChange,
  onRename,
  onScheduleChange,
}: SystemDetailSheetProps) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {system ? (
        system.goalId && system.goal ? (
          <GoalDetailSheet
            key={system.id}
            system={system}
            onClose={onClose}
            onRename={onRename}
          />
        ) : (
          <SystemDetailSheetContent
            key={system.id}
            system={system}
            onClose={onClose}
            onStatusChange={onStatusChange}
            onRename={onRename}
            onScheduleChange={onScheduleChange}
          />
        )
      ) : null}
    </AnimatePresence>
  );
}

export function SystemDetailSheetShell({
  children,
  onClose,
  ariaLabel,
  direction = "bottom",
  zIndex = "z-50",
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerCancelCapture,
  onTouchStartCapture,
  onTouchEndCapture,
  onTouchCancelCapture,
}: SystemDetailSheetShellProps) {
  const { dragControls, handleDragEnd, startDrag } = useBottomSheetDrag(onClose);
  const sheetInitial = direction === "right" ? { x: "100%" } : { y: "100%" };
  const sheetAnimate = direction === "right" ? { x: 0 } : { y: 0 };
  const sheetExit = direction === "right" ? { x: "100%" } : { y: "100%" };

  return (
    <motion.div
      className={`plans-overlay pointer-events-auto fixed inset-0 ${zIndex}`}
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.01 }}
    >
      <motion.button
        type="button"
        aria-label={ariaLabel}
        className="absolute inset-0 touch-manipulation bg-black/64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={onClose}
      />

      <motion.section
        className="absolute inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+44px)] mx-auto flex max-w-md flex-col overflow-hidden rounded-t-[34px] border border-white/[0.06] bg-[#11162A]"
        initial={sheetInitial}
        animate={sheetAnimate}
        exit={sheetExit}
        transition={sheetSpring}
        onPointerDownCapture={onPointerDownCapture}
        onPointerUpCapture={onPointerUpCapture}
        onPointerCancelCapture={onPointerCancelCapture}
        onTouchStartCapture={onTouchStartCapture}
        onTouchEndCapture={onTouchEndCapture}
        onTouchCancelCapture={onTouchCancelCapture}
        drag={direction === "bottom" ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "pan-y" }}
      >
        {direction === "bottom" ? (
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
        {children}
      </motion.section>
    </motion.div>
  );
}

function SystemDetailSheetContent({
  system,
  onClose,
  onRename,
  onScheduleChange,
}: {
  system: TodaySystemView;
  onClose: () => void;
  onStatusChange: SystemDetailSheetProps["onStatusChange"];
  onRename?: SystemDetailSheetProps["onRename"];
  onScheduleChange?: SystemDetailSheetProps["onScheduleChange"];
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setPageIndex((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight") setPageIndex((current) => Math.min(pages.length - 1, current + 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, system]);

  const Icon = system.icon;
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

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      resolveSwipe(dx, dy);
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
      if (!start) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      resolveSwipe(touch.clientX - start.x, touch.clientY - start.y);
    },
    [resolveSwipe],
  );

  const handleTouchCancel = useCallback(() => {
    touchStartRef.current = null;
    swipeHandledRef.current = false;
  }, []);

  return (
    <>
          <SystemDetailSheetShell
            ariaLabel="Task tafsilotini yopish"
            onClose={onClose}
            onPointerDownCapture={handlePointerDown}
            onPointerUpCapture={handlePointerUp}
            onPointerCancelCapture={handlePointerCancel}
            onTouchStartCapture={handleTouchStart}
            onTouchEndCapture={handleTouchEnd}
            onTouchCancelCapture={handleTouchCancel}
          >
            <header className="px-4 pb-3 pt-4">
              <div className="flex items-start gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
                    <Icon size={21} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black text-white">{system.name}</h2>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <DetailTabNavigator pages={pages} pageIndex={pageIndex} onChange={setPageIndex} />
              </div>
            </header>

            <div
              className="flex-1 overflow-hidden"
            >
              <motion.div
                className="flex h-full"
                animate={{ x: `-${pageIndex * 100}%` }}
                transition={sheetSpring}
              >
                <SheetPage scroll={false}>
                  <DiagramPage
                    system={system}
                    calendarMonth={calendarMonth}
                    selectedCalendarDate={selectedCalendarDate}
                    onCalendarMonthChange={setCalendarMonth}
                    onCalendarDateSelect={setSelectedCalendarDate}
                  />
                </SheetPage>
                <SheetPage>
                  <HistoryPage logs={system.completionLogs} />
                </SheetPage>
                <SheetPage>
                  <ReflectionsPage reflections={system.reflections} logs={system.completionLogs} />
                </SheetPage>
                <SheetPage>
                  <SettingsPage system={system} onRename={onRename} onScheduleOpen={() => setScheduleOpen(true)} />
                </SheetPage>
              </motion.div>
            </div>
          </SystemDetailSheetShell>
      <ScheduleSettingsSheet system={system} open={scheduleOpen} onClose={() => setScheduleOpen(false)} onScheduleChange={onScheduleChange} />
    </>
  );
}

function SheetPage({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  return (
    <div className={`h-full w-full shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] ${scroll ? "overflow-y-auto" : "overflow-hidden"}`}>
      {children}
    </div>
  );
}

function DiagramPage({
  system,
  calendarMonth,
  selectedCalendarDate,
  onCalendarMonthChange,
  onCalendarDateSelect,
}: {
  system: TodaySystemView;
  calendarMonth: Date;
  selectedCalendarDate: string | null;
  onCalendarMonthChange: (date: Date) => void;
  onCalendarDateSelect: (date: string) => void;
}) {
  return (
    <div className="space-y-5">
      <MonthlyStatusCalendar
        system={system}
        month={calendarMonth}
        selectedDate={selectedCalendarDate}
        onMonthChange={onCalendarMonthChange}
        onSelectDate={onCalendarDateSelect}
      />
      <ProgressSummaryCard system={system} />
    </div>
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);

  return next;
}

function getMonthDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  return {
    blanks: Array.from({ length: firstDayOffset }, (_, index) => `blank-${index}`),
    days: Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1)),
  };
}

function latestLogForDate(logs: CompletionLog[], dateKey: string) {
  return logs.slice().reverse().find((log) => log.date === dateKey);
}

function getScheduledDatesUntilToday(system: TodaySystemView) {
  const todayKey = toDateKey(new Date());
  const loggedDates = Array.from(
    new Set(
      system.completionLogs
        .map((log) => log.date)
        .filter((dateKey) => dateFromKey(dateKey) !== null),
    ),
  ).sort();
  const firstDateKey =
    loggedDates.length && loggedDates[0] < system.startDate
      ? loggedDates[0]
      : system.startDate;
  const lastLoggedDateKey = loggedDates.at(-1);
  const lastDateKey =
    lastLoggedDateKey && lastLoggedDateKey > todayKey
      ? lastLoggedDateKey
      : todayKey;
  const start = dateFromKey(firstDateKey);
  const end = dateFromKey(lastDateKey);
  if (!start || !end || firstDateKey > lastDateKey) return [];

  const dates: string[] = [];
  for (let cursor = start; toDateKey(cursor) <= lastDateKey; cursor = addDays(cursor, 1)) {
    const dateKey = toDateKey(cursor);
    if (
      isTodaySystemViewScheduledOnDate(system, dateKey) ||
      loggedDates.includes(dateKey)
    ) {
      dates.push(dateKey);
    }
  }

  return dates;
}

function calculateProgressSummary(system: TodaySystemView) {
  const scheduledDates = getScheduledDatesUntilToday(system);
  const completedCount = scheduledDates.filter((dateKey) => latestLogForDate(system.completionLogs, dateKey)?.status === "completed").length;
  const percent = scheduledDates.length ? Math.round((completedCount / scheduledDates.length) * 100) : 0;
  const todayKey = toDateKey(new Date());
  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  scheduledDates.forEach((dateKey) => {
    const log = latestLogForDate(system.completionLogs, dateKey);
    if (log?.status === "completed") {
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
      return;
    }

    if (dateKey === todayKey && !log) return;
    runningStreak = 0;
  });

  for (let index = scheduledDates.length - 1; index >= 0; index -= 1) {
    const dateKey = scheduledDates[index];
    const log = latestLogForDate(system.completionLogs, dateKey);
    if (dateKey === todayKey && !log) continue;
    if (log?.status !== "completed") break;

    currentStreak += 1;
  }

  return {
    bestStreak,
    completedCount,
    currentStreak,
    percent,
    totalScheduled: scheduledDates.length,
  };
}

function getDayTone(system: TodaySystemView, dateKey: string, todayKey: string) {
  const log = latestLogForDate(system.completionLogs, dateKey);
  if (log?.status === "completed") return "completed";
  if (log?.status === "missed") return "missed";

  const scheduled = isTodaySystemViewScheduledOnDate(system, dateKey);
  if (!scheduled) return "dim";
  if (dateKey > todayKey) return "upcoming";

  return "planned";
}

const dayToneClass = {
  completed: "border-[#25EB2F]/34 bg-[#25EB2F]/18 text-[#D8FFDC]",
  missed: "border-[#FF3B30]/34 bg-[#FF3B30]/16 text-[#FFD1CD]",
  planned: "border-transparent bg-transparent text-slate-400",
  upcoming: "border-transparent bg-transparent text-slate-500",
  dim: "border-transparent bg-transparent text-slate-700",
};

function MonthlyStatusCalendar({
  system,
  month,
  selectedDate,
  onMonthChange,
  onSelectDate,
}: {
  system: TodaySystemView;
  month: Date;
  selectedDate: string | null;
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: string) => void;
}) {
  const { blanks, days } = getMonthDays(month);
  const todayKey = toDateKey(new Date());

  const moveMonth = (amount: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1));
  };

  return (
    <section className="rounded-[22px] border border-violet-200/10 bg-white/[0.03] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-200/10 bg-white/[0.035] text-slate-400 transition active:scale-95"
          aria-label="Oldingi oy"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-xs font-black text-white">
            {monthNames[month.getMonth()]} {month.getFullYear()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-200/10 bg-white/[0.035] text-slate-400 transition active:scale-95"
          aria-label="Keyingi oy"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
        {weekdayLabels.map((day) => (
          <span key={day} className="py-0.5 text-[8px] font-black uppercase tracking-[0.06em] text-slate-500">
            {day}
          </span>
        ))}
        {blanks.map((blank) => (
          <span key={blank} aria-hidden />
        ))}
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const tone = getDayTone(system, dateKey, todayKey);
          const selected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black transition duration-200 active:scale-95 ${dayToneClass[tone]} ${
                selected ? "ring-2 ring-violet-100/35" : ""
              }`}
              aria-label={dateKey}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

    </section>
  );
}

function HistoryPage({ logs }: { logs: TodaySystemView["completionLogs"] }) {
  if (logs.length === 0) {
    return <EmptyPage title="Hali o‘tmish yo‘q" description="Bu item uchun real completion log qo‘shilgach shu yerda ko‘rinadi." />;
  }

  return (
    <div className="space-y-5">
      {logs
        .slice()
        .reverse()
        .map((log) => (
          <div key={log.id} className={`rounded-[22px] border p-3 ${statusClass[log.status]}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">{statusText[log.status]}</p>
                <p className="mt-0.5 text-xs font-semibold opacity-70">{log.date}</p>
                {log.reason ? <p className="mt-1 text-xs font-semibold opacity-70">{log.reason}</p> : null}
              </div>
              {typeof log.plannedAmount === "number" ? (
                <p className="text-right text-xs font-black">
                  {log.actualAmount ?? 0} / {log.plannedAmount} {log.unit}
                </p>
              ) : null}
            </div>
          </div>
        ))}
    </div>
  );
}

function ReflectionsPage({ reflections, logs }: { reflections: TodaySystemView["reflections"]; logs: TodaySystemView["completionLogs"] }) {
  const autoMissedLogs = logs.filter((log) => log.source === "auto" && log.reason);

  if (reflections.length === 0 && autoMissedLogs.length === 0) {
    return <EmptyPage title="Hali izohlar yo‘q" description="Refleksiya yoki qayd yozilganda izohlar shu yerda jamlanadi." />;
  }

  return (
    <div className="space-y-5">
      {autoMissedLogs
        .slice()
        .reverse()
        .map((log) => (
          <div key={log.id} className="rounded-[22px] border border-[#FF3B30]/18 bg-[#FF3B30]/8 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FFD1CD]/70">{log.date}</p>
              <span className="text-xs font-black text-[#FFD1CD]/70">Auto</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{log.reason}</p>
          </div>
        ))}
      {reflections
        .slice()
        .reverse()
        .map((reflection) => (
          <div key={reflection.id} className="rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-100/65">{reflection.date}</p>
              {reflection.status ? <span className="text-xs font-black text-slate-500">{statusText[reflection.status]}</span> : null}
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{reflection.body}</p>
          </div>
        ))}
    </div>
  );
}

function SettingsPage({
  system,
  onRename,
  onScheduleOpen,
}: {
  system: TodaySystemView;
  onRename?: SystemDetailSheetProps["onRename"];
  onScheduleOpen: () => void;
}) {
  const isContainerSystem = system.id === system.systemId;

  return (
    <div className="space-y-5">
      {isContainerSystem ? (
        <>
          <section className="overflow-hidden rounded-[22px] border border-violet-200/10 bg-white/[0.035]">
            <EditableNameRow system={system} onRename={onRename} />
          </section>
          <SystemChildrenSection title="Odatlar" items={system.routines} actionLabel="+ Odat qo‘shish" />
          <SystemChildrenSection title="Maqsadlar" items={system.goals} actionLabel="+ Maqsad qo‘shish" />
        </>
      ) : (
        <>
          <DetailSettingsGroup title="Asosiy ma’lumot">
            <EditableNameRow system={system} onRename={onRename} />
            <DetailSettingsRow
              icon={Layers3}
              label="Tizim"
              value={system.systemName || "Tizim ulanmagan"}
            />
          </DetailSettingsGroup>

          <DetailSettingsGroup title="Jadval">
            <DetailSettingsRow
              icon={Calendar}
              label="Boshlanish sanasi"
              value={system.startDate || "O‘rnatilmagan"}
            />
            <DetailSettingsRow
              icon={Check}
              label="Kerak / Takrorlanish"
              value={formatScheduleValue(system)}
              onClick={onScheduleOpen}
            />
            <DetailSettingsRow
              icon={Bell}
              label="Eslatma"
              value={system.reminderTime || "O‘rnatilmagan"}
            />
          </DetailSettingsGroup>
        </>
      )}

      <DetailSettingsGroup title="Amallar">
        {!isContainerSystem ? <DetailSettingsAction icon={RotateCcw} label="Boshqattan boshlash" /> : null}
        <DetailSettingsAction icon={Download} label="Ma’lumotlarni eksport qilish" />
        <DetailSettingsAction icon={Archive} label="Arxivga qo‘shish" />
        <DetailSettingsAction icon={Copy} label="Dublikat qilish" />
      </DetailSettingsGroup>

      <DetailSettingsGroup title="Xavfli zona" danger>
        <DetailSettingsAction icon={Trash2} label="O‘chirish" danger />
      </DetailSettingsGroup>
    </div>
  );
}

function SystemChildrenSection({
  title,
  items,
  actionLabel,
}: {
  title: string;
  items: Array<{ id: string; title: string }>;
  actionLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-violet-200/10 bg-white/[0.035]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.055] px-3.5 py-3">
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">{items.length} ta</p>
        </div>
        <button
          type="button"
          disabled
          className="plans-focus-button inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-black text-white disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {actionLabel.replace("+ ", "")}
        </button>
      </div>

      {items.length ? (
        <div>
          {items.map((item) => (
            <div key={item.id} className="border-b border-white/[0.055] px-3.5 py-3 text-sm font-bold text-white last:border-b-0">
              {item.title}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3.5 py-4 text-sm font-semibold text-slate-500">Hali {title.toLowerCase()} qo‘shilmagan.</p>
      )}
    </section>
  );
}

function ScheduleSettingsSheet({
  system,
  open,
  onClose,
  onScheduleChange,
}: {
  system: TodaySystemView;
  open: boolean;
  onClose: () => void;
  onScheduleChange?: SystemDetailSheetProps["onScheduleChange"];
}) {
  const activeDays = resolveDisplayedScheduleDays(system);
  const weekdays: Array<{ key: WeekdayKey; label: string }> = [
    { key: "monday", label: "Du" },
    { key: "tuesday", label: "Se" },
    { key: "wednesday", label: "Ch" },
    { key: "thursday", label: "Pa" },
    { key: "friday", label: "Ju" },
    { key: "saturday", label: "Sh" },
    { key: "sunday", label: "Ya" },
  ];
  const toggleDay = useCallback(
    (day: WeekdayKey) => {
      const nextDays = activeDays.includes(day) ? activeDays.filter((item) => item !== day) : [...activeDays, day];

      if (!nextDays.length) return;
      onScheduleChange?.(system, sortWeekdays(nextDays));
    },
    [activeDays, onScheduleChange, system],
  );

  return (
    <AnimatePresence>
      {open ? (
        <SystemDetailSheetShell ariaLabel="Kerak oynasini yopish" onClose={onClose} direction="right" zIndex="z-[70]">
          <header className="px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm font-black text-violet-100/80">
                <ChevronLeft size={17} />
                Ortga
              </button>
              <p className="text-lg font-black text-white">Kerak</p>
              <span className="w-14" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <section className="overflow-hidden rounded-[22px] border border-violet-200/10 bg-white/[0.035]">
              <div className="border-b border-white/[0.055] px-4 py-3">
                <p className="text-sm font-black text-white">Takrorlanish</p>
              </div>

              <div className="grid grid-cols-7 gap-1 px-3 py-2">
                {weekdays.map((day) => {
                  const active = activeDays.includes(day.key);

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDay(day.key)}
                      className={`flex aspect-square items-center justify-center rounded-full border text-[11px] font-black transition ${
                        active
                          ? "border-[#25EB2F]/22 bg-[#25EB2F]/22 text-white"
                          : "border-violet-200/10 bg-[#0B1023]/72 text-white"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </SystemDetailSheetShell>
      ) : null}
    </AnimatePresence>
  );
}

function EditableNameRow({ system, onRename }: { system: TodaySystemView; onRename?: SystemDetailSheetProps["onRename"] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(system.name);

  const saveName = useCallback(() => {
    const nextName = draft.trim();

    if (!nextName || nextName === system.name) {
      setDraft(system.name);
      setEditing(false);
      return;
    }

    onRename?.(system, nextName);
    setEditing(false);
  }, [draft, onRename, system]);

  return (
    <div
      role="button"
      tabIndex={onRename ? 0 : -1}
      onClick={() => {
        if (!onRename || editing) return;
        setDraft(system.name);
        setEditing(true);
      }}
      onKeyDown={(event) => {
        if (!onRename || editing) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setDraft(system.name);
          setEditing(true);
        }
      }}
      className="flex min-h-14 cursor-pointer items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-violet-100/72">
        <Pencil size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1 text-sm font-black text-white">Nomi</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={saveName}
          onKeyDown={(event) => {
            if (event.key === "Enter") saveName();
            if (event.key === "Escape") {
              setDraft(system.name);
              setEditing(false);
            }
          }}
          className="min-h-9 min-w-0 max-w-[48%] rounded-xl border border-violet-200/12 bg-[#0B1023]/72 px-2.5 text-right text-sm font-bold text-white outline-none focus:border-violet-300/30"
        />
      ) : (
        <span className="max-w-[48%] truncate text-right text-sm font-bold text-slate-400">
          {system.name}
        </span>
      )}
    </div>
  );
}

function formatScheduleValue(system: TodaySystemView) {
  const days = resolveDisplayedScheduleDays(system);
  if (days.length) return scheduleLabelFromDays(days);

  return system.cadence || "O‘rnatilmagan";
}

function resolveDisplayedScheduleDays(system: TodaySystemView): WeekdayKey[] {
  if (system.scheduleDays.length) return system.scheduleDays;

  const cadence = system.cadence.trim().toLowerCase();

  if (cadence.includes("har kuni") || cadence.includes("daily")) {
    return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  }

  return [];
}

function scheduleLabelFromDays(days: WeekdayKey[]) {
  const sorted = sortWeekdays(days);
  const key = sorted.join(",");

  if (key === weekdayOrder.join(",")) return "Har kuni";
  if (key === "monday,wednesday,friday") return "Du / Chor / Jum";
  if (key === "tuesday,thursday,saturday") return "Sesh / Pay / Shan";
  if (key === "monday,tuesday,wednesday,thursday,friday") return "Ish kunlari";
  if (key === "saturday,sunday") return "Dam olish kunlari";

  return "Maxsus";
}

const weekdayOrder: WeekdayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function sortWeekdays(days: WeekdayKey[]) {
  return weekdayOrder.filter((day) => days.includes(day));
}

function EmptyPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[24px] border border-violet-200/10 bg-white/[0.025] p-6 text-center">
      <Calendar size={22} className="text-violet-100/70" />
      <p className="mt-3 text-sm font-black text-white">{title}</p>
      <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function ProgressSummaryCard({ system }: { system: TodaySystemView }) {
  const summary = calculateProgressSummary(system);

  return (
    <section className="rounded-[28px] border border-violet-200/10 bg-white/[0.03] px-5 py-5">
      <div className="grid grid-cols-[minmax(0,1fr)_146px_minmax(0,1fr)] items-center gap-4">
        <SummaryMetric label="Hozirgi seriya" value={String(summary.currentStreak)} />
        <div className="flex items-center justify-center">
          <div className="relative flex h-[142px] w-[142px] items-center justify-center rounded-full">
            <div className="absolute inset-0 rounded-full border-[9px] border-white/[0.06]" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  summary.percent > 0
                    ? `conic-gradient(#3A025B ${summary.percent * 3.6}deg, transparent 0deg)`
                    : "transparent",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 9px), #000 calc(100% - 8px))",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 9px), #000 calc(100% - 8px))",
              }}
            />
            <div className="relative flex h-[124px] w-[124px] flex-col items-center justify-center rounded-full bg-[#151A2E] px-3 text-center">
              <span className="max-w-[86px] text-[10px] font-black uppercase leading-[1.1] tracking-[0.08em] text-violet-100/55">
                Maqsad bajarildi
              </span>
              <span className="mt-1.5 text-4xl font-black leading-none text-white">{summary.percent}%</span>
              <span className="mt-2 whitespace-nowrap text-[11px] font-black leading-none text-slate-500">
                {summary.completedCount}/{summary.totalScheduled} kun
              </span>
            </div>
          </div>
        </div>
        <SummaryMetric label="Eng yaxshi seriya" value={String(summary.bestStreak)} />
      </div>
    </section>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: "Hozirgi seriya" | "Eng yaxshi seriya";
  value: string;
}) {
  const [topLabel, bottomLabel] =
    label === "Hozirgi seriya" ? ["Hozirgi", "seriya"] : ["Eng yaxshi", "seriya"];

  return (
    <div className="text-center">
      <p className="text-[9px] font-black uppercase leading-[1.05] tracking-[0.11em] text-violet-100/55">
        {topLabel}
      </p>
      <p className="mt-0.5 text-[9px] font-black uppercase leading-[1.05] tracking-[0.11em] text-violet-100/55">
        {bottomLabel}
      </p>
      <p className="mt-3 text-3xl font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase leading-none tracking-[0.08em] text-slate-500">kun</p>
    </div>
  );
}
