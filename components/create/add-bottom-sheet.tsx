"use client";

import { Layers3, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBottomSheetDrag } from "@/components/ui/use-bottom-sheet-drag";
import { sheetSpring } from "@/lib/motion";
import { uz } from "@/lib/uz";

type AddBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onNewSystem: () => void;
  onTemplates: () => void;
  onExitComplete?: () => void;
};

const createOptions = [
  {
    title: uz.create.newGoal,
    description: uz.create.systemDescription,
    icon: Layers3,
  },
];

export function AddBottomSheet({ open, onClose, onNewSystem, onTemplates, onExitComplete }: AddBottomSheetProps) {
  const { dragControls, handleDragEnd, startDrag } = useBottomSheetDrag(onClose);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          className="plans-overlay pointer-events-auto fixed inset-0 z-[60]"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.01 }}
        >
          <motion.button
            type="button"
            aria-label="Yaratish oynasini yopish"
            className="absolute inset-0 touch-manipulation bg-black/64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
          />

          <motion.section
            className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[34px] border border-violet-200/12 bg-[#11162A] px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-4"
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
              className="flex w-full touch-none justify-center pb-3"
              onPointerDown={startDrag}
              style={{ touchAction: "none" }}
              aria-label="Pastga surib yopish"
            >
              <span className="h-1.5 w-12 rounded-full bg-white/18" />
            </button>

            <div className="space-y-3">
              {createOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <button
                    key={option.title}
                    type="button"
                    onClick={onNewSystem}
                    className="flex w-full items-center gap-3 rounded-[24px] border border-violet-200/10 bg-white/[0.04] p-3.5 text-left transition duration-300 active:scale-[0.99]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-black text-white">{option.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{option.description}</span>
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onTemplates}
                className="mt-2 flex w-full items-center gap-3 rounded-[24px] border border-[#25EB2F]/18 bg-[#25EB2F]/8 p-3.5 text-left transition duration-300 active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#25EB2F]/20 bg-[#25EB2F]/10 text-[#D9FFDD]">
                  <Sparkles size={20} />
                </span>
                <span>
                  <span className="block text-base font-black text-[#E9FFEC]">{uz.create.templates}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    {uz.create.templateHint}
                  </span>
                </span>
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
