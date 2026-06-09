"use client";

import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBottomSheetDrag } from "@/components/ui/use-bottom-sheet-drag";
import { sheetSpring } from "@/lib/motion";

type AiCompanionSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function AiCompanionSheet({ open, onClose }: AiCompanionSheetProps) {
  const { dragControls, handleDragEnd, startDrag } = useBottomSheetDrag(onClose);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="plans-overlay pointer-events-auto fixed inset-0 z-[60]" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.01 }}>
          <motion.button
            type="button"
            aria-label="AI hamroh oynasini yopish"
            className="absolute inset-0 touch-manipulation bg-black/64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
          />

          <motion.section
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[min(82dvh,680px)] max-w-md flex-col overflow-hidden rounded-t-[34px] border border-violet-200/12 bg-[#11162A] px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={sheetSpring}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <button
              type="button"
              className="flex w-full touch-none justify-center pb-4"
              onPointerDown={startDrag}
              style={{ touchAction: "none" }}
              aria-label="Pastga surib yopish"
            >
              <span className="h-1.5 w-12 rounded-full bg-white/18" />
            </button>

            <header className="border-b border-white/[0.06] pb-4">
              <div className="flex items-start gap-3">
                <motion.span
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#3A025B]/32 bg-[#3A025B] text-white"
                >
                  <Bot size={22} />
                </motion.span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-100/60">AI hamroh</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white">Bugun qanday yordam beray?</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">Sokin, aniq va shaxsiy suhbat. Hozircha API ulanmagan.</p>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-3">
                <div className="max-w-[86%] rounded-[24px] rounded-tl-md border border-violet-200/10 bg-white/[0.045] px-4 py-3">
                  <p className="text-sm font-semibold leading-6 text-violet-50">Nimani aniqlashtirib beray? Fokus, ritm, tiklanish yoki bugungi keyingi qadam haqida yozishingiz mumkin.</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
                  <Sparkles size={13} />
                  <span>Real javoblar keyin ulanadi</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-3">
              <div className="flex items-center gap-2 rounded-[26px] border border-violet-200/10 bg-black/18 p-2">
                <input
                  disabled
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-400 outline-none placeholder:text-slate-600"
                  placeholder="AI hamrohga yozing..."
                />
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/10 bg-violet-400/10 text-violet-100 opacity-70"
                  aria-label="Xabar yuborish"
                >
                  <SendHorizontal size={17} />
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
