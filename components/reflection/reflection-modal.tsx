"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { TodaySystemView } from "@/lib/mock-data";
import { SystemDetailSheetShell } from "@/components/systems/system-detail-sheet";

type ReflectionResult = "completed" | "missed";

type ReflectionModalProps = {
  system: TodaySystemView | null;
  onClose: () => void;
  onSave: (systemId: string, result: ReflectionResult, reflectionBody: string) => void;
};

export function ReflectionModal({ system, onClose, onSave }: ReflectionModalProps) {
  return (
    <AnimatePresence>
      {system ? <ReflectionModalContent key={system.id} system={system} onClose={onClose} onSave={onSave} /> : null}
    </AnimatePresence>
  );
}

function ReflectionModalContent({ system, onClose, onSave }: { system: TodaySystemView; onClose: () => void; onSave: ReflectionModalProps["onSave"] }) {
  const [result, setResult] = useState<ReflectionResult | null>(null);
  const [body, setBody] = useState("");
  const isCompleted = result === "completed";
  const isMissed = result === "missed";

  const label = isCompleted
    ? "Bu vazifani bajarish qanday o‘tdi?"
    : isMissed
      ? "Bu vazifani nima uchun bajarmadingiz?"
      : "";
  const placeholder = isCompleted
    ? "Qanday his qildingiz, nima oson yoki qiyin bo‘ldi?"
    : isMissed
      ? "Sababini yozing. Masalan: vaqt yetmadi, energiya kam bo‘ldi..."
      : "Refleksiya shu yerda yoziladi.";

  return (
        <SystemDetailSheetShell ariaLabel="Refleksiya oynasini yopish" onClose={onClose} zIndex="z-[80]">
            <div className="flex-1 overflow-y-auto px-4 pb-3 pt-4">
              <h2 className="px-4 text-center text-xl font-black leading-7 text-white">Siz bu vazifani bajardingizmi?</h2>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <AnswerCard title="Ha" label="Bajardim" selected={isCompleted} tone="success" icon={Check} onClick={() => setResult("completed")} />
                <AnswerCard title="Yo‘q" label="Bajarmadim" selected={isMissed} tone="danger" icon={X} onClick={() => setResult("missed")} />
              </div>

              <div className="mt-4">
                {label ? <p className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{label}</p> : null}
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  disabled={!result}
                  className="min-h-28 w-full resize-none rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 disabled:opacity-55"
                  placeholder={placeholder}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-violet-200/10 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: result ? 0.94 : 1 }}
                disabled={!result}
                onClick={() => {
                  if (result) onSave(system.id, result, body);
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#25EB2F]/28 bg-[#25EB2F] text-[#061009] transition duration-300 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Refleksiyani saqlash"
              >
                <Check size={24} strokeWidth={3} />
              </motion.button>
            </div>
        </SystemDetailSheetShell>
  );
}

function AnswerCard({
  title,
  label,
  selected,
  tone,
  icon: Icon,
  onClick,
}: {
  title: string;
  label: string;
  selected: boolean;
  tone: "success" | "danger";
  icon: typeof Check;
  onClick: () => void;
}) {
  const colors =
    tone === "success"
      ? {
          selected: "border-[#25EB2F]/34 bg-[#25EB2F]/13 text-[#C9FFD0]",
          idle: "border-[#25EB2F]/12 bg-white/[0.035] text-slate-300",
          icon: "text-[#25EB2F]",
        }
      : {
          selected: "border-[#FF3B30]/34 bg-[#FF3B30]/13 text-[#FFD1CD]",
          idle: "border-[#FF3B30]/12 bg-white/[0.035] text-slate-300",
          icon: "text-[#FF3B30]",
        };

  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onClick} className={`min-h-24 rounded-[24px] border p-3 text-left transition duration-300 ${selected ? colors.selected : colors.idle}`}>
      <Icon size={20} className={colors.icon} />
      <p className="mt-3 text-lg font-black">{title}</p>
      <p className="mt-0.5 text-xs font-bold opacity-75">{label}</p>
    </motion.button>
  );
}
