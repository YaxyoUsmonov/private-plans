"use client";

import { useState } from "react";
import { CalendarDays, Flame, Link2, Plus } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PanelEmptyState } from "@/components/ui/detail-panel";
import { SystemDetailModal } from "@/components/systems/system-detail-modal";
import { growthSystems, type SystemListView } from "@/lib/mock-data";
import { uz } from "@/lib/uz";

const healthStyles = {
  Healthy: "border-[#25EB2F]/18 bg-[#25EB2F]/10 text-[#C9FFD0]",
  "At Risk": "border-amber-300/18 bg-amber-400/10 text-amber-100",
  Inactive: "border-slate-400/14 bg-slate-400/8 text-slate-400",
};

const healthLabels = uz.health;

type SystemsListProps = {
  compact?: boolean;
  systems?: SystemListView[];
};

export function SystemsList({ compact = false, systems = growthSystems }: SystemsListProps) {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const selectedSystem = systems.find((system) => system.id === selectedSystemId) ?? null;

  return (
    <>
      <GlassPanel className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">Barcha o‘sish tizimlari</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Oddiy task ro‘yxati emas, ishlaydigan hayot tizimlari.</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-200/14 bg-violet-400/12 text-violet-100 transition duration-300 active:scale-95"
            aria-label="Tizim yaratish"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className={compact ? "space-y-3" : "space-y-3 pb-20"}>
          {systems.length === 0 ? (
            <PanelEmptyState title="Hali tizim yaratilmagan" description="O‘sish tizimi yaratganingizda shu yerda ko‘rinadi." compact />
          ) : null}
          {systems.map((system) => {
            const Icon = system.icon;

            return (
              <button
                key={system.id}
                type="button"
                onClick={() => setSelectedSystemId(system.id)}
                className="flex min-h-[190px] w-full flex-col rounded-[26px] border border-violet-200/10 bg-white/[0.035] p-4 text-left transition duration-400 hover:border-violet-200/18"
              >
                <div className="flex min-h-[92px] items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black text-white">{system.title}</h3>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black ${healthStyles[system.health]}`}>
                      {healthLabels[system.health]}
                    </span>
                    <div className="mt-2 flex max-h-[58px] flex-wrap gap-1.5 overflow-hidden">
                      {system.routines.map((routine) => (
                        <span
                          key={routine}
                          className="inline-flex h-7 items-center rounded-full border border-violet-200/10 bg-white/[0.04] px-2.5 text-[11px] font-bold leading-none text-slate-300"
                        >
                          {routine}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid gap-2 pt-4 text-xs font-semibold text-slate-400">
                  <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                    <CalendarDays size={14} className="text-violet-100/80" />
                    <span className="truncate">{system.cadence}</span>
                  </div>
                  <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                    <Flame size={14} className="text-orange-100/90" />
                    <span className="truncate">{system.streak} kun ketma-ket</span>
                  </div>
                  <div className="grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2">
                    <Link2 size={14} className="text-violet-100/80" />
                    <span className="truncate">{system.linkedGoals[0]}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <SystemDetailModal system={selectedSystem} onClose={() => setSelectedSystemId(null)} />
    </>
  );
}
