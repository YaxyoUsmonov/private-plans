"use client";

import { useState } from "react";
import { CalendarCheck, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sheetSpring } from "@/lib/motion";

type ResetType = "morning" | "evening" | "tomorrow";

type ResetDrawerProps = {
  type: ResetType | null;
  onClose: () => void;
};

export function ResetDrawer({ type, onClose }: ResetDrawerProps) {
  const [energy, setEnergy] = useState("O‘rtacha");
  const isMorning = type === "morning";
  const isTomorrow = type === "tomorrow";
  const Icon = isMorning ? Sun : isTomorrow ? CalendarCheck : Moon;

  return (
    <AnimatePresence>
      {type ? (
        <motion.div className="plans-overlay pointer-events-auto fixed inset-0 z-[60]" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.01 }}>
          <motion.button
            type="button"
            aria-label="Reset drawerini yopish"
            className="absolute inset-0 touch-manipulation bg-black/64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden border-l border-white/[0.06] bg-[#11162A]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={sheetSpring}
          >
            <header className="flex items-start justify-between gap-4 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
                  <Icon size={21} />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    {isMorning ? "Tonggi reset" : isTomorrow ? "Ertangi asosiy rejalar" : "Kechki reset"}
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {isMorning ? "Kunni ongli boshlash." : isTomorrow ? "Ertangi kunni oldindan sozlash." : "Kunni sokin yakunlash."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/12 bg-white/[0.045] text-slate-300"
                aria-label="Yopish"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              {isMorning ? (
                <>
                  <section>
                    <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">Energiya holati</h3>
                    <div className="flex gap-2">
                      {["Past", "O‘rtacha", "Yuqori"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setEnergy(item)}
                          className={`flex-1 rounded-full border px-3 py-2 text-xs font-black ${
                            energy === item ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.035] text-slate-500"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </section>
                  <ResetSegment label="Uyqu sifati" options={["Past", "Yaxshi", "Zo‘r"]} />
                  <ResetSegment label="Kayfiyat" options={["Sokin", "Fokusli", "Og‘ir"]} />
                  <ResetInput label="Bugungi fokus" placeholder="Bugun nimaga e’tibor berasiz?" />
                  <ResetInput label="Top 1 ustuvorlik" placeholder="Eng muhim bitta ish" />
                  <ResetInput label="Asosiy niyat" placeholder="Bugun qanday ichki niyat bilan yurasiz?" />
                  <ResetInput label="Asosiy to‘siq" placeholder="Bugun sizga nima xalaqit berishi mumkin?" />
                  <ResetButton>Kunni boshlash</ResetButton>
                </>
              ) : isTomorrow ? (
                <>
                  <ResetInput label="Ertangi fokus" placeholder="Ertaga nimaga fokus qilasiz?" />
                  <ResetTextArea label="Top 3 ustuvorlik" placeholder="1. ...&#10;2. ...&#10;3. ..." />
                  <section>
                    <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">Energiya kutilmasi</h3>
                    <div className="flex gap-2">
                      {["Past", "O‘rtacha", "Yuqori"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setEnergy(item)}
                          className={`flex-1 rounded-full border px-3 py-2 text-xs font-black ${
                            energy === item ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.035] text-slate-500"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">Ertaga tavsiya etilgan tizimlar</h3>
                    <div className="rounded-[20px] border border-violet-200/10 bg-white/[0.035] px-3 py-3 text-sm font-bold text-slate-500">
                      Hali ma&apos;lumot yo&apos;q
                    </div>
                  </section>
                  <ResetButton>Ertangi rejani saqlash</ResetButton>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat title="Bajarildi" value="2" />
                    <MiniStat title="Bajarilmadi" value="1" danger />
                  </div>
                  <ResetTextArea label="Refleksiya" placeholder="Bugungi kun qanday o‘tdi?" />
                  <ResetInput label="Ertangi niyat" placeholder="Ertaga qanday niyat bilan boshlaysiz?" />
                  <ResetButton>Kunni yakunlash</ResetButton>
                </>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ResetInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{label}</h3>
      <input className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-violet-200/24" placeholder={placeholder} />
    </section>
  );
}

function ResetTextArea({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{label}</h3>
      <textarea className="min-h-28 w-full resize-none rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-600 focus:border-violet-200/24" placeholder={placeholder} />
    </section>
  );
}

function ResetSegment({ label, options }: { label: string; options: string[] }) {
  const [selected, setSelected] = useState(options[1] ?? options[0]);

  return (
    <section>
      <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{label}</h3>
      <div className="flex gap-2">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSelected(item)}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-black ${
              selected === item ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.035] text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function ResetButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="plans-focus-button min-h-12 w-full rounded-full border text-sm font-black text-white">
      {children}
    </button>
  );
}

function MiniStat({ title, value, danger = false }: { title: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className={`mt-1 text-2xl font-black ${danger ? "text-[#FFD1CD]" : "text-[#C9FFD0]"}`}>{value}</p>
    </div>
  );
}
