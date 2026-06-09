"use client";

import {
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  HeartPulse,
  Moon,
  PiggyBank,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useBottomSheetDrag } from "@/components/ui/use-bottom-sheet-drag";
import { sheetSpring } from "@/lib/motion";
import type { TemplateContext } from "@/components/create/create-system-flow";
import { uz } from "@/lib/uz";

type TemplatesBrowserSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateContext) => void;
  onExitComplete?: () => void;
};

const templateCategories = [
  { title: uz.categories.health, icon: HeartPulse, subtitle: "Tana, energiya va tiklanish" },
  { title: uz.categories.sport, icon: Dumbbell, subtitle: "Kuch, harakat va rutinlar" },
  { title: uz.categories.productivity, icon: Zap, subtitle: "Ijro, fokus va tartib" },
  { title: uz.categories.finance, icon: PiggyBank, subtitle: "Byudjet va pul odatlari" },
  { title: uz.categories.education, icon: BookOpen, subtitle: "O'qish, kurslar va ko'nikmalar" },
  { title: uz.categories.sleep, icon: Moon, subtitle: "Kechki reset va tiklanish" },
  { title: uz.categories.focus, icon: Target, subtitle: "Chuqur ish va e'tibor" },
  { title: uz.categories.discipline, icon: BriefcaseBusiness, subtitle: "Barqarorlik va tuzilma" },
  { title: uz.categories.mindset, icon: Sparkles, subtitle: "Refleksiya va ichki ish" },
  { title: uz.categories.relationships, icon: Users, subtitle: "Aloqa va hozirlik" },
];

