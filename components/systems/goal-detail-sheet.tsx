"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, CalendarDays, Copy, Download, Gauge, Hash, Layers3, Pencil, Target, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { DetailTabNavigator } from "@/components/ui/detail-tab-navigator";
import { useBottomSheetDrag } from "@/components/ui/use-bottom-sheet-drag";
import { DetailSettingsAction, DetailSettingsGroup, DetailSettingsRow } from "@/components/systems/detail-settings-ui";
import type { TodaySystemView } from "@/lib/mock-data";
import { sheetSpring } from "@/lib/motion";

type GoalDetailSheetProps = {
  system: TodaySystemView;
  onClose: () => void;
  onRename?: (system: TodaySystemView, name: string) => void;
};

const pages = ["Progress", "Tarix", "Izohlar", "Sozlamalar"] as const;

export function GoalDetailSheet({
  system,
  onClose,
  onRename,
}: GoalDetailSheetProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const goal = system.goal;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setPageIndex((current) => Math.max(0, current - 1));
      }
      if (event.key === "ArrowRight") {
        setPageIndex((current) => Math.min(pages.length - 1, current + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const resolveSwipe = useCallback((dx: number, dy: number) => {
    if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.08) return;
    setPageIndex((current) =>
      dx < 0
        ? Math.min(pages.length - 1, current + 1)
        : Math.max(0, current - 1),
    );
  }, []);

  if (!goal) return null;

  return (
    <GoalSheetShell
      ariaLabel="Maqsad tafsilotini yopish"
      onClose={onClose}
      onPointerDownCapture={(event) => {
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUpCapture={(event) => {
        const start = pointerStartRef.current;
        pointerStartRef.current = null;
        if (!start) return;
        resolveSwipe(event.clientX - start.x, event.clientY - start.y);
      }}
      onPointerCancelCapture={() => {
        pointerStartRef.current = null;
      }}
    >
      <header className="px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
            <Target size={21} />
          </span>
          <h2 className="truncate text-2xl font-black text-white">{goal.title}</h2>
        </div>

        <div className="mt-4">
          <DetailTabNavigator pages={pages} pageIndex={pageIndex} onChange={setPageIndex} />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <motion.div
          className="flex h-full"
          animate={{ x: `-${pageIndex * 100}%` }}
          transition={sheetSpring}
        >
          <GoalSheetPage>
            <GoalProgressPage system={system} />
          </GoalSheetPage>
          <GoalSheetPage>
            <GoalEmptyState
              title="Hali progress tarixi yo‘q"
              description="Maqsad qiymati yangilanganda progress tarixi shu yerda ko‘rinadi."
            />
          </GoalSheetPage>
          <GoalSheetPage>
            <GoalNotesPage system={system} />
          </GoalSheetPage>
          <GoalSheetPage>
            <GoalSettingsPage system={system} onRename={onRename} />
          </GoalSheetPage>
        </motion.div>
      </div>
    </GoalSheetShell>
  );
}

function GoalSheetShell({
  children,
  onClose,
  ariaLabel,
  onPointerDownCapture,
  onPointerUpCapture,
  onPointerCancelCapture,
}: {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel: string;
  onPointerDownCapture?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUpCapture?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancelCapture?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  const { dragControls, handleDragEnd, startDrag } = useBottomSheetDrag(onClose);

  return (
    <motion.div
      className="plans-overlay pointer-events-auto fixed inset-0 z-50"
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
        className="absolute inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+54px)] mx-auto flex max-w-md flex-col overflow-hidden rounded-t-[34px] border border-white/[0.06] bg-[#11162A]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={sheetSpring}
        onPointerDownCapture={onPointerDownCapture}
        onPointerUpCapture={onPointerUpCapture}
        onPointerCancelCapture={onPointerCancelCapture}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "pan-y" }}
      >
        <button
          type="button"
          className="flex w-full shrink-0 touch-none justify-center pb-1 pt-3"
          onPointerDown={startDrag}
          style={{ touchAction: "none" }}
          aria-label="Pastga surib yopish"
        >
          <span className="h-1.5 w-12 rounded-full bg-white/18" />
        </button>
        {children}
      </motion.section>
    </motion.div>
  );
}

function GoalSheetPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full shrink-0 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      {children}
    </div>
  );
}

