"use client";

import { useState } from "react";
import {
  BookOpen,
  Brain,
  Check,
  ChevronLeft,
  Dumbbell,
  HeartPulse,
  Layers3,
  Moon,
  Plus,
  Target,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DetailPanel } from "@/components/ui/detail-panel";
import type {
  CreateRoutineDraft,
  CreateSystemPayload,
  CreationType,
  System,
  WeekdayKey,
} from "@/lib/mock-data";
import { uz } from "@/lib/uz";

type CreateSystemFlowProps = {
  open: boolean;
  systems: System[];
  mode?: "standalone" | "attach-to-existing-system";
  existingSystemId?: string;
  onClose: () => void;
  onExitComplete?: () => void;
  template?: TemplateContext | null;
  onCreate: (payload: CreateSystemPayload) => void;
};

export type TemplateContext = {
  type?: CreationType;
  name: string;
  category?: string;
  description?: string;
  schedule?: string;
  routines?: string[];
  iconName?: string;
};

const creationTypes: Array<{
  id: CreationType;
  title: string;
  description: string;
  icon: typeof Layers3;
}> = [
  {
    id: "system",
    title: uz.create.newSystem,
    description: uz.create.systemDescription,
    icon: Layers3,
  },
  {
    id: "habit",
    title: uz.create.newHabit,
    description: "Takrorlanadigan kichik harakatni yengil boshlang.",
    icon: Zap,
  },
  {
    id: "goal",
    title: uz.create.newGoal,
    description: "Aniq natija yoki muddatli maqsad uchun yo‘nalish belgilang.",
    icon: Target,
  },
];

const categories = [uz.categories.education, uz.categories.sport, uz.categories.health, uz.categories.finance, uz.categories.business, uz.categories.hobby, uz.categories.mindset];
const schedules = [uz.schedules.daily, uz.schedules.monWedFri, uz.schedules.tueThuSat, uz.schedules.weekdays, uz.schedules.weekend, uz.schedules.custom];
const weekdayOptions: Array<{ key: WeekdayKey; label: string; short: string }> = [
  { key: "monday", label: "Dushanba", short: "Dush" },
  { key: "tuesday", label: "Seshanba", short: "Sesh" },
  { key: "wednesday", label: "Chorshanba", short: "Chor" },
  { key: "thursday", label: "Payshanba", short: "Pay" },
  { key: "friday", label: "Juma", short: "Jum" },
  { key: "saturday", label: "Shanba", short: "Shan" },
  { key: "sunday", label: "Yakshanba", short: "Yak" },
];
const routines: string[] = [];
const accentColors = [
  { name: "Private binafsha", color: "#7F00FF" },
  { name: "Muvaffaqiyat yashili", color: "#25EB2F" },
  { name: "Chuqur ko‘k", color: "#2563EB" },
  { name: "Yumshoq qizil", color: "#FF3B30" },
  { name: "Qahrabo", color: "#F59E0B" },
];
const icons = [
  { name: "book", icon: BookOpen },
  { name: "dumbbell", icon: Dumbbell },
  { name: "brain", icon: Brain },
  { name: "moon", icon: Moon },
  { name: "target", icon: Target },
  { name: "wallet", icon: Wallet },
  { name: "heart", icon: HeartPulse },
];

const guidedStepTitles = [uz.create.chooseType, uz.create.nameIt, uz.create.setRhythm, uz.create.confirm];
const systemStepTitles = [uz.create.chooseType, "Tizim ma’lumotlari", uz.create.confirm];
const habitScheduleOptions = [
  "Har kuni",
  "Du / Chor / Jum",
  "Sesh / Pay / Shan",
  "Ish kunlari",
  "Dam olish kunlari",
  "Maxsus",
];
const habitWeekdayOptions: Array<{ key: WeekdayKey; label: string }> = [
  { key: "monday", label: "Du" },
  { key: "tuesday", label: "Se" },
  { key: "wednesday", label: "Cho" },
  { key: "thursday", label: "Pay" },
  { key: "friday", label: "Ju" },
  { key: "saturday", label: "Sha" },
  { key: "sunday", label: "Yak" },
];

function isWeeklySchedule(schedule: string) {
  return schedule === uz.schedules.custom;
}

