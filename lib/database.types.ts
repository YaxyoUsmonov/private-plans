export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ActionStatus = "planned" | "completed" | "missed";
type GoalStatus = "active" | "completed" | "paused";
type SystemStatus = "active" | "paused" | "archived";
type LogSource = "user" | "auto";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      systems: {
        Row: {
          category: string;
          color: string;
          created_at: string;
          description: string | null;
          icon_key: string;
          id: string;
          name: string;
          status: SystemStatus;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string;
          color?: string;
          created_at?: string;
          description?: string | null;
          icon_key?: string;
          id?: string;
          name: string;
          status?: SystemStatus;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string;
          color?: string;
          created_at?: string;
          description?: string | null;
          icon_key?: string;
          id?: string;
          name?: string;
          status?: SystemStatus;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      routines: {
        Row: {
          cadence: string;
          created_at: string;
          icon_key: string;
          id: string;
          is_active: boolean;
          name: string;
          reminder_time: string | null;
          schedule_days: string[];
          start_date: string;
          system_id: string;
          target_amount: number | null;
          unit: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cadence?: string;
          created_at?: string;
          icon_key?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          reminder_time?: string | null;
          schedule_days?: string[];
          start_date?: string;
          system_id: string;
          target_amount?: number | null;
          unit?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cadence?: string;
          created_at?: string;
          icon_key?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          reminder_time?: string | null;
          schedule_days?: string[];
          start_date?: string;
          system_id?: string;
          target_amount?: number | null;
          unit?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          created_at: string;
          current_amount: number;
          deadline: string | null;
          id: string;
          name: string;
          status: GoalStatus;
          system_id: string;
          target_amount: number;
          unit: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_amount?: number;
          deadline?: string | null;
          id?: string;
          name: string;
          status?: GoalStatus;
          system_id: string;
          target_amount: number;
          unit?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_amount?: number;
          deadline?: string | null;
          id?: string;
          name?: string;
          status?: GoalStatus;
          system_id?: string;
          target_amount?: number;
          unit?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      completion_logs: {
        Row: {
          actual_amount: number | null;
          created_at: string;
          daily_action_id: string | null;
          goal_id: string | null;
          id: string;
          occurred_on: string;
          planned_amount: number | null;
          reason: string | null;
          routine_id: string | null;
          source: LogSource;
          status: ActionStatus;
          system_id: string;
          unit: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          actual_amount?: number | null;
          created_at?: string;
          daily_action_id?: string | null;
          goal_id?: string | null;
          id?: string;
          occurred_on: string;
          planned_amount?: number | null;
          reason?: string | null;
          routine_id?: string | null;
          source?: LogSource;
          status: ActionStatus;
          system_id: string;
          unit?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          actual_amount?: number | null;
          created_at?: string;
          daily_action_id?: string | null;
          goal_id?: string | null;
          id?: string;
          occurred_on?: string;
          planned_amount?: number | null;
          reason?: string | null;
          routine_id?: string | null;
          source?: LogSource;
          status?: ActionStatus;
          system_id?: string;
          unit?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reflections: {
        Row: {
          body: string;
          created_at: string;
          daily_action_id: string | null;
          goal_id: string | null;
          id: string;
          occurred_on: string;
          routine_id: string | null;
          status: ActionStatus | null;
          system_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          daily_action_id?: string | null;
          goal_id?: string | null;
          id?: string;
          occurred_on: string;
          routine_id?: string | null;
          status?: ActionStatus | null;
          system_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          daily_action_id?: string | null;
          goal_id?: string | null;
          id?: string;
          occurred_on?: string;
          routine_id?: string | null;
          status?: ActionStatus | null;
          system_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database["public"]["Tables"];
export type TableRow<T extends TableName> =
  Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];
