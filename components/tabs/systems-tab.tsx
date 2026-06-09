"use client";

import { SystemsList } from "@/components/systems/systems-list";

export function SystemsTab() {
  return (
    <div className="space-y-5 pt-2">
      <header>
        <p className="text-sm font-semibold text-violet-100/70">O‘sish arxitekturasi</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Tizimlar</h1>
        <p className="mt-1 text-sm text-slate-400">Odat, rutin, jadval va ulangan maqsad bir joyda.</p>
      </header>

      <SystemsList />
    </div>
  );
}