export function CreateSystemFlow({
  open,
  systems,
  mode = "standalone",
  existingSystemId,
  onClose,
  onExitComplete,
  template,
  onCreate,
}: CreateSystemFlowProps) {
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState(false);
  const [creationType, setCreationType] = useState<CreationType | null>(null);
  const [name, setName] = useState(template?.name ?? "");
  const [why, setWhy] = useState("");
  const [description, setDescription] = useState(template?.description ?? "");
  const [reminderTime, setReminderTime] = useState("");
  const [category, setCategory] = useState(template?.category ?? categories[0]);
  const [selectedIcon, setSelectedIcon] = useState(template?.iconName ?? icons[0].name);
  const [accent, setAccent] = useState(accentColors[0].name);
  const [schedule, setSchedule] = useState(template?.schedule ?? schedules[0]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<WeekdayKey[]>([]);
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>(template?.routines ?? []);
  const [creationMode, setCreationMode] = useState<
    "standalone" | "attach-to-draft-system" | "attach-to-existing-system"
  >(mode);
  const [systemHabitDrafts, setSystemHabitDrafts] = useState<CreateRoutineDraft[]>([]);
  const [habitName, setHabitName] = useState("");
  const [habitAmount, setHabitAmount] = useState("");
  const [habitUnit, setHabitUnit] = useState("");
  const [habitSchedule, setHabitSchedule] = useState(habitScheduleOptions[0]);
  const [habitSelectedWeekdays, setHabitSelectedWeekdays] = useState<WeekdayKey[]>([]);
  const [habitReminderTime, setHabitReminderTime] = useState("");
  const [targetSystemId, setTargetSystemId] = useState(
    () => existingSystemId ?? systems.find((system) => system.status === "Faol")?.id ?? systems[0]?.id ?? "",
  );

  const activeType = creationTypes.find((item) => item.id === creationType) ?? creationTypes[0];
  const isSystemFlow = creationType === "system";
  const stepTitles = isSystemFlow ? systemStepTitles : guidedStepTitles;
  const canContinue =
    creationType !== null &&
    (step !== 1 || name.trim().length > 0) &&
    (creationType !== "habit" || step !== 1 || targetSystemId.length > 0) &&
    (isSystemFlow || step !== 2 || !isWeeklySchedule(schedule) || selectedWeekdays.length > 0);
  const primaryLabel = created ? uz.common.close : step === stepTitles.length - 1 ? uz.common.create : uz.common.continue;
  const attachingHabit =
    creationMode === "attach-to-draft-system" ||
    creationMode === "attach-to-existing-system";
  const attachingToExistingSystem = creationMode === "attach-to-existing-system";
  const canAddAttachedHabit =
    habitName.trim().length > 0 &&
    (habitSchedule !== "Maxsus" || habitSelectedWeekdays.length > 0);

  const resetFlow = () => {
    setStep(0);
    setCreated(false);
    setCreationType(null);
    setCreationMode(mode);
    setSystemHabitDrafts([]);
    resetHabitDraft();
  };

  function resetHabitDraft() {
    setHabitName("");
    setHabitAmount("");
    setHabitUnit("");
    setHabitSchedule(habitScheduleOptions[0]);
    setHabitSelectedWeekdays([]);
    setHabitReminderTime("");
  }

  const closeFlow = () => {
    resetFlow();
    onClose();
  };

  const handlePrimary = () => {
    if (attachingHabit) {
      const trimmedName = habitName.trim();
      if (!canAddAttachedHabit) return;

      if (attachingToExistingSystem) {
        const targetSystem = systems.find((system) => system.id === existingSystemId);
        const parsedAmount = Number(habitAmount);
        onCreate({
          type: "habit",
          name: trimmedName,
          iconName: targetSystem?.iconKey ?? "target",
          accent: targetSystem?.color ?? "#7F00FF",
          schedule:
            habitSchedule === "Maxsus" ? uz.schedules.weekly : habitSchedule,
          scheduleDays:
            habitSchedule === "Maxsus" ? habitSelectedWeekdays : undefined,
          reminderTime: habitReminderTime || undefined,
          targetAmount:
            habitAmount.trim() && Number.isFinite(parsedAmount)
              ? parsedAmount
              : undefined,
          unit: habitUnit.trim() || undefined,
          targetSystemId: existingSystemId,
        });
        resetHabitDraft();
        onClose();
        return;
      }

      setSystemHabitDrafts((current) => [
        ...current,
        {
          id: `draft-habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: trimmedName,
          amount: habitAmount.trim() || undefined,
          unit: habitUnit.trim() || undefined,
          schedule: habitSchedule,
          scheduleDays: habitSchedule === "Maxsus" ? habitSelectedWeekdays : undefined,
          reminderTime: habitReminderTime || undefined,
        },
      ]);
      resetHabitDraft();
      setCreationMode("standalone");
      return;
    }

    if (created) {
      closeFlow();
      return;
    }

    if (creationType === null) return;

    if (step < stepTitles.length - 1) {
      if (!canContinue) return;
      setStep((current) => current + 1);
      return;
    }

    if (isSystemFlow) {
      onCreate({
        type: "system",
        name: name.trim(),
        description: description.trim() || undefined,
        iconName: selectedIcon,
        accent: accentColors.find((item) => item.name === accent)?.color ?? accentColors[0].color,
        draftRoutines: systemHabitDrafts,
      });
    } else {
      onCreate({
        type: creationType,
        name: name.trim(),
        why: why.trim() || undefined,
        description: description.trim() || undefined,
        category,
        iconName: selectedIcon,
        accent,
        schedule: isWeeklySchedule(schedule) ? uz.schedules.weekly : schedule,
        scheduleDays: isWeeklySchedule(schedule) ? selectedWeekdays : undefined,
        reminderTime: reminderTime || undefined,
        routines: selectedRoutines,
        targetSystemId: targetSystemId || undefined,
      });
    }
    setCreated(true);
  };

  const handleBack = () => {
    if (attachingHabit) {
      resetHabitDraft();
      if (attachingToExistingSystem) {
        onClose();
      } else {
        setCreationMode("standalone");
      }
      return;
    }

    if (created) {
      setCreated(false);
      return;
    }

    setStep((current) => Math.max(0, current - 1));
  };

  return (
    <DetailPanel
      open={open}
      title={
        attachingHabit
          ? "Odat qo‘shish"
          : created
            ? uz.create.createdTitle
            : isSystemFlow
              ? "Yangi tizim"
              : activeType.title
      }
      subtitle={
        attachingHabit
          ? attachingToExistingSystem
            ? "Odat ochiq turgan tizimga avtomatik ulanadi"
            : "Odat avtomatik ravishda yaratilayotgan tizimga ulanadi"
          : created
            ? uz.create.createdSubtitle
            : isSystemFlow
              ? "Hayotingizdagi yo‘nalishni yarating"
              : uz.create.setupSubtitle
      }
      mode="sheet"
      zIndex="z-[60]"
      showBack={false}
      onClose={closeFlow}
      onExitComplete={onExitComplete}
      footer={
        <div className="flex items-center gap-2">
          {step > 0 || created || attachingHabit ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={handleBack}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-200/12 bg-white/[0.035] text-violet-100"
              aria-label={uz.common.back}
            >
              <ChevronLeft size={18} />
            </motion.button>
          ) : null}
          <motion.button
            type="button"
            whileTap={{ scale: attachingHabit ? (canAddAttachedHabit ? 0.985 : 1) : canContinue ? 0.985 : 1 }}
            onClick={handlePrimary}
            disabled={attachingHabit ? !canAddAttachedHabit : !canContinue}
            className="plans-focus-button min-h-12 flex-1 rounded-full border text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {attachingHabit ? "Odatni qo‘shish" : primaryLabel}
          </motion.button>
        </div>
      }
    >
      <div className="space-y-5">
        {attachingHabit ? (
          <HabitEditor
            name={habitName}
            amount={habitAmount}
            unit={habitUnit}
            schedule={habitSchedule}
            selectedWeekdays={habitSelectedWeekdays}
            reminderTime={habitReminderTime}
            onNameChange={setHabitName}
            onAmountChange={setHabitAmount}
            onUnitChange={setHabitUnit}
            onScheduleChange={setHabitSchedule}
            onWeekdaysChange={setHabitSelectedWeekdays}
            onReminderTimeChange={setHabitReminderTime}
          />
        ) : !created ? (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-5"
              >
                {step === 0 ? (
                  <StepType selected={creationType} onSelect={setCreationType} />
                ) : null}
                {step === 1 && isSystemFlow ? (
                  <StepSystemDetails
                    name={name}
                    description={description}
                    selectedIcon={selectedIcon}
                    accent={accent}
                    habits={systemHabitDrafts}
                    onNameChange={setName}
                    onDescriptionChange={setDescription}
                    onIconChange={setSelectedIcon}
                    onAccentChange={setAccent}
                    onAddHabit={() => setCreationMode("attach-to-draft-system")}
                  />
                ) : null}
                {step === 1 && creationType !== null && !isSystemFlow ? (
                  <StepIntention
                    creationType={creationType}
                    systems={systems}
                    targetSystemId={targetSystemId}
                    name={name}
                    why={why}
                    description={description}
                    category={category}
                    selectedIcon={selectedIcon}
                    accent={accent}
                    onNameChange={setName}
                    onWhyChange={setWhy}
                    onDescriptionChange={setDescription}
                    onCategoryChange={setCategory}
                    onIconChange={setSelectedIcon}
                    onAccentChange={setAccent}
                    onTargetSystemChange={setTargetSystemId}
                  />
                ) : null}
                {step === 2 && !isSystemFlow ? (
                  <StepRhythm
                    schedule={schedule}
                    selectedWeekdays={selectedWeekdays}
                    reminderTime={reminderTime}
                    selectedRoutines={selectedRoutines}
                    onScheduleChange={setSchedule}
                    onWeekdaysChange={setSelectedWeekdays}
                    onReminderTimeChange={setReminderTime}
                    onRoutinesChange={setSelectedRoutines}
                  />
                ) : null}
                {step === 2 && isSystemFlow ? (
                  <StepSystemConfirm
                    name={name}
                    description={description}
                    selectedIcon={selectedIcon}
                    accent={accent}
                    habits={systemHabitDrafts}
                  />
                ) : null}
                {step === 3 && !isSystemFlow ? (
                  <StepConfirm
                    type={activeType.title}
                    name={name}
                    why={why}
                    category={category}
                    schedule={schedule}
                    selectedWeekdays={selectedWeekdays}
                    reminderTime={reminderTime}
                    selectedRoutines={selectedRoutines}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="flex min-h-[360px] flex-col items-center justify-center text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#25EB2F]/22 bg-[#25EB2F]/12 text-[#C9FFD0]">
              <Check size={26} />
            </span>
            <h3 className="mt-5 text-2xl font-black text-white">{uz.create.createdTitle}</h3>
            <p className="mt-2 max-w-[260px] text-sm font-semibold leading-6 text-slate-500">
              {uz.create.createdSubtitle}
            </p>
          </motion.div>
        )}
      </div>
    </DetailPanel>
  );
}

function StepType({
  selected,
  onSelect,
}: {
  selected: CreationType | null;
  onSelect: (value: CreationType) => void;
}) {
  return (
    <div className="space-y-3">
      <StepIntro title={uz.create.whatBuilding} description={uz.create.whatBuildingDesc} />
      {creationTypes.map((item) => {
        const Icon = item.icon;
        const active = selected === item.id;

        return (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center gap-3 rounded-[24px] border p-3.5 text-left transition duration-300 ${
              active ? "plans-focus-button" : "border-violet-200/10 bg-white/[0.035]"
            }`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
              <Icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-black text-white">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
            </span>
            {active ? <Check size={17} className="shrink-0 text-violet-100" /> : null}
          </motion.button>
        );
      })}
    </div>
  );
}

function HabitEditor({
  name,
  amount,
  unit,
  schedule,
  selectedWeekdays,
  reminderTime,
  onNameChange,
  onAmountChange,
  onUnitChange,
  onScheduleChange,
  onWeekdaysChange,
  onReminderTimeChange,
}: {
  name: string;
  amount: string;
  unit: string;
  schedule: string;
  selectedWeekdays: WeekdayKey[];
  reminderTime: string;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onScheduleChange: (value: string) => void;
  onWeekdaysChange: (value: WeekdayKey[]) => void;
  onReminderTimeChange: (value: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="space-y-5"
    >
      <Field label="Odat nomi *">
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
          placeholder="Masalan: 20 ta so‘z yodlash"
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Miqdor">
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            inputMode="decimal"
            className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24"
            placeholder="20"
          />
        </Field>
        <Field label="Birlik">
          <input
            value={unit}
            onChange={(event) => onUnitChange(event.target.value)}
            className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24"
            placeholder="so‘z"
          />
        </Field>
      </div>

      <Field label="Takrorlanish">
        <div className="flex flex-wrap gap-2">
          {habitScheduleOptions.map((option) => (
            <SelectChip
              key={option}
              selected={schedule === option}
              onClick={() => onScheduleChange(option)}
            >
              {option}
            </SelectChip>
          ))}
        </div>
      </Field>

      {schedule === "Maxsus" ? (
        <Field label="Hafta kunlari">
          <div className="flex flex-wrap gap-2">
            {habitWeekdayOptions.map((day) => {
              const selected = selectedWeekdays.includes(day.key);

              return (
                <SelectChip
                  key={day.key}
                  selected={selected}
                  onClick={() =>
                    onWeekdaysChange(
                      selected
                        ? selectedWeekdays.filter((item) => item !== day.key)
                        : [...selectedWeekdays, day.key],
                    )
                  }
                >
                  {day.label}
                </SelectChip>
              );
            })}
          </div>
          {!selectedWeekdays.length ? (
            <p className="mt-2 px-1 text-xs font-semibold text-slate-500">
              Kamida bitta kunni tanlang.
            </p>
          ) : null}
        </Field>
      ) : null}

      <Field label="Eslatma vaqti — optional">
        <input
          value={reminderTime}
          onChange={(event) => onReminderTimeChange(event.target.value)}
          type="time"
          className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 focus:border-violet-200/24"
        />
      </Field>
    </motion.div>
  );
}

function StepSystemDetails({
  name,
  description,
  selectedIcon,
  accent,
  habits,
  onNameChange,
  onDescriptionChange,
  onIconChange,
  onAccentChange,
  onAddHabit,
}: {
  name: string;
  description: string;
  selectedIcon: string;
  accent: string;
  habits: CreateRoutineDraft[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onAccentChange: (value: string) => void;
  onAddHabit: () => void;
}) {
  return (
    <div className="space-y-5">
      <StepIntro title="Yangi tizim" description="Hayotingizdagi katta yo‘nalish uchun nom, icon va rang tanlang." />

      <Field label="Nomi *">
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
          placeholder="Masalan: Ingliz tili"
        />
      </Field>

      <Field label="Icon">
        <div className="grid grid-cols-7 gap-2">
          {icons.map((item) => {
            const Icon = item.icon;
            const selected = selectedIcon === item.name;

            return (
              <motion.button
                key={item.name}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => onIconChange(item.name)}
                className={`flex aspect-square items-center justify-center rounded-2xl border transition duration-300 ${
                  selected ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.035] text-slate-500"
                }`}
                aria-label={item.name}
              >
                <Icon size={18} />
              </motion.button>
            );
          })}
        </div>
      </Field>

      <Field label="Rang">
        <div className="flex flex-wrap gap-3">
          {accentColors.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onAccentChange(item.name)}
              className={`h-10 w-10 rounded-full border-2 transition duration-300 active:scale-95 ${
                accent === item.name ? "border-[#7F00FF]" : "border-white/10"
              }`}
              style={{ backgroundColor: item.color }}
              aria-label={item.name}
            />
          ))}
        </div>
      </Field>

      <Field label="Qisqa tavsif — optional">
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-24 w-full resize-none rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
          placeholder="Bu tizim nima uchun kerak?"
        />
      </Field>

      <SystemCollectionPlaceholder
        actionLabel="Odat qo‘shish"
        habits={habits}
        onAction={onAddHabit}
      />
      <SystemCollectionPlaceholder actionLabel="Maqsad qo‘shish" />
    </div>
  );
}

