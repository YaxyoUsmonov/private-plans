"use client";

import { motion } from "framer-motion";
import { FloatingAction } from "@/components/navigation/floating-action";
import {
  tabs,
  type CreateSystemPayload,
  type System,
  type TabKey,
} from "@/lib/mock-data";

type BottomNavProps = {
  activeTab: TabKey;
  systems: System[];
  onChange: (tab: TabKey) => void;
  onCreate: (payload: CreateSystemPayload) => void;
};

export function BottomNav({ activeTab, systems, onChange, onCreate }: BottomNavProps) {
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-center gap-2.5 px-4 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <div className="relative grid h-[72px] flex-1 max-w-[318px] grid-cols-3 items-center gap-1 rounded-full border border-[#7F00FF]/24 bg-[#11162A]/92 p-1.5 shadow-[0_24px_74px_rgba(0,0,0,.46),inset_0_1px_0_rgba(255,255,255,.10)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  className={`relative flex h-[60px] min-w-0 flex-col items-center justify-center rounded-full p-0 transition duration-400 active:scale-[0.97] ${
                    selected ? "text-white" : "text-slate-500"
                  }`}
                >
                  {selected ? (
                    <motion.span
                      layoutId="dock-pill"
                      className="absolute bottom-[3px] left-[calc(50%-42px)] top-[3px] w-[84px] rounded-full border border-[#7F00FF]/25 bg-[#3A025B] shadow-[0_14px_42px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.18)]"
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  ) : null}
                  <span className="relative flex h-[44px] w-[78px] -translate-y-px flex-col items-center justify-center gap-[3px] px-2">
                    <motion.span
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center [&>svg]:block"
                      animate={selected ? { scale: 1.04 } : { scale: 1 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      <Icon size={18} className="bottom-nav-icon text-current" />
                    </motion.span>
                    <span className="m-0 block h-[13px] p-0 text-center text-[12px] font-bold leading-[13px]">{tab.label}</span>
                  </span>
                </button>
              );
            })}
        </div>
        <FloatingAction systems={systems} onCreate={onCreate} />
      </nav>
    </>
  );
}
