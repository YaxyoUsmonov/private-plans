"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AiCompanionSheet } from "@/components/ai/ai-companion-sheet";
import { AddBottomSheet } from "@/components/create/add-bottom-sheet";
import { CreateSystemFlow, type TemplateContext } from "@/components/create/create-system-flow";
import { TemplatesBrowserSheet } from "@/components/create/templates-browser-sheet";
import type { CreateSystemPayload, System } from "@/lib/mock-data";

type FloatingActionProps = {
  systems: System[];
  onCreate: (payload: CreateSystemPayload) => void;
};

export function FloatingAction({ systems, onCreate }: FloatingActionProps) {
  const [open, setOpen] = useState(false);
  const [systemFlowOpen, setSystemFlowOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [holdVisual, setHoldVisual] = useState(false);
  const [aiMorph, setAiMorph] = useState(false);
  const [templateContext, setTemplateContext] = useState<TemplateContext | null>(null);
  const [flowKey, setFlowKey] = useState(0);
  const visualTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const openAiTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const pendingActionRef = useRef<"new-system" | "templates" | null>(null);
  const pendingTemplateRef = useRef<TemplateContext | null>(null);

  const clearLongPressTimers = () => {
    if (visualTimerRef.current) window.clearTimeout(visualTimerRef.current);
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    visualTimerRef.current = null;
    longPressTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearLongPressTimers();
      if (openAiTimerRef.current) window.clearTimeout(openAiTimerRef.current);
    };
  }, []);

  const openCreateSheet = () => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    if (open || systemFlowOpen || templatesOpen || aiOpen) return;
    setOpen(true);
  };

  const closeCreateSheet = () => {
    pendingActionRef.current = null;
    setOpen(false);
  };

  const openAfterCreateSheetCloses = (action: "new-system" | "templates") => {
    if (action === "new-system") {
      setTemplateContext(null);
      setFlowKey((current) => current + 1);
    }
    pendingActionRef.current = action;
    setOpen(false);
  };

  const handlePointerDown = () => {
    if (open || systemFlowOpen || templatesOpen || aiOpen) return;

    longPressTriggeredRef.current = false;
    clearLongPressTimers();
    visualTimerRef.current = window.setTimeout(() => {
      setHoldVisual(true);
    }, 280);
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setHoldVisual(false);
      setAiMorph(true);
      openAiTimerRef.current = window.setTimeout(() => {
        setAiOpen(true);
        setAiMorph(false);
      }, 160);
    }, 650);
  };

  const handlePointerRelease = () => {
    clearLongPressTimers();
    if (!longPressTriggeredRef.current) {
      setHoldVisual(false);
      setAiMorph(false);
    }
  };

  return (
    <>
      {!open && !systemFlowOpen && !templatesOpen && !aiOpen ? (
        <motion.button
          type="button"
          onClick={openCreateSheet}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerRelease}
          onPointerLeave={handlePointerRelease}
          onPointerCancel={handlePointerRelease}
          whileTap={{ scale: 0.96 }}
          animate={{ scale: holdVisual ? 1.035 : 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="plans-focus-button pointer-events-auto relative z-50 flex h-[72px] w-[72px] shrink-0 touch-manipulation select-none items-center justify-center overflow-hidden rounded-full border text-white transition duration-300"
          aria-label="Yangi maqsad yaratish"
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute flex h-7 w-7 items-center justify-center"
            animate={{ opacity: aiMorph ? 0 : 1, scale: aiMorph ? 0.75 : 1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <span className="absolute h-[2.2px] w-6 rounded-full bg-white" />
            <span className="absolute h-6 w-[2.2px] rounded-full bg-white" />
          </motion.span>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute flex h-8 w-8 items-center justify-center rounded-[12px] border border-[#7F00FF]/25 bg-[#3A025B] shadow-[inset_0_1px_0_rgba(255,255,255,.16)]"
            animate={{ opacity: aiMorph ? 1 : 0, scale: aiMorph ? 1 : 0.75 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <span className="absolute top-[9px] h-[3px] w-[3px] rounded-full bg-violet-50" />
            <span className="absolute left-[9px] top-[15px] h-[4px] w-[4px] rounded-full bg-violet-50" />
            <span className="absolute right-[9px] top-[15px] h-[4px] w-[4px] rounded-full bg-violet-50" />
            <span className="absolute bottom-[8px] h-[2px] w-3 rounded-full bg-violet-100/75" />
          </motion.span>
        </motion.button>
      ) : (
        <span className="pointer-events-none h-[72px] w-[72px] shrink-0" aria-hidden />
      )}

      <AddBottomSheet
        open={open}
        onClose={closeCreateSheet}
        onNewSystem={() => openAfterCreateSheetCloses("new-system")}
        onTemplates={() => openAfterCreateSheetCloses("templates")}
        onExitComplete={() => {
          const action = pendingActionRef.current;
          pendingActionRef.current = null;

          if (action === "new-system") {
            setSystemFlowOpen(true);
          }
          if (action === "templates") {
            setTemplatesOpen(true);
          }
        }}
      />
      <CreateSystemFlow
        key={flowKey}
        open={systemFlowOpen}
        systems={systems}
        onClose={() => setSystemFlowOpen(false)}
        template={templateContext}
        onCreate={onCreate}
      />
      <TemplatesBrowserSheet
        open={templatesOpen}
        onClose={() => {
          pendingTemplateRef.current = null;
          setTemplatesOpen(false);
        }}
        onSelectTemplate={(template) => {
          pendingTemplateRef.current = template;
          setTemplatesOpen(false);
        }}
        onExitComplete={() => {
          const template = pendingTemplateRef.current;
          pendingTemplateRef.current = null;
          if (!template) return;

          setTemplateContext(template);
          setFlowKey((current) => current + 1);
          setSystemFlowOpen(true);
        }}
      />
      <AiCompanionSheet
        open={aiOpen}
        onClose={() => {
          longPressTriggeredRef.current = false;
          setAiOpen(false);
        }}
      />
    </>
  );
}