function SystemCollectionPlaceholder({
  actionLabel,
  habits,
  onAction,
}: {
  actionLabel: string;
  habits?: CreateRoutineDraft[];
  onAction?: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-violet-200/10 bg-white/[0.035]">
      <div className="flex justify-center px-3.5 py-3">
        <button
          type="button"
          disabled={!onAction}
          onClick={onAction}
          className="plans-focus-button inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-black text-white transition active:scale-95 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {actionLabel}
        </button>
      </div>
      {habits?.length ? (
        <div className="border-t border-white/[0.06]">
          {habits.map((habit) => {
            const amount = [habit.amount, habit.unit].filter(Boolean).join(" ");
            const details = [amount, habit.schedule, habit.reminderTime]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 border-b border-white/[0.06] px-3.5 py-3 last:border-b-0"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-violet-300" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{habit.name}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                    {details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function StepSystemConfirm({
  name,
  description,
  selectedIcon,
  accent,
  habits,
}: {
  name: string;
  description: string;
  selectedIcon: string;
  accent: string;
  habits: CreateRoutineDraft[];
}) {
  const Icon = icons.find((item) => item.name === selectedIcon)?.icon ?? Target;
  const color = accentColors.find((item) => item.name === accent)?.color ?? accentColors[0].color;

  return (
    <div className="space-y-5">
      <StepIntro title="Tizim tayyor" description="Yo‘nalish ma’lumotlarini tekshiring va tizimni yarating." />
      <section className="rounded-[26px] border border-violet-200/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/12 text-white"
            style={{ backgroundColor: `${color}24`, borderColor: `${color}55` }}
          >
            <Icon size={22} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-white">{name || "Nomsiz tizim"}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{accent}</p>
          </div>
        </div>
        {description.trim() ? (
          <p className="mt-4 border-t border-white/[0.06] pt-4 text-sm font-semibold leading-6 text-slate-300">{description}</p>
        ) : null}
        {habits.length ? (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-100/60">
              Odatlar · {habits.length} ta
            </p>
            <div className="mt-2 space-y-2">
              {habits.map((habit) => (
                <p key={habit.id} className="text-sm font-semibold text-slate-300">
                  • {habit.name}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StepIntention({
  creationType,
  systems,
  targetSystemId,
  name,
  why,
  description,
  category,
  selectedIcon,
  accent,
  onNameChange,
  onWhyChange,
  onDescriptionChange,
  onCategoryChange,
  onIconChange,
  onAccentChange,
  onTargetSystemChange,
}: {
  creationType: CreationType;
  systems: System[];
  targetSystemId: string;
  name: string;
  why: string;
  description: string;
  category: string;
  selectedIcon: string;
  accent: string;
  onNameChange: (value: string) => void;
  onWhyChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onAccentChange: (value: string) => void;
  onTargetSystemChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <StepIntro title={uz.create.clearIntention} description={uz.create.clearIntentionDesc} />
      <Field label={uz.create.name}>
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
          placeholder={uz.create.namePlaceholder}
        />
      </Field>

      {creationType === "habit" ? (
        <Field label="Tizim tanlash">
          {systems.length ? (
            <div className="flex flex-wrap gap-2">
              {systems.map((system) => (
                <SelectChip
                  key={system.id}
                  selected={targetSystemId === system.id}
                  onClick={() => onTargetSystemChange(system.id)}
                >
                  {system.title}
                </SelectChip>
              ))}
            </div>
          ) : (
            <p className="rounded-[20px] border border-violet-200/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-500">
              Avval tizim yarating
            </p>
          )}
        </Field>
      ) : null}

      <Field label={uz.create.why}>
        <textarea
          value={why}
          onChange={(event) => onWhyChange(event.target.value)}
          className="min-h-20 w-full resize-none rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
          placeholder={uz.create.whyPlaceholder}
        />
      </Field>

      <Field label={uz.create.category}>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <SelectChip key={item} selected={item === category} onClick={() => onCategoryChange(item)}>
              {item}
            </SelectChip>
          ))}
        </div>
      </Field>

      <Field label={uz.create.icon}>
        <div className="grid grid-cols-7 gap-2">
          {icons.map((item) => {
            const Icon = item.icon;
            const selected = selectedIcon === item.name;

            return (
              <motion.button
                key={item.name}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => onIconChange(item.name)}
                className={`flex aspect-square items-center justify-center rounded-2xl border transition duration-300 ${
                  selected ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.035] text-slate-500"
                }`}
              >
                <Icon size={18} />
              </motion.button>
            );
          })}
        </div>
      </Field>

      <Field label={uz.create.accent}>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onAccentChange(item.name)}
              className={`h-10 w-10 rounded-full border-2 transition duration-300 active:scale-95 ${
                accent === item.name ? "border-[#7F00FF]" : "border-white/10"
              }`}
              style={{ backgroundColor: item.color }}
              aria-label={item.name}
            />
          ))}
        </div>
      </Field>

      <Field label={uz.create.description}>
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="min-h-24 w-full resize-none rounded-[22px] border border-violet-200/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
          placeholder={uz.create.descriptionPlaceholder}
        />
      </Field>
    </div>
  );
}

function StepRhythm({
  schedule,
  selectedWeekdays,
  reminderTime,
  selectedRoutines,
  onScheduleChange,
  onWeekdaysChange,
  onReminderTimeChange,
  onRoutinesChange,
}: {
  schedule: string;
  selectedWeekdays: WeekdayKey[];
  reminderTime: string;
  selectedRoutines: string[];
  onScheduleChange: (value: string) => void;
  onWeekdaysChange: (value: WeekdayKey[]) => void;
  onReminderTimeChange: (value: string) => void;
  onRoutinesChange: (value: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      <StepIntro title={uz.create.lightRhythm} description={uz.create.lightRhythmDesc} />
      <Field label={uz.create.schedule}>
        <div className="flex flex-wrap gap-2">
          {schedules.map((item) => (
            <SelectChip key={item} selected={item === schedule} onClick={() => onScheduleChange(item)}>
              {item}
            </SelectChip>
          ))}
        </div>
      </Field>

      {isWeeklySchedule(schedule) ? (
        <Field label={uz.create.weekdays}>
          <div className="flex flex-wrap gap-2">
            {weekdayOptions.map((item) => {
              const selected = selectedWeekdays.includes(item.key);

              return (
                <SelectChip
                  key={item.key}
                  selected={selected}
                  onClick={() => onWeekdaysChange(selected ? selectedWeekdays.filter((day) => day !== item.key) : [...selectedWeekdays, item.key])}
                >
                  {item.short}
                </SelectChip>
              );
            })}
          </div>
          <p className="mt-2 px-1 text-xs font-semibold text-slate-500">
            {uz.create.weekdaysHint}
          </p>
        </Field>
      ) : null}

      <Field label={uz.create.reminder}>
        <input
          value={reminderTime}
          onChange={(event) => onReminderTimeChange(event.target.value)}
          type="time"
          className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none transition duration-300 focus:border-violet-200/24 focus:bg-violet-400/[0.06]"
        />
      </Field>

      <Field label={uz.create.starterRoutines}>
        {routines.length ? (
          <div className="flex flex-wrap gap-2">
            {routines.map((routine) => {
              const selected = selectedRoutines.includes(routine);

              return (
                <SelectChip
                  key={routine}
                  selected={selected}
                  onClick={() =>
                    onRoutinesChange(selected ? selectedRoutines.filter((item) => item !== routine) : [...selectedRoutines, routine])
                  }
                >
                  + {routine}
                </SelectChip>
              );
            })}
          </div>
        ) : (
          <p className="rounded-[20px] border border-violet-200/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-slate-500">
            Hali starter odatlar yo&apos;q
          </p>
        )}
      </Field>
    </div>
  );
}

function StepConfirm({
  type,
  name,
  why,
  category,
  schedule,
  selectedWeekdays,
  reminderTime,
  selectedRoutines,
}: {
  type: string;
  name: string;
  why: string;
  category: string;
  schedule: string;
  selectedWeekdays: WeekdayKey[];
  reminderTime: string;
  selectedRoutines: string[];
}) {
  const rows = [
    [uz.create.type, type],
    [uz.create.name, name || uz.create.untitled],
    [uz.create.category, category],
    [uz.create.schedule, schedule],
    ...(isWeeklySchedule(schedule)
      ? [[uz.create.weekdays, weekdayOptions.filter((day) => selectedWeekdays.includes(day.key)).map((day) => day.label).join(", ")]]
      : []),
    [uz.create.reminder, reminderTime || uz.create.noReminder],
    [uz.create.routines, selectedRoutines.length ? selectedRoutines.join(", ") : uz.common.later],
  ];

  return (
    <div className="space-y-5">
      <StepIntro title={uz.create.ready} description={uz.create.readyDesc} />
      <section className="rounded-[24px] border border-violet-200/10 bg-white/[0.035] p-4">
        <div className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-2 last:border-b-0">
              <span className="text-xs font-bold text-slate-500">{label}</span>
              <span className="max-w-[58%] truncate text-right text-xs font-black text-white">{value}</span>
            </div>
          ))}
        </div>
      </section>
      {why.trim() ? (
        <section className="rounded-[22px] border border-violet-200/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-100/60">{uz.create.why}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{why}</p>
        </section>
      ) : null}
    </div>
  );
}

function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{label}</h3>
      {children}
    </section>
  );
}

function SelectChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-black transition duration-300 ${
        selected ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.035] text-slate-500"
      }`}
    >
      {children}
    </motion.button>
  );
}
