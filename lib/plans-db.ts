import type {
  TableInsert,
  TableRow,
  TableUpdate,
} from "@/lib/database.types";
import { getSupabaseClient } from "@/lib/supabase";

export type SystemRow = TableRow<"systems">;
export type RoutineRow = TableRow<"routines">;
export type GoalRow = TableRow<"goals">;
export type CompletionLogRow = TableRow<"completion_logs">;
export type ReflectionRow = TableRow<"reflections">;

export type CreateSystemInput = Omit<
  TableInsert<"systems">,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type UpdateSystemInput = Omit<
  TableUpdate<"systems">,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type CreateRoutineInput = Omit<
  TableInsert<"routines">,
  "id" | "user_id" | "system_id" | "created_at" | "updated_at"
>;
export type UpdateRoutineInput = Omit<
  TableUpdate<"routines">,
  "id" | "user_id" | "system_id" | "created_at" | "updated_at"
>;
export type CreateGoalInput = Omit<
  TableInsert<"goals">,
  "id" | "user_id" | "system_id" | "created_at" | "updated_at"
>;
export type UpdateGoalInput = Omit<
  TableUpdate<"goals">,
  "id" | "user_id" | "system_id" | "created_at" | "updated_at"
>;
export type CreateCompletionLogInput = Omit<
  TableInsert<"completion_logs">,
  "id" | "user_id" | "created_at" | "updated_at"
>;
export type CreateReflectionInput = Omit<
  TableInsert<"reflections">,
  "id" | "user_id" | "created_at" | "updated_at"
>;

async function requireUserId() {
  const {
    data: { user },
    error,
  } = await getSupabaseClient().auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Authentication is required.");

  return user.id;
}

export async function getSystems(): Promise<SystemRow[]> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("systems")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSystem(
  input: CreateSystemInput,
): Promise<SystemRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("systems")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSystem(
  id: string,
  input: UpdateSystemInput,
): Promise<SystemRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("systems")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSystem(id: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabaseClient()
    .from("systems")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function createRoutine(
  systemId: string,
  input: CreateRoutineInput,
): Promise<RoutineRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("routines")
    .insert({ ...input, system_id: systemId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoutine(
  id: string,
  input: UpdateRoutineInput,
): Promise<RoutineRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("routines")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoutine(id: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabaseClient()
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function createGoal(
  systemId: string,
  input: CreateGoalInput,
): Promise<GoalRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("goals")
    .insert({ ...input, system_id: systemId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput,
): Promise<GoalRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("goals")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await getSupabaseClient()
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function createCompletionLog(
  input: CreateCompletionLogInput,
): Promise<CompletionLogRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("completion_logs")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCompletionLogs(): Promise<CompletionLogRow[]> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("completion_logs")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createReflection(
  input: CreateReflectionInput,
): Promise<ReflectionRow> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("reflections")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReflections(): Promise<ReflectionRow[]> {
  const userId = await requireUserId();
  const { data, error } = await getSupabaseClient()
    .from("reflections")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
