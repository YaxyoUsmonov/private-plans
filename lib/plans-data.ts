import {
  createGoal,
  createReflection,
  createRoutine,
  createSystem,
  deleteCompletionLog,
  deleteSystem,
  getCompletionLogs,
  getGoals,
  getReflections,
  getRoutines,
  getSystems,
  saveCompletionLog,
  updateGoal,
  updateRoutine,
  updateSystem,
  type CompletionLogRow,
  type GoalRow,
  type ReflectionRow,
  type RoutineRow,
  type SystemRow,
} from "@/lib/plans-db";
import {
  iconRegistry,
  type ActionStatus,
  type CompletionLog,
  type CreateSystemPayload,
  type DailyAction,
  type Goal,
  type IconKey,
  type Reflection,
  type Routine,
  type System,
  type WeekdayKey,
} from "@/lib/mock-data";
import { uz } from "@/lib/uz";

function isIconKey(value: string): value is IconKey {
  return value in iconRegistry;
}

function resolveIconKey(value: string): IconKey {
  return isIconKey(value) ? value : "target";
}

function mapStatus(status: SystemRow["status"]) {
  if (status === "active") return "Faol";
  if (status === "paused") return "Pauza";
  return "Arxiv";
}

function toDatabaseStatus(status: string): SystemRow["status"] {
  const normalized = status.toLowerCase();
  if (normalized === "paused" || normalized === "pauza") return "paused";
  if (normalized === "archived" || normalized === "arxiv") return "archived";
  return "active";
}

function toWeekdays(days: string[]): WeekdayKey[] {
  const allowed = new Set<WeekdayKey>([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]);

  return days.filter((day): day is WeekdayKey => allowed.has(day as WeekdayKey));
}

function actionIdForRoutine(routineId: string) {
  return `action-${routineId}`;
}

function mapRoutine(row: RoutineRow, completedCount: number): Routine {
  return {
    id: row.id,
    title: row.name,
    iconKey: resolveIconKey(row.icon_key),
    cadence: row.cadence,
    startDate: row.start_date,
    scheduleDays: toWeekdays(row.schedule_days),
    targetAmount: row.target_amount ?? undefined,
    unit: row.unit ?? undefined,
    streak: completedCount,
    longestStreak: completedCount,
    reminderTime: row.reminder_time ?? undefined,
  };
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.name,
    current: row.current_amount,
    target: row.target_amount,
    unit: row.unit,
    status: row.status,
    deadline: row.deadline ?? undefined,
    createdAt: row.created_at,
  };
}

function mapCompletionLog(row: CompletionLogRow): CompletionLog {
  return {
    id: row.id,
    systemId: row.system_id,
    dailyActionId:
      row.daily_action_id ??
      (row.routine_id ? actionIdForRoutine(row.routine_id) : `goal-${row.goal_id ?? row.id}`),
    routineId: row.routine_id ?? undefined,
    goalId: row.goal_id ?? undefined,
    date: row.occurred_on,
    status: row.status,
    reason: row.reason ?? undefined,
    source: row.source,
    plannedAmount: row.planned_amount ?? undefined,
    actualAmount: row.actual_amount ?? undefined,
    unit: row.unit ?? undefined,
    createdAt: row.created_at,
  };
}

function mapReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    systemId: row.system_id,
    dailyActionId:
      row.daily_action_id ??
      (row.routine_id ? actionIdForRoutine(row.routine_id) : undefined),
    routineId: row.routine_id ?? undefined,
    goalId: row.goal_id ?? undefined,
    date: row.occurred_on,
    status: row.status ?? undefined,
    body: row.body,
    createdAt: row.created_at,
  };
}

function createDailyAction(routine: Routine): DailyAction {
  return {
    id: actionIdForRoutine(routine.id),
    title:
      routine.targetAmount && routine.unit
        ? `${routine.targetAmount} ${routine.unit} ${routine.title}`
        : routine.title,
    routineId: routine.id,
    date: "today",
    startDate: routine.startDate,
    scheduleDays: routine.scheduleDays,
    done: 0,
    total: 1,
    label: uz.today.plannedToday,
    status: "planned",
    plannedAmount: routine.targetAmount,
    unit: routine.unit,
  };
}