const templatesByCategory: Record<string, TemplateContext[]> = {
  [uz.categories.health]: [
    { name: "Tonggi energiya tizimi", category: uz.categories.health, description: "Uyqu, suv ichish va tonggi energiya odatlari.", schedule: uz.schedules.daily, routines: ["Suv ichish", "Tonggi yurish"], iconName: "heart" },
    { name: "Tiklanish rutini", category: uz.categories.health, description: "Tana holatini kuzatish va yengil tiklanish tizimi.", schedule: uz.schedules.weekdays, routines: ["Cho‘zilish", "Tiklanish qaydi"], iconName: "heart" },
  ],
  [uz.categories.sport]: [
    { name: "Mashg‘ulot barqarorligi", category: uz.categories.sport, description: "Takrorlanadigan trening ritmini yarating.", schedule: uz.schedules.monWedFri, routines: ["Mashg‘ulot", "Cho‘zilish"], iconName: "dumbbell" },
    { name: "Kunlik harakat", category: uz.categories.sport, description: "Yengil harakat va qadamlar barqarorligi.", schedule: uz.schedules.daily, routines: ["Yurish", "Harakat"], iconName: "dumbbell" },
  ],
  [uz.categories.productivity]: [
    { name: "Ijro tizimi", category: uz.categories.business, description: "Muhim ishni rejalash, bajarish va tahlil qilish.", schedule: uz.schedules.weekdays, routines: ["Reja", "Chuqur ish"], iconName: "target" },
    { name: "Kunlik reja aylanishi", category: uz.categories.mindset, description: "Muhim ishni sokin tanlash uchun tizim.", schedule: uz.schedules.daily, routines: ["Reja", "Tahlil"], iconName: "brain" },
  ],
  [uz.categories.finance]: [
    { name: "Pul ravshanligi", category: uz.categories.finance, description: "Xarajatlarni kuzatish va moliyaviy ongni kuchaytirish.", schedule: uz.schedules.weekly, routines: ["Byudjet tekshiruvi", "Xarajat tahlili"], iconName: "wallet" },
    { name: "Jamg‘arma tizimi", category: uz.categories.finance, description: "Barqaror jamg‘arish uchun oddiy ritm.", schedule: uz.schedules.weekly, routines: ["Jamg‘arish", "Tahlil"], iconName: "wallet" },
  ],
  [uz.categories.education]: [
    { name: "O‘qish tizimi", category: uz.categories.education, description: "Barqaror o‘qing va sahifalarni kuzating.", schedule: uz.schedules.daily, routines: ["O‘qish", "Qaydlar"], iconName: "book" },
    { name: "Ko‘nikma quruvchi", category: uz.categories.education, description: "Bitta ko‘nikmani haftalik ritm bilan mashq qiling.", schedule: uz.schedules.weekdays, routines: ["Mashq", "Tahlil"], iconName: "book" },
  ],
  [uz.categories.sleep]: [
    { name: "Kechki reset", category: uz.categories.health, description: "Kunni sokin yoping va ertaga tayyorlaning.", schedule: uz.schedules.daily, routines: ["Refleksiya", "Uyquga tayyorgarlik"], iconName: "moon" },
    { name: "Uyqu gigiyenasi", category: uz.categories.health, description: "Uyqu vaqtini kichik takroriy belgilar bilan himoya qiling.", schedule: uz.schedules.daily, routines: ["Ekransiz vaqt", "Kundalik"], iconName: "moon" },
  ],
  [uz.categories.focus]: [
    { name: "Chuqur ish tizimi", category: uz.categories.business, description: "Fokusli ishni boshlashni yengillashtiring.", schedule: uz.schedules.weekdays, routines: ["Fokus bloki", "Sessiya qaydi"], iconName: "target" },
    { name: "E’tibor reseti", category: uz.categories.mindset, description: "Chalg‘ishni kamaytirib, e’tiborni qaytaring.", schedule: uz.schedules.daily, routines: ["Fokus", "Refleksiya"], iconName: "target" },
  ],
  [uz.categories.discipline]: [
    { name: "Barqarorlik tizimi", category: uz.categories.mindset, description: "Kichik harakatlar bilan davom ettirishni mashq qiling.", schedule: uz.schedules.daily, routines: ["Va’da", "Tekshiruv"], iconName: "brain" },
    { name: "Nol kunsiz", category: uz.categories.mindset, description: "Eng kichik kunlik progress bilan momentumni saqlang.", schedule: uz.schedules.daily, routines: ["Kichik harakat", "Tahlil"], iconName: "brain" },
  ],
  [uz.categories.mindset]: [
    { name: "Refleksiya tizimi", category: uz.categories.mindset, description: "Sokin refleksiya orqali naqshlarni tushuning.", schedule: uz.schedules.daily, routines: ["Kundalik", "Tahlil"], iconName: "brain" },
    { name: "Ishonch quruvchi", category: uz.categories.mindset, description: "Yutuqlarni ko‘ring va qarshilikdan o‘rganing.", schedule: uz.schedules.daily, routines: ["Yutuq qaydi", "Qayta qarash"], iconName: "brain" },
  ],
  [uz.categories.relationships]: [
    { name: "Aloqa tizimi", category: uz.categories.personal, description: "Muhim insonlar bilan ongli aloqada qoling.", schedule: uz.schedules.weekly, routines: ["Xabar yozish", "Refleksiya"], iconName: "heart" },
    { name: "Hozirlik amaliyoti", category: uz.categories.personal, description: "Suhbatlarda e’tibor va g‘amxo‘rlikni kuchaytiring.", schedule: uz.schedules.weekly, routines: ["Tinglash", "Qayd"], iconName: "heart" },
  ],
};

type TemplatesPage = "categories" | "categoryDetail";

