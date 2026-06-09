"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Plus,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SystemDetailSheetShell } from "@/components/systems/system-detail-sheet";
import { DetailTabNavigator } from "@/components/ui/detail-tab-navigator";
import {
  iconRegistry,
  type IconKey,
  type System,
} from "@/lib/mock-data";
import { sheetSpring } from "@/lib/motion";

type ProgressSystemDetailSheetProps = {
  system: System | null;
  onClose: () => void;
  onChange: (systemId: string, changes: Partial<System>) => void;
  onDelete: (systemId: string) => void;
  onRequestAddHabit: (systemId: string) => void;
  onRequestHabitDetail: (systemId: string, routineId: string) => void;
  onExitComplete?: () => void;
};

const pages = ["Boshqaruv", "Sozlamalar"] as const;
const iconOptions = Object.keys(iconRegistry) as IconKey[];
const colorOptions = ["#7F00FF", "#25EB2F", "#2563EB", "#FF3B30", "#F59E0B"];

export function ProgressSystemDetailSheet({
  system,
  onClose,
  onChange,
  onDelete,
  onRequestAddHabit,
  onRequestHabitDetail,
  onExitComplete,
}: ProgressSystemDetailSheetProps) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {system ? (
        <ProgressSystemDetailContent
          key={system.id}
          system={system}
          onClose={onClose}
          onChange={onChange}
          onDelete={onDelete}
          onRequestAddHabit={onRequestAddHabit}
          onRequestHabitDetail={onRequestHabitDetail}
        />
      ) : null}
    </AnimatePresence>
  );
}

function ProgressSystemDetailContent({
  system,
  onClose,
  onChange,
  onDelete,
  onRequestAddHabit,
  onRequestHabitDetail,
}: {
  system: System;
  onClose: () => void;
  onChange: ProgressSystemDetailSheetProps["onChange"];
  onDelete: ProgressSystemDetailSheetProps["onDelete"];
  onRequestAddHabit: ProgressSystemDetailSheetProps["onRequestAddHabit"];
  onRequestHabitDetail: ProgressSystemDetailSheetProps["onRequestHabitDetail"];
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const Icon = iconRegistry[system.iconKey];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setPageIndex(0);
      if (event.key === "ArrowRight") setPageIndex(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <SystemDetailSheetShell
      ariaLabel="Tizim boshqaruv oynasini yopish"
      onClose={onClose}
      zIndex="z-[70]"
    >
      <header className="flex items-center gap-4 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-white"
            style={{
              backgroundColor: `${system.color ?? "#7F00FF"}20`,
              borderColor: `${system.color ?? "#7F00FF"}45`,
            }}
          >
            <Icon size={21} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black text-white">{system.title}</h2>
            {system.description ? (
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                {system.description}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="px-4 pb-3">
        <DetailTabNavigator pages={pages} pageIndex={pageIndex} onChange={setPageIndex} />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <motion.div
          className="flex h-full"
          animate={{ x: `-${pageIndex * 100}%` }}
          transition={sheetSpring}
        >
          <SheetPage>
            <ManagementPage
              system={system}
              onAddHabit={() => onRequestAddHabit(system.id)}
              onSelectHabit={(routineId) => onRequestHabitDetail(system.id, routineId)}
            />
          </SheetPage>
          <SheetPage>
            <SettingsPage
              system={system}
              onChange={onChange}
              onDelete={() => onDelete(system.id)}
            />
          </SheetPage>
        </motion.div>
      </div>
    </SystemDetailSheetShell>
  );
}

function SheetPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full shrink-0 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+18px)]">
      {children}
    </div>
  );
}

function ManagementPage({
  system,
  onAddHabit,
  onSelectHabit,
}: {
  system: System;
  onAddHabit: () => void;
  onSelectHabit: (routineId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {system.description ? (
        <section className="rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3.5">
          <p className="text-sm font-semibold leading-6 text-slate-300">{system.description}</p>
        </section>
      ) : null}

      <CollectionSection
        title="Odatlar"
        count={system.routines.length}
        icon={Zap}
        emptyText="Hali odat ulanmagan"
        actionLabel="Odat qo‘shish"
        onAction={onAddHabit}
        onItemClick={onSelectHabit}
        items={system.routines.map((routine) => ({
          id: routine.id,
          title: routine.title,
          subtitle: routine.cadence,
        }))}
      />

      <CollectionSection
        title="Maqsadlar"
        count={system.goals.length}
        icon={Target}
        emptyText="Hali maqsad qo‘yilmagan"
        actionLabel="Maqsad qo‘shish"
        items={system.goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          subtitle: `${goal.current} / ${goal.target} ${goal.unit}`,
        }))}
      />
    </div>
  );
}

