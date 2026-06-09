import {
  BarChart3,
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  Flame,
  HeartPulse,
  Moon,
  Plus,
  Settings,
  Target,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { uz } from "@/lib/uz";

export type TabKey = "today" | "progress" | "settings";
export type IconKey = "book" | "dumbbell" | "brain" | "moon" | "target" | "wallet" | "heart";
export type SystemHealth = "Healthy" | "At Risk" | "Inactive";
export type ActionStatus = "planned" | "completed" | "missed";
export type GoalStatus = "active" | "completed" | "paused";
export type CreationType = "system" | "habit" | "goal";
export type WeekdayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type Routine = {
  id: string;
  title: string;
  iconKey: IconKey;
  cadence: string;
  startDate?: string;
  scheduleDays?: WeekdayKey[];
  targetAmount?: number;
  unit?: string;
  streak: number;
  longestStreak?: number;
  reminderTime?: string;
};

export type Goal = {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  status: GoalStatus;
  deadline?: string;
};

export type DailyAction = {
  id: string;
  title: string;
  routineId?: string;
  goalId?: string;
  date: string;
  startDate?: string;
  scheduleDays?: WeekdayKey[];
  done: number;
  total: number;
  label: string;
  status: ActionStatus;
  plannedAmount?: number;
  actualAmount?: number;
  unit?: string;
};

export type CompletionLog = {
  id: string;
  systemId: string;
  dailyActionId: string;
  routineId?: string;
  goalId?: string;
  date: string;
  status: ActionStatus;
  reason?: string;
  source?: "user" | "auto";
  plannedAmount?: number;
  actualAmount?: number;
  unit?: string;
  createdAt: string;
};

export type Reflection = {
  id: string;
  systemId: string;
  dailyActionId?: string;
  routineId?: string;
  goalId?: string;
  date: string;
  status?: ActionStatus;
  body: string;
  createdAt: string;
};

export type System = {
  id: string;
  title: string;
  category: string;
  iconKey: IconKey;
  color?: string;
  cadence?: string;
  startDate?: string;
  scheduleDays?: WeekdayKey[];
  status: string;
  health: SystemHealth;
  description?: string;
  routines: Routine[];
  goals: Goal[];
  dailyActions: DailyAction[];
  completionLogs: CompletionLog[];
  reflections: Reflection[];
  createdAt: string;
  updatedAt: string;
};

export type CreateSystemPayload = {
  type: CreationType;
  name: string;
  startDate?: string;
  scheduleDays?: WeekdayKey[];
  why?: string;
  description?: string;
  category?: string;
  iconName: string;
  accent: string;
  schedule?: string;
  reminderTime?: string;
  targetAmount?: number;
  unit?: string;
  routines?: string[];
  draftRoutines?: CreateRoutineDraft[];
  targetSystemId?: string;
};

export type CreateRoutineDraft = {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  schedule: string;
  scheduleDays?: WeekdayKey[];
  reminderTime?: string;
};

export type TodaySystemView = {
  id: string;
  systemId: string;
  routineId?: string;
  goalId?: string;
  name: string;
  systemName?: string;
  systemIcon?: LucideIcon;
  reminderTime?: string;
  icon: LucideIcon;
  iconKey: IconKey;
  cadence: string;
  startDate: string;
  scheduleDays: WeekdayKey[];
  streak: number;
  routines: Array<{
    id: string;
    title: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
  }>;
  goal?: {
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
  };
  today: {
    done: number;
    total: number;
    label: string;
    status: ActionStatus;
    plannedAmount?: number;
    actualAmount?: number;
    unit?: string;
  };
  completionLogs: CompletionLog[];
  reflections: Reflection[];
};

export type SystemListView = {
  id: string;
  title: string;
  category: string;
  icon: LucideIcon;
  iconKey: IconKey;
  cadence: string;
  streak: number;
  status: string;
  health: SystemHealth;
  routines: string[];
  linkedGoals: string[];
  todayAction: string;
};

export const iconRegistry = {
  book: BookOpen,
  dumbbell: Dumbbell,
  brain: Brain,
  moon: Moon,
  target: Target,
  wallet: Wallet,
  heart: HeartPulse,
} satisfies Record<IconKey, LucideIcon>;

export const tabs = [
  { key: "today", label: uz.nav.today, icon: Check },
  { key: "progress", label: uz.nav.progress, icon: BarChart3 },
  { key: "settings", label: uz.nav.settings, icon: Settings },
] satisfies Array<{ key: TabKey; label: string; icon: LucideIcon }>;

export const quickActions = [
  { label: "Yangi odat", icon: Flame },
  { label: "Yangi maqsad", icon: Target },
  { label: "Yangi loyiha", icon: Plus },
];

export const systems: System[] = [];

function getIcon(iconKey: IconKey) {
  return iconRegistry[iconKey];
}

function getRoutine(system: System, routineId?: string) {
  return system.routines.find((routine) => routine.id === routineId) ?? system.routines[0];
}

function getGoal(system: System, goalId?: string) {
  return system.goals.find((goal) => goal.id === goalId);
}

function resolveActionDate(action: DailyAction, dateKey: string) {
  return action.date === "today" ? dateKey : action.date;
}

function latestLogForAction(system: System, action: DailyAction, dateKey: string) {
  const actionDate = resolveActionDate(action, dateKey);

  return [...system.completionLogs].reverse().find((log) => log.dailyActionId === action.id && log.date === actionDate);
}

function calculateActionStreak(system: System, actionId: string) {
  return system.completionLogs.filter((log) => log.dailyActionId === actionId && log.status === "completed").length;
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);

  return next;
}

