"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sheetSpring } from "@/lib/motion";

type FocusModeModalProps = {
  open: boolean;
  onClose: () => void;
};

type FocusState = "idle" | "running" | "paused" | "completed";

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
            className="relative z-[81] mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={sheetSpring}
          >
            <header className="relative z-10 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black tracking-tight text-white">
                Fokus rejimi
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!isExiting) setExitConfirm(true);
                }}
                disabled={isExiting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-300"
                aria-label="Fokusni yakunlash"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`relative flex h-[270px] w-[270px] items-center justify-center rounded-full border bg-[#0B1023]/55 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ${
                    isCompleted
                      ? "border-[#25EB2F]/35"
                      : isRunning
                        ? "border-[#7F00FF]/55"
                        : "border-white/[0.10]"
                  }`}
                >
                  <div>
                    <p
                      className={`text-[68px] font-black leading-none tracking-[-0.055em] ${
                        isCompleted ? "text-[#C9FFD0]" : "text-white"
                      }`}
                    >
                      25:00
                    </p>
                    <p className="mt-5 text-sm font-semibold tracking-wide text-slate-500">
                      Chuqur fokus
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid w-full grid-cols-3 gap-2.5">
                  <ActionButton
                    icon={Play}
                    label="Boshlash"
                    active={state === "running"}
                    onClick={() => setState("running")}
                  />
                  <ActionButton
                    icon={Pause}
                    label="Pauza"
                    active={state === "paused"}
                    onClick={() => setState("paused")}
                  />
                  <ActionButton
                    icon={Check}
                    label="Yakunlash"
                    active={isCompleted}
                    onClick={() => setState("completed")}
                    success
                  />
                </div>

                <div className="mt-8 grid w-full grid-cols-3 divide-x divide-white/[0.06] border-y border-white/[0.06] py-4">
                  <FocusStat label="Bu hafta" value="0" />
                  <FocusStat label="Daqiqa" value="0" />
                  <FocusStat label="Eng yaxshi" value="Yo'q" />
                </div>
              </div>
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
                  className="relative w-full max-w-sm rounded-[28px] border border-white/[0.08] bg-[#11162A] p-4 text-center"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={sheetSpring}
                >
                  <h3 className="text-xl font-black text-white">
                    Sessiyani yakunlaysizmi?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Fokus rejimidan chiqishni xohlaysizmi?
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExitConfirm(false)}
                      disabled={isExiting}
                      className="min-h-11 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm font-black text-slate-200"
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
      className={`flex min-h-14 items-center justify-center gap-2 rounded-[18px] border px-2 text-xs font-black transition duration-300 ${
        active
          ? success
            ? "border-[#25EB2F]/22 bg-[#25EB2F]/10 text-[#C9FFD0]"
            : "plans-selected-purple"
          : "border-white/[0.07] bg-white/[0.025] text-slate-400"
      }`}
    >
      <Icon size={17} />
      {label}
    </motion.button>
  );
}

function FocusStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="truncate text-base font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