function CollectionSection({
  title,
  count,
  icon: Icon,
  emptyText,
  actionLabel,
  onAction,
  onItemClick,
  items,
}: {
  title: string;
  count: number;
  icon: typeof BookOpen;
  emptyText: string;
  actionLabel: string;
  onAction?: () => void;
  onItemClick?: (itemId: string) => void;
  items: Array<{ id: string; title: string; subtitle: string }>;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-violet-200/10 bg-white/[0.035]">
      <div className="flex items-center justify-between gap-3 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <Icon size={17} className="text-violet-100" />
          <div>
            <h3 className="text-sm font-black text-white">{title}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{count} ta</p>
          </div>
        </div>
        <button
          type="button"
          disabled={!onAction}
          onClick={onAction}
          className="plans-focus-button inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-black text-white disabled:opacity-70"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      </div>

      <div className="border-t border-white/[0.06]">
        {items.length ? (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!onItemClick}
              onClick={() => onItemClick?.(item.id)}
              className="flex w-full items-center gap-3 border-b border-white/[0.06] px-3.5 py-3 text-left transition active:bg-violet-400/[0.06] disabled:cursor-default last:border-b-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center text-white">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{item.subtitle}</span>
              </span>
            </button>
          ))
        ) : (
          <p className="px-3.5 py-4 text-sm font-semibold text-slate-500">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

function SettingsPage({
  system,
  onChange,
  onDelete,
}: {
  system: System;
  onChange: ProgressSystemDetailSheetProps["onChange"];
  onDelete: () => void;
}) {
  const [name, setName] = useState(system.title);
  const [description, setDescription] = useState(system.description ?? "");
  const [iconKey, setIconKey] = useState<IconKey>(system.iconKey);
  const [color, setColor] = useState(system.color ?? colorOptions[0]);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onChange(system.id, {
      title: trimmedName,
      description: description.trim() || undefined,
      iconKey,
      color,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="space-y-4">
      <SettingsField label="Tizim nomi">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none focus:border-violet-200/24"
        />
      </SettingsField>

      <SettingsField label="Icon">
        <div className="grid grid-cols-7 gap-2">
          {iconOptions.map((key) => {
            const OptionIcon = iconRegistry[key];
            const selected = iconKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setIconKey(key)}
                className={`flex aspect-square items-center justify-center rounded-2xl border transition active:scale-95 ${
                  selected
                    ? "plans-selected-purple"
                    : "border-violet-200/10 bg-white/[0.035] text-slate-500"
                }`}
                aria-label={key}
              >
                <OptionIcon size={18} />
              </button>
            );
          })}
        </div>
      </SettingsField>

      <SettingsField label="Rang">
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition active:scale-95 ${
                color === option ? "border-[#7F00FF]" : "border-white/10"
              }`}
              style={{ backgroundColor: option }}
              aria-label={option}
            >
              {color === option ? <Check size={16} className="text-white" /> : null}
            </button>
          ))}
        </div>
      </SettingsField>

      <SettingsField label="Tavsif">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 w-full resize-none rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-slate-600 focus:border-violet-200/24"
          placeholder="Bu tizim nima uchun kerak?"
        />
      </SettingsField>

      <button
        type="button"
        onClick={save}
        disabled={!name.trim()}
        className="plans-focus-button min-h-12 w-full rounded-full border text-sm font-black text-white transition active:scale-[0.99] disabled:opacity-45"
      >
        {saved ? "Saqlandi" : "O‘zgarishlarni saqlash"}
      </button>

      <section className="pt-3">
        <button
          type="button"
          onClick={onDelete}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] border border-[#FF3B30]/22 bg-[#FF3B30]/10 text-sm font-black text-[#FFD1CD] transition active:scale-[0.99]"
        >
          <Trash2 size={17} className="icon-tone-danger" />
          Tizimni o‘chirish
        </button>
      </section>
    </div>
  );
}

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">
        {label}
      </h3>
      {children}
    </section>
  );
}
