"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Music2, Pause, Play, Shield, Target, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sheetSpring } from "@/lib/motion";

type FocusModeModalProps = {
  open: boolean;
  onClose: () => void;
};

type FocusState = "idle" | "running" | "paused" | "completed";

const ambienceOptions = ["Chuqur fokus", "Yomg‘ir", "Sokin shovqin", "Sukut"];

export function FocusModeModal({ open, onClose }: FocusModeModalProps) {
  const [state, setState] = useState<FocusState>("idle");
  const [exitConfirm, setExitConfirm] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const isRunning = state === "running";
  const isCompleted = state === "completed";

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleClose = () => {
    if (isExiting) return;
    clearCloseTimer();
    setIsExiting(true);
    setState("idle");
    setExitConfirm(false);

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 180);
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  return (
    <AnimatePresence>
      {open ? (
        <div className="plans-overlay fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-[#050816]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />

          <motion.section
            className="relative z-[81] mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)]"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={sheetSpring}
          >
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className={`absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  isCompleted ? "bg-[#25EB2F]/18" : "bg-violet-500/18"
                }`}
                animate={{
                  scale: isRunning ? [1, 1.12, 1] : [1, 1.04, 1],
                  opacity: isRunning ? [0.35, 0.62, 0.35] : [0.28, 0.42, 0.28],
                }}
                transition={{ duration: isRunning ? 4.2 : 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <header className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-100/60">Fokus rejimi</p>
                <h2 className="mt-2 text-2xl font-black text-white">Tizim tanlanmagan</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Fokus uchun real tizim yoki odat tanlang.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isExiting) setExitConfirm(true);
                }}
                disabled={isExiting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/12 bg-white/[0.045] text-slate-300"
                aria-label="Fokusni yakunlash"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-8 text-center">
              <div className="relative flex h-64 w-64 items-center justify-center">
                <motion.div
                  className={`absolute inset-0 rounded-full border ${isCompleted ? "border-[#25EB2F]/25" : "border-violet-200/14"}`}
                  animate={{ rotate: isRunning ? 360 : 0 }}
                  transition={{ duration: 18, repeat: isRunning ? Infinity : 0, ease: "linear" }}
                />
                <motion.div
                  className={`absolute inset-6 rounded-full ${isCompleted ? "bg-[#25EB2F]/8" : "bg-violet-400/8"}`}
                  animate={{ scale: isRunning ? [1, 1.06, 1] : [1, 1.025, 1] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative">
                  <p className={`text-6xl font-black tracking-tight ${isCompleted ? "text-[#C9FFD0]" : "text-white"}`}>25:00</p>
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    {state === "idle" ? "Chuqur fokusga tayyor" : null}
                    {state === "running" ? "Fokus jarayonida" : null}
                    {state === "paused" ? "Pauzada" : null}
                    {state === "completed" ? "Fokus sessiyasi yakunlandi" : null}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid w-full grid-cols-3 gap-2">
                <ActionButton icon={Play} label="Boshlash" active={state === "running"} onClick={() => setState("running")} />
                <ActionButton icon={Pause} label="Pauza" active={state === "paused"} onClick={() => setState("paused")} />
                <ActionButton icon={Check} label="Yakunlash" active={isCompleted} onClick={() => setState("completed")} success />
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <FocusStat label="Bu hafta" value="0" />
                <FocusStat label="Daqiqa" value="0" />
                <FocusStat label="Eng yaxshi" value="Yo'q" />
              </div>
              <ExpandableRow icon={Target} title="Sessiya maqsadi" value="Hali ma'lumot yo'q" />
              <ExpandableRow icon={Check} title="Sessiya qaydi" value="Hali ma'lumot yo'q" />
              <ExpandableRow icon={ChevronDown} title="Fokus qaydi" value="Hali ma'lumot yo'q" />
              <ExpandableRow icon={Music2} title="Fokus muhiti" value={ambienceOptions[0]} />
              <ExpandableRow icon={Shield} title="Bezovta qilmaslik" value="Keyin ulanadi" />
            </div>
          </motion.section>

          <AnimatePresence>
            {exitConfirm ? (
              <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
                <motion.button
                  type="button"
                  className="absolute inset-0 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if (!isExiting) setExitConfirm(false);
                  }}
                  disabled={isExiting}
                  aria-label="Sessiyani yakunlashni bekor qilish"
                />
                <motion.div
                  className="relative w-full max-w-sm rounded-[28px] border border-violet-200/14 bg-[#11162A] p-4 text-center"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={sheetSpring}
                >
                  <h3 className="text-xl font-black text-white">Sessiyani yakunlaysizmi?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Fokus rejimidan chiqishni xohlaysizmi?</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExitConfirm(false)}
                      disabled={isExiting}
                      className="min-h-11 rounded-full border border-violet-200/12 bg-white/[0.04] text-sm font-black text-slate-200"
                    >
                      Qolish
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isExiting}
                      className="min-h-11 rounded-full border border-[#FF3B30]/22 bg-[#FF3B30]/12 text-sm font-black text-[#FFD1CD]"
                    >
                      Yakunlash
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  success = false,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  active: boolean;
  success?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`min-h-16 rounded-[22px] border px-2 text-xs font-black transition duration-300 ${
        active
          ? success
            ? "border-[#25EB2F]/24 bg-[#25EB2F]/12 text-[#C9FFD0]"
            : "plans-selected-purple"
          : "border-violet-200/10 bg-white/[0.035] text-slate-500"
      }`}
    >
      <Icon className="mx-auto mb-2" size={18} />
      {label}
    </motion.button>
  );
}

function FocusStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-violet-200/10 bg-white/[0.035] px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function ExpandableRow({ icon: Icon, title, value }: { icon: typeof Target; title: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3">
      <Icon size={17} className="shrink-0 text-violet-100" />
      <span className="min-w-0 flex-1 text-sm font-bold text-white">{title}</span>
      <span className="truncate text-xs font-bold text-slate-500">{value}</span>
    </div>
  );
}
