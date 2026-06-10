"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import { motion } from "framer-motion";
import { DetailPanel } from "@/components/ui/detail-panel";
import type { TodaySystemView } from "@/lib/mock-data";

type GoalProgressSheetProps = {
  goalView: TodaySystemView | null;
  onClose: () => void;
  onSave: (goalView: TodaySystemView, value: number, note: string) => void;
};

export function GoalProgressSheet({
  goalView,
  onClose,
  onSave,
}: GoalProgressSheetProps) {
  const [draft, setDraft] = useState<{
    goalId: string | null;
    value: string;
    note: string;
  }>({ goalId: null, value: "", note: "" });
  const goal = goalView?.goal;
  const value = goal && draft.goalId !== goal.id ? String(goal.current) : draft.value;
  const note = goal && draft.goalId !== goal.id ? "" : draft.note;
  const parsedValue = Number(value);
  const canSave = value.trim().length > 0 && Number.isFinite(parsedValue) && parsedValue >= 0;

  return (
    <DetailPanel
      open={Boolean(goalView && goal)}
      title="Progressni yangilash"
      subtitle={goal?.title}
      icon={Target}
      mode="sheet"
      zIndex="z-[70]"
      showBack={false}
      onClose={onClose}
      footer={
        <motion.button
          type="button"
          whileTap={canSave ? { scale: 0.985 } : undefined}
          disabled={!canSave || !goalView}
          onClick={() => {
            if (!goalView || !canSave) return;
            onSave(goalView, parsedValue, note.trim());
          }}
          className="plans-focus-button min-h-12 w-full rounded-full border text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          Saqlash
        </motion.button>
      }
    >
      {goal ? (
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[22px] border border-white/[0.06] bg-white/[0.035]">
            <ProgressRow label="Maqsad nomi" value={goal.title} />
            <ProgressRow label="Hozirgi qiymat" value={`${goal.current} ${goal.unit}`} />
            <ProgressRow label="Maqsad qiymati" value={`${goal.target} ${goal.unit}`} />
            <ProgressRow label="Birlik" value={goal.unit} />
          </section>

          <Field label="Yangi qiymat">
            <input
              value={value}
              onChange={(event) =>
                setDraft({
                  goalId: goal.id,
                  value: event.target.value,
                  note,
                })
              }
              inputMode="decimal"
              className="min-h-12 w-full rounded-[20px] border border-white/[0.06] bg-white/[0.04] px-4 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-violet-400/35"
              placeholder="Masalan: 64"
              autoFocus
            />
          </Field>

          <Field label="Izoh — optional">
            <textarea
              value={note}
              onChange={(event) =>
                setDraft({
                  goalId: goal.id,
                  value,
                  note: event.target.value,
                })
              }
              className="min-h-24 w-full resize-none rounded-[22px] border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none placeholder:text-slate-600 focus:border-violet-400/35"
              placeholder="Bugungi o‘zgarish haqida"
            />
          </Field>
        </div>
      ) : null}
    </DetailPanel>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 last:border-b-0">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className="max-w-[58%] truncate text-right text-sm font-black text-white">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </h3>
      {children}
    </section>
  );
}