function GoalProgressPage({ system }: { system: TodaySystemView }) {
  const goal = system.goal;
  if (!goal) return null;

  const current = Number.isFinite(goal.current) ? goal.current : 0;
  const target = Number.isFinite(goal.target) ? goal.target : 0;
  const rawPercent = target > 0 ? (current / target) * 100 : 0;
  const progressPercent = Math.max(0, Math.min(100, rawPercent));
  const remaining = Math.max(0, target - current);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/[0.06] bg-white/[0.035] p-5">
        <div className="flex justify-center">
          <div
            className="flex h-52 w-52 items-center justify-center rounded-full p-[10px]"
            style={{
              background: `conic-gradient(#7F00FF ${progressPercent * 3.6}deg, rgba(255,255,255,0.07) 0deg)`,
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#11162A] text-center">
              <p className="text-4xl font-black tracking-tight text-white">
                {Math.round(progressPercent)}%
              </p>
              <p className="mt-2 text-sm font-bold text-slate-400">
                {current} / {target} {goal.unit}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.035]">
        <GoalMetric label="Hozirgi qiymat" value={`${current} ${goal.unit}`} />
        <GoalMetric label="Maqsad qiymati" value={`${target} ${goal.unit}`} />
        <GoalMetric label="Qolgan miqdor" value={`${remaining} ${goal.unit}`} />
        {goal.deadline ? (
          <GoalMetric label="Deadline" value={formatDeadline(goal.deadline)} />
        ) : null}
      </section>
    </div>
  );
}

function GoalNotesPage({ system }: { system: TodaySystemView }) {
  const notes = system.reflections.filter((reflection) => reflection.body.trim());

  if (!notes.length) {
    return (
      <GoalEmptyState
        title="Hali izoh yozilmagan"
        description="Maqsad haqidagi izoh va qaydlar shu yerda ko‘rinadi."
      />
    );
  }

  return (
    <div className="space-y-5">
      {notes
        .slice()
        .reverse()
        .map((note) => (
          <section
            key={note.id}
            className="rounded-[22px] border border-white/[0.06] bg-white/[0.035] p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-100/65">
              {note.date}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{note.body}</p>
          </section>
        ))}
    </div>
  );
}

function GoalSettingsPage({
  system,
  onRename,
}: {
  system: TodaySystemView;
  onRename?: GoalDetailSheetProps["onRename"];
}) {
  const goal = system.goal;
  const [name, setName] = useState(goal?.title ?? system.name);
  if (!goal) return null;

  return (
    <div className="space-y-5">
      <DetailSettingsGroup title="Asosiy ma’lumot">
        <div className="flex min-h-14 items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center text-violet-100/72">
            <Pencil size={20} strokeWidth={1.9} />
          </span>
          <label className="min-w-0 flex-1 text-sm font-black text-white">Nomi</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => {
              const trimmed = name.trim();
              if (trimmed && trimmed !== goal.title) onRename?.(system, trimmed);
            }}
            className="min-h-9 min-w-0 max-w-[48%] rounded-xl border border-white/[0.06] bg-black/10 px-2.5 text-right text-sm font-bold text-white outline-none focus:border-violet-400/40"
          />
        </div>
        <DetailSettingsRow icon={Layers3} label="Tizim" value={system.systemName || "Ulanmagan"} valueClassName="text-[#008000]" />
      </DetailSettingsGroup>

      <DetailSettingsGroup title="Sana">
        <DetailSettingsRow
          icon={CalendarDays}
          label="Boshlangan sana"
          value={formatDeadline(system.startDate)}
          valueClassName="text-[#008000]"
        />
        <DetailSettingsRow
          icon={CalendarDays}
          label="Tugash sana"
          value={goal.deadline ? formatDeadline(goal.deadline) : "Belgilanmagan"}
          valueClassName="text-[#008000]"
        />
      </DetailSettingsGroup>

      <DetailSettingsGroup title="Progress">
        <DetailSettingsRow icon={Gauge} label="Boshlang‘ich qiymat" value={`0 ${goal.unit}`} valueClassName="text-[#008000]" />
        <DetailSettingsRow icon={Gauge} label="Hozirgi qiymat" value={`${goal.current} ${goal.unit}`} valueClassName="text-[#008000]" />
        <DetailSettingsRow icon={Target} label="Maqsad qiymati" value={`${goal.target} ${goal.unit}`} valueClassName="text-[#008000]" />
        <DetailSettingsRow icon={Hash} label="Birlik" value={goal.unit} valueClassName="text-[#008000]" />
      </DetailSettingsGroup>

      <DetailSettingsGroup title="Amallar">
        <DetailSettingsAction icon={Download} label="Ma’lumotlarni eksport qilish" />
        <DetailSettingsAction icon={Archive} label="Arxivga qo‘shish" />
        <DetailSettingsAction icon={Copy} label="Dublikat qilish" />
      </DetailSettingsGroup>

      <DetailSettingsGroup title="Xavfli zona" danger>
        <DetailSettingsAction icon={Trash2} label="Maqsadni o‘chirish" danger />
      </DetailSettingsGroup>
    </div>
  );
}

function GoalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 last:border-b-0">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className="max-w-[55%] truncate text-right text-sm font-black text-white">{value}</span>
    </div>
  );
}

function GoalEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[24px] border border-white/[0.06] bg-white/[0.025] px-6 text-center">
      <Target size={24} className="text-violet-100/70" />
      <h3 className="mt-3 text-base font-black text-white">{title}</h3>
      <p className="mt-1 max-w-[280px] text-xs font-semibold leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function formatDeadline(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const monthNames = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  if (!year || !month || !day || !monthNames[month - 1]) return value;
  return `${day}-${monthNames[month - 1]} ${year}`;
}