function resolveStartDate(system: System, routine: Routine | undefined, action: DailyAction) {
  if (action.startDate) return action.startDate;
  if (routine?.startDate) return routine.startDate;
  if (system.startDate) return system.startDate;
  return system.createdAt.slice(0, 10);
}

function isDailyCadence(cadence: string) {
  const normalized = cadence.trim().toLowerCase();
  return normalized === "daily" || normalized === uz.schedules.daily.toLowerCase() || normalized === "har kuni";
}

function isWeeklyCadence(cadence: string) {
  const normalized = cadence.trim().toLowerCase();
  return normalized === "weekly" || normalized === uz.schedules.weekly.toLowerCase() || normalized === "haftalik";
}

function isSystemActive(system: System) {
  const normalized = system.status.trim().toLowerCase();
  return normalized === "faol" || normalized === "active";
}

const jsWeekdayToKey: WeekdayKey[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function weekdayKeyFromDateKey(dateKey: string): WeekdayKey | null {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;

  return jsWeekdayToKey[new Date(year, month - 1, day).getDay()] ?? null;
}

function scheduleDaysFromCadence(cadence: string): WeekdayKey[] {
  const normalized = cadence.trim().toLowerCase();

  if (normalized === uz.schedules.monWedFri.toLowerCase()) {
    return ["monday", "wednesday", "friday"];
  }

  if (normalized === uz.schedules.tueThuSat.toLowerCase()) {
    return ["tuesday", "thursday", "saturday"];
  }

  if (normalized === uz.schedules.weekdays.toLowerCase()) {
    return ["monday", "tuesday", "wednesday", "thursday", "friday"];
  }

  if (normalized === uz.schedules.weekend.toLowerCase()) {
    return ["saturday", "sunday"];
  }

  return [];
}

function resolveScheduleDays(system: System, routine: Routine | undefined, action: DailyAction) {
  return action.scheduleDays ?? routine?.scheduleDays ?? system.scheduleDays ?? scheduleDaysFromCadence(routine?.cadence ?? system.cadence ?? "");
}

function isActionScheduledForDate(system: System, routine: Routine | undefined, action: DailyAction, dateKey: string) {
  if (!dateKey || !isSystemActive(system)) return false;

  const startDate = resolveStartDate(system, routine, action);
  const cadence = routine?.cadence ?? system.cadence ?? "";

  if (isDailyCadence(cadence)) {
    return dateKey >= startDate;
  }

  const resolvedScheduleDays = resolveScheduleDays(system, routine, action);
  if (
    isWeeklyCadence(cadence) ||
    scheduleDaysFromCadence(cadence).length > 0 ||
    resolvedScheduleDays.length > 0
  ) {
    const weekdayKey = weekdayKeyFromDateKey(dateKey);

    return dateKey >= startDate && Boolean(weekdayKey && resolvedScheduleDays.includes(weekdayKey));
  }

  if (action.date === "today") {
    return dateKey === startDate;
  }

  return action.date === dateKey;
}

export function toTodaySystemViews(sourceSystems: System[], dateKey = "today"): TodaySystemView[] {
  return sourceSystems.flatMap((system) =>
    system.dailyActions.flatMap((action) => {
      const routine = getRoutine(system, action.routineId);
      if (!isActionScheduledForDate(system, routine, action, dateKey)) return [];

      const goal = getGoal(system, action.goalId);
      const iconKey = routine?.iconKey ?? system.iconKey;
      const cadence = routine?.cadence ?? system.cadence ?? "";
      const startDate = resolveStartDate(system, routine, action);
      const scheduleDays = resolveScheduleDays(system, routine, action);
      const latestLog = latestLogForAction(system, action, dateKey);
      const status = latestLog?.status ?? "planned";
      const done = status === "completed" ? action.total : 0;
      const label = status === "completed" ? uz.today.completedToday : status === "missed" ? uz.today.missedToday : uz.today.plannedToday;
      const actionLogs = system.completionLogs.filter((log) => log.dailyActionId === action.id);
      const actionReflections = system.reflections.filter((reflection) => reflection.dailyActionId === action.id);

      return {
        id: action.id,
        systemId: system.id,
        routineId: action.routineId,
        goalId: action.goalId,
        name: routine?.title ?? action.title,
        systemName: system.title,
        systemIcon: getIcon(system.iconKey),
        icon: getIcon(iconKey),
        iconKey,
        cadence,
        startDate,
        scheduleDays,
        streak: calculateActionStreak(system, action.id),
        routines: system.routines.map((item) => ({ id: item.id, title: item.title })),
        goals: system.goals.map((item) => ({ id: item.id, title: item.title })),
        goal: goal
          ? {
              id: goal.id,
              title: goal.title,
              current: goal.current,
              target: goal.target,
              unit: goal.unit,
            }
          : undefined,
        today: {
          done,
          total: action.total,
          label,
          status,
          plannedAmount: action.plannedAmount,
          actualAmount: latestLog?.actualAmount ?? action.actualAmount,
          unit: action.unit,
        },
        completionLogs: actionLogs,
        reflections: actionReflections,
      };
    }),
  );
}

export function toSystemDetailView(system: System, dateKey = toLocalDateKey(new Date())): TodaySystemView {
  const action = system.dailyActions[0];
  const routine = action ? getRoutine(system, action.routineId) : system.routines[0];
  const goal = action ? getGoal(system, action.goalId) ?? system.goals[0] : system.goals[0];
  const iconKey = routine?.iconKey ?? system.iconKey;
  const cadence = routine?.cadence ?? system.cadence ?? "";
  const startDate = action ? resolveStartDate(system, routine, action) : system.startDate ?? system.createdAt.slice(0, 10);
  const scheduleDays = action ? resolveScheduleDays(system, routine, action) : system.scheduleDays ?? scheduleDaysFromCadence(cadence);
  const latestLog = action ? latestLogForAction(system, action, dateKey) : undefined;
  const status = latestLog?.status ?? "planned";
  const total = action?.total ?? 1;
  const done = status === "completed" ? total : 0;
  const label = status === "completed" ? uz.today.completedToday : status === "missed" ? uz.today.missedToday : uz.today.plannedToday;
  const actionLogs = action ? system.completionLogs.filter((log) => log.dailyActionId === action.id) : system.completionLogs;
  const actionReflections = action ? system.reflections.filter((reflection) => reflection.dailyActionId === action.id) : system.reflections;

  return {
    id: action?.id ?? system.id,
    systemId: system.id,
    routineId: action?.routineId ?? routine?.id,
    goalId: action?.goalId ?? goal?.id,
    name: system.title,
    systemName: system.title,
    systemIcon: getIcon(system.iconKey),
    icon: getIcon(iconKey),
    iconKey,
    cadence,
    startDate,
    scheduleDays,
    streak: action ? calculateActionStreak(system, action.id) : system.completionLogs.filter((log) => log.status === "completed").length,
    routines: system.routines.map((item) => ({ id: item.id, title: item.title })),
    goals: system.goals.map((item) => ({ id: item.id, title: item.title })),
    goal: goal
      ? {
          id: goal.id,
          title: goal.title,
          current: goal.current,
          target: goal.target,
          unit: goal.unit,
        }
      : undefined,
    today: {
      done,
      total,
      label,
      status,
      plannedAmount: action?.plannedAmount,
      actualAmount: latestLog?.actualAmount ?? action?.actualAmount,
      unit: action?.unit,
    },
    completionLogs: actionLogs,
    reflections: actionReflections,
  };
}

export function toRoutineDetailView(
  system: System,
  routineId: string,
  dateKey = toLocalDateKey(new Date()),
): TodaySystemView | null {
  const routine = system.routines.find((item) => item.id === routineId);
  if (!routine) return null;

  const action = system.dailyActions.find((item) => item.routineId === routineId);
  const actionLogs = action
    ? system.completionLogs.filter((log) => log.dailyActionId === action.id)
    : system.completionLogs.filter((log) => log.routineId === routineId);
  const actionReflections = action
    ? system.reflections.filter((reflection) => reflection.dailyActionId === action.id)
    : system.reflections.filter((reflection) => reflection.routineId === routineId);
  const latestLog = action ? latestLogForAction(system, action, dateKey) : undefined;
  const status = latestLog?.status ?? "planned";
  const total = action?.total ?? 1;

  return {
    id: action?.id ?? routine.id,
    systemId: system.id,
    routineId: routine.id,
    name: routine.title,
    systemName: system.title,
    systemIcon: getIcon(system.iconKey),
    reminderTime: routine.reminderTime,
    icon: getIcon(routine.iconKey),
    iconKey: routine.iconKey,
    cadence: routine.cadence,
    startDate: routine.startDate ?? system.createdAt.slice(0, 10),
    scheduleDays: routine.scheduleDays ?? scheduleDaysFromCadence(routine.cadence),
    streak: action ? calculateActionStreak(system, action.id) : 0,
    routines: system.routines.map((item) => ({ id: item.id, title: item.title })),
    goals: system.goals.map((item) => ({ id: item.id, title: item.title })),
    today: {
      done: status === "completed" ? total : 0,
      total,
      label:
        status === "completed"
          ? uz.today.completedToday
          : status === "missed"
            ? uz.today.missedToday
            : uz.today.plannedToday,
      status,
      plannedAmount: action?.plannedAmount ?? routine.targetAmount,
      actualAmount: latestLog?.actualAmount ?? action?.actualAmount,
      unit: action?.unit ?? routine.unit,
    },
    completionLogs: actionLogs,
    reflections: actionReflections,
  };
}

export function isTodaySystemViewScheduledOnDate(system: Pick<TodaySystemView, "cadence" | "startDate" | "scheduleDays">, dateKey: string) {
  if (!dateKey || dateKey < system.startDate) return false;

  if (isDailyCadence(system.cadence)) {
    return true;
  }

  if (isWeeklyCadence(system.cadence) || scheduleDaysFromCadence(system.cadence).length > 0 || system.scheduleDays.length > 0) {
    const weekdayKey = weekdayKeyFromDateKey(dateKey);
    const scheduleDays = system.scheduleDays.length ? system.scheduleDays : scheduleDaysFromCadence(system.cadence);

    return Boolean(weekdayKey && scheduleDays.includes(weekdayKey));
  }

  return dateKey === system.startDate;
}

function hasCompletionLogForDate(system: System, action: DailyAction, dateKey: string) {
  return system.completionLogs.some((log) => log.dailyActionId === action.id && log.date === dateKey);
}

function createAutoMissedLog(system: System, action: DailyAction, dateKey: string, now: string): CompletionLog {
  return {
    id: `auto-log-${action.id}-${dateKey}`,
    systemId: system.id,
    routineId: action.routineId,
    goalId: action.goalId,
    dailyActionId: action.id,
    date: dateKey,
    status: "missed",
    reason: "Avtomatik bajarilmadi",
    source: "auto",
    plannedAmount: action.plannedAmount,
    actualAmount: 0,
    unit: action.unit,
    createdAt: now,
  };
}

function getPastDatesForAction(system: System, routine: Routine | undefined, action: DailyAction, todayKey: string, selectedDateKey?: string) {
  if (selectedDateKey) {
    return selectedDateKey < todayKey ? [selectedDateKey] : [];
  }

  const startDate = resolveStartDate(system, routine, action);
  const start = dateFromKey(startDate);
  const today = dateFromKey(todayKey);
  if (!start || !today || startDate >= todayKey) return [];

  const dates: string[] = [];
  for (let cursor = start; toLocalDateKey(cursor) < todayKey; cursor = addDays(cursor, 1)) {
    dates.push(toLocalDateKey(cursor));
  }

  return dates;
}

export function applyAutoMissedLogs(sourceSystems: System[], todayKey = toLocalDateKey(new Date()), selectedDateKey?: string): System[] {
  const now = new Date().toISOString();
  let changed = false;

  const nextSystems = sourceSystems.map((system): System => {
    const nextLogs = [...system.completionLogs];

    system.dailyActions.forEach((action) => {
      const routine = getRoutine(system, action.routineId);
      const pastDates = getPastDatesForAction(system, routine, action, todayKey, selectedDateKey);

      pastDates.forEach((dateKey) => {
        if (!isActionScheduledForDate(system, routine, action, dateKey)) return;
        if (hasCompletionLogForDate({ ...system, completionLogs: nextLogs }, action, dateKey)) return;

        nextLogs.push(createAutoMissedLog(system, action, dateKey, now));
        changed = true;
      });
    });

    if (nextLogs.length === system.completionLogs.length) return system;

    return {
      ...system,
      completionLogs: nextLogs,
      updatedAt: now,
    };
  });

  return changed ? nextSystems : sourceSystems;
}

export function toSystemListViews(sourceSystems: System[]): SystemListView[] {
  return sourceSystems.map((system) => {
    const primaryAction = system.dailyActions[0];
    const primaryRoutine = system.routines[0];
    const completedLogs = system.completionLogs.filter((log) => log.status === "completed");

    return {
      id: system.id,
      title: system.title,
      category: system.category,
      icon: getIcon(system.iconKey),
      iconKey: system.iconKey,
      cadence: system.cadence ?? "O‘rnatilmagan",
      streak: completedLogs.length,
      status: system.status,
      health: system.health,
      routines: system.routines.map((routine) => routine.title),
      linkedGoals: system.goals.map((goal) => goal.title),
      todayAction: primaryAction?.title ?? primaryRoutine?.title ?? "Bugungi harakat yo'q",
    };
  });
}

export const dailySystems = toTodaySystemViews(systems);
export const growthSystems = toSystemListViews(systems);

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveIconKey(iconName: string): IconKey {
  return Object.keys(iconRegistry).includes(iconName) ? (iconName as IconKey) : "target";
}

function buildId(prefix: string, name: string) {
  const slug = toSlug(name) || "item";
  return `${prefix}-${slug}-${Date.now()}`;
}

function createRoutineFromPayload(payload: CreateSystemPayload, routineName = payload.name, startDate = toLocalDateKey(new Date())): Routine {
  return {
    id: buildId("routine", routineName),
    title: routineName,
    iconKey: resolveIconKey(payload.iconName),
    cadence: payload.schedule ?? uz.schedules.daily,
    startDate,
    scheduleDays: payload.scheduleDays,
    targetAmount: payload.targetAmount ?? 1,
    unit: payload.unit ?? "marta",
    streak: 0,
    longestStreak: 0,
    reminderTime: payload.reminderTime || undefined,
  };
}

function createDailyActionForRoutine(systemId: string, routine: Routine, startDate = routine.startDate): DailyAction {
  return {
    id: buildId("action", `${systemId}-${routine.title}`),
    title: routine.targetAmount && routine.unit ? `${routine.targetAmount} ${routine.unit} ${routine.title}` : routine.title,
    routineId: routine.id,
    date: "today",
    startDate,
    scheduleDays: routine.scheduleDays,
    done: 0,
    total: 1,
    label: uz.today.plannedToday,
    status: "planned",
    plannedAmount: routine.targetAmount,
    unit: routine.unit,
  };
}

function createGoalFromPayload(payload: CreateSystemPayload): Goal {
  return {
    id: buildId("goal", payload.name),
    title: payload.name,
    current: 0,
    target: 1,
    unit: "marta",
    status: "active",
  };
}

function resolveTargetSystemId(sourceSystems: System[], requestedSystemId?: string) {
  if (requestedSystemId && sourceSystems.some((system) => system.id === requestedSystemId)) {
    return requestedSystemId;
  }

  return sourceSystems.find((system) => system.status === "Faol")?.id ?? sourceSystems[0]?.id;
}

function createSystemFromPayload(payload: CreateSystemPayload, now: string): System {
  const systemId = buildId("system", payload.name);
  const startDate = payload.startDate ?? toLocalDateKey(new Date());
  const draftRoutines = (payload.draftRoutines ?? []).map((draft, index) => {
    const parsedAmount = Number(draft.amount);
    const routine = createRoutineFromPayload(
      {
        ...payload,
        type: "habit",
        name: draft.name,
        schedule: draft.schedule,
        scheduleDays: draft.scheduleDays,
        reminderTime: draft.reminderTime,
      },
      draft.name,
      startDate,
    );

    return {
      ...routine,
      id: `${systemId}-routine-${index}-${toSlug(draft.name) || "item"}`,
      targetAmount:
        draft.amount && Number.isFinite(parsedAmount) ? parsedAmount : undefined,
      unit: draft.unit || undefined,
    };
  });
  const dailyActions = draftRoutines.map((routine, index) => ({
    ...createDailyActionForRoutine(systemId, routine, startDate),
    id: `${systemId}-action-${index}-${toSlug(routine.title) || "item"}`,
  }));

  return {
    id: systemId,
    title: payload.name,
    category: payload.category ?? "Tizim",
    iconKey: resolveIconKey(payload.iconName),
    color: payload.accent,
    status: "Faol",
    health: "Healthy",
    description: payload.description,
    routines: draftRoutines,
    goals: [],
    dailyActions,
    completionLogs: [],
    reflections: [],
    createdAt: now,
    updatedAt: now,
  };
}

function addRoutineToSystem(system: System, payload: CreateSystemPayload, now: string, startDate: string): System {
  const routine = createRoutineFromPayload(payload, payload.name, startDate);

  return {
    ...system,
    routines: [routine, ...system.routines],
    dailyActions: [createDailyActionForRoutine(system.id, routine, startDate), ...system.dailyActions],
    updatedAt: now,
  };
}

function addGoalToSystem(system: System, payload: CreateSystemPayload, now: string): System {
  return {
    ...system,
    goals: [createGoalFromPayload(payload), ...system.goals],
    updatedAt: now,
  };
}

export function applyCreationPayload(sourceSystems: System[], payload: CreateSystemPayload): System[] {
  const now = new Date().toISOString();
  const startDate = payload.startDate ?? toLocalDateKey(new Date());

  if (payload.type === "system") {
    return [...sourceSystems, createSystemFromPayload(payload, now)];
  }

  const targetSystemId = resolveTargetSystemId(sourceSystems, payload.targetSystemId);
  if (!targetSystemId) return sourceSystems;

  return sourceSystems.map((system) => {
    if (system.id !== targetSystemId) return system;
    if (payload.type === "habit") return addRoutineToSystem(system, payload, now, startDate);
    return addGoalToSystem(system, payload, now);
  });
}