export async function loadPlansData(): Promise<System[]> {
  const [systemRows, routineRows, goalRows, logRows, reflectionRows] =
    await Promise.all([
      getSystems(),
      getRoutines(),
      getGoals(),
      getCompletionLogs(),
      getReflections(),
    ]);

  return systemRows.map((row): System => {
    const systemLogs = logRows
      .filter((log) => log.system_id === row.id)
      .map(mapCompletionLog);
    const routines = routineRows
      .filter((routine) => routine.system_id === row.id && routine.is_active)
      .map((routine) =>
        mapRoutine(
          routine,
          systemLogs.filter(
            (log) =>
              log.routineId === routine.id && log.status === "completed",
          ).length,
        ),
      );

    return {
      id: row.id,
      title: row.name,
      category: row.category,
      iconKey: resolveIconKey(row.icon_key),
      color: row.color,
      cadence: routines[0]?.cadence,
      startDate: routines[0]?.startDate ?? row.created_at.slice(0, 10),
      scheduleDays: routines[0]?.scheduleDays,
      status: mapStatus(row.status),
      health: "Healthy",
      description: row.description ?? undefined,
      routines,
      goals: goalRows.filter((goal) => goal.system_id === row.id).map(mapGoal),
      dailyActions: routines.map(createDailyAction),
      completionLogs: systemLogs,
      reflections: reflectionRows
        .filter((reflection) => reflection.system_id === row.id)
        .map(mapReflection),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

function resolveTargetSystem(systems: System[], requestedId?: string) {
  if (requestedId && systems.some((system) => system.id === requestedId)) {
    return requestedId;
  }

  return (
    systems.find((system) => system.status === "Faol")?.id ?? systems[0]?.id
  );
}

function routineInput(payload: CreateSystemPayload, name = payload.name) {
  return {
    name,
    icon_key: resolveIconKey(payload.iconName),
    cadence: payload.schedule ?? uz.schedules.daily,
    start_date: payload.startDate,
    schedule_days: payload.scheduleDays ?? [],
    target_amount: payload.targetAmount ?? 1,
    unit: payload.unit ?? "marta",
    reminder_time: payload.reminderTime || null,
    is_active: true,
  };
}

export async function persistCreation(
  systems: System[],
  payload: CreateSystemPayload,
) {
  if (payload.type === "system") {
    const created = await createSystem({
      name: payload.name,
      category: payload.category ?? "Tizim",
      icon_key: resolveIconKey(payload.iconName),
      color: payload.accent || "#7F00FF",
      description: payload.description || null,
      status: "active",
    });

    try {
      await Promise.all(
        (payload.draftRoutines ?? []).map((draft) => {
          const amount = Number(draft.amount);
          return createRoutine(created.id, {
            name: draft.name,
            icon_key: resolveIconKey(payload.iconName),
            cadence: draft.schedule,
            schedule_days: draft.scheduleDays ?? [],
            target_amount:
              draft.amount && Number.isFinite(amount) ? amount : null,
            unit: draft.unit || null,
            reminder_time: draft.reminderTime || null,
            is_active: true,
          });
        }),
      );
    } catch (error) {
      await deleteSystem(created.id);
      throw error;
    }
    return;
  }

  const systemId = resolveTargetSystem(systems, payload.targetSystemId);
  if (!systemId) throw new Error("Odat yoki maqsad uchun tizim tanlanmagan.");

  if (payload.type === "habit") {
    await createRoutine(systemId, routineInput(payload));
    return;
  }

  await createGoal(systemId, {
    name: payload.name,
    current_amount: payload.currentValue ?? 0,
    target_amount: payload.targetAmount ?? 1,
    unit: payload.unit ?? "ta",
    deadline: payload.deadline || null,
    status: "active",
  });
}

export async function persistActionStatus(input: {
  system: System;
  action: DailyAction;
  date: string;
  status: ActionStatus;
  reflectionBody?: string;
}) {
  const { system, action, date, status, reflectionBody } = input;
  if (status === "planned") {
    await deleteCompletionLog({
      system_id: system.id,
      occurred_on: date,
      daily_action_id: action.id,
      routine_id: action.routineId,
      goal_id: action.goalId,
    });
    return;
  }

  await saveCompletionLog({
    system_id: system.id,
    routine_id: action.routineId ?? null,
    goal_id: action.goalId ?? null,
    daily_action_id: action.id,
    occurred_on: date,
    status,
    planned_amount: action.plannedAmount ?? null,
    actual_amount:
      status === "completed" ? action.plannedAmount ?? null : 0,
    unit: action.unit ?? null,
    source: "user",
  });

  const body = reflectionBody?.trim();
  if (body) {
    await createReflection({
      system_id: system.id,
      routine_id: action.routineId ?? null,
      goal_id: action.goalId ?? null,
      daily_action_id: action.id,
      occurred_on: date,
      status,
      body,
    });
  }
}

export async function persistEntityName(
  view: { systemId: string; id: string; routineId?: string; goalId?: string },
  name: string,
) {
  if (view.routineId) {
    await updateRoutine(view.routineId, { name });
    return;
  }
  if (view.goalId) {
    await updateGoal(view.goalId, { name });
    return;
  }
  await updateSystem(view.systemId, { name });
}

export async function persistGoalProgress(goalId: string, currentAmount: number) {
  await updateGoal(goalId, { current_amount: currentAmount });
}

export async function persistEntitySchedule(
  view: { systemId: string; routineId?: string },
  cadence: string,
  days: WeekdayKey[],
) {
  if (!view.routineId) return;
  await updateRoutine(view.routineId, {
    cadence,
    schedule_days: days,
  });
}

export async function persistSystemChanges(
  systemId: string,
  changes: Partial<System>,
) {
  await updateSystem(systemId, {
    name: changes.title,
    description:
      changes.description === undefined ? undefined : changes.description ?? null,
    icon_key: changes.iconKey,
    color: changes.color,
    status: changes.status ? toDatabaseStatus(changes.status) : undefined,
  });
}

export { deleteSystem as persistSystemDelete };