export function TemplatesBrowserSheet({ open, onClose, onSelectTemplate, onExitComplete }: TemplatesBrowserSheetProps) {
  const [activePage, setActivePage] = useState<TemplatesPage>("categories");
  const [selectedCategory, setSelectedCategory] = useState<(typeof templateCategories)[number] | null>(null);
  const isDetailPage = activePage === "categoryDetail" && selectedCategory;
  const visibleTemplates = isDetailPage ? templatesByCategory[selectedCategory.title] ?? [] : [];
  const openCategory = (category: (typeof templateCategories)[number]) => {
    setSelectedCategory(category);
    setActivePage("categoryDetail");
  };
  const backToCategories = () => {
    setActivePage("categories");
  };
  const closeSheet = () => {
    setActivePage("categories");
    setSelectedCategory(null);
    onClose();
  };
  const { dragControls, handleDragEnd, startDrag } = useBottomSheetDrag(closeSheet);

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
            aria-label="Shablonlar oynasini yopish"
            className="absolute inset-0 touch-manipulation bg-black/64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={closeSheet}
          />

          <motion.section
            className="absolute inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+54px)] mx-auto flex max-w-md flex-col overflow-hidden rounded-t-[34px] border border-violet-200/12 bg-[#11162A]"
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
              className="flex w-full shrink-0 touch-none justify-center pb-1 pt-3"
              onPointerDown={startDrag}
              style={{ touchAction: "none" }}
              aria-label="Pastga surib yopish"
            >
              <span className="h-1.5 w-12 rounded-full bg-white/18" />
            </button>

            <header className="px-4 pb-3 pt-5">
              {isDetailPage ? (
                <button
                  type="button"
                  onClick={backToCategories}
                  className="mb-3 flex items-center gap-2 text-sm font-black text-violet-100/80"
                >
                  <ChevronLeft size={17} />
                  {uz.common.back}
                </button>
              ) : null}
              <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-100/60">
                {isDetailPage ? uz.create.templateCategory : uz.create.templatesTitle}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                {isDetailPage ? selectedCategory.title : "Tayyor shablonlar"}
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {isDetailPage
                  ? uz.create.templateDetailIntro
                  : uz.create.templateIntro}
              </p>
            </header>

            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                {activePage === "categories" ? (
                  <motion.div
                    key="template-categories"
                    className="h-full overflow-y-auto px-4 pb-4"
                    initial={{ x: "-10%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-10%", opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="overflow-hidden rounded-[26px] border border-violet-200/10 bg-white/[0.025]">
                      {templateCategories.map((category) => {
                        const Icon = category.icon;

                        return (
                          <button
                            key={category.title}
                            type="button"
                            onClick={() => openCategory(category)}
                            className="flex min-h-[58px] w-full items-center gap-3 border-b border-white/[0.06] px-3 text-left transition duration-300 last:border-b-0 active:bg-white/[0.035]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-black text-white">{category.title}</span>
                              <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{category.subtitle}</span>
                            </span>
                            <span className="text-xs font-black text-slate-500">{templatesByCategory[category.title]?.length ?? 0}</span>
                            <ChevronRight size={16} className="shrink-0 text-slate-600" />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : isDetailPage ? (
                  <motion.div
                    key="template-detail"
                    className="h-full overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                    initial={{ x: "100%", opacity: 1 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 1 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="overflow-hidden rounded-[26px] border border-violet-200/10 bg-white/[0.025]">
                      {visibleTemplates.map((template, index) => {
                        const Icon = selectedCategory.icon;

                        return (
                          <button
                            key={`${template.name}-${index}`}
                            type="button"
                            onClick={() => {
                              setActivePage("categories");
                              setSelectedCategory(null);
                              onSelectTemplate(template);
                            }}
                            className="flex min-h-[68px] w-full items-center gap-3 border-b border-white/[0.06] px-3 text-left transition duration-300 last:border-b-0 active:bg-white/[0.035]"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-black text-white">{template.name}</span>
                              <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{template.description}</span>
                            </span>
                            <ChevronRight size={16} className="shrink-0 text-slate-600" />
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {activePage === "categories" ? (
              <div className="border-t border-violet-200/10 bg-[#11162A] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
                <label className="flex min-h-12 items-center gap-3 rounded-full border border-violet-200/10 bg-white/[0.04] px-4">
                  <Search size={17} className="shrink-0 text-violet-100/70" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-600"
                    placeholder={uz.create.templateSearch}
                  />
                </label>
              </div>
            ) : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
