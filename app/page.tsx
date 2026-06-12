"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { TouchDebugger } from "@/components/debug/touch-debugger";
import { ProgressTab } from "@/components/tabs/progress-tab";
import { SettingsTab } from "@/components/tabs/settings-tab";
import { TodayTab } from "@/components/tabs/today-tab";
import {
  loadPlansData,
  persistActionStatus,
  persistCreation,
  persistEntityName,
  persistEntitySchedule,
  persistGoalProgress,
  persistSystemChanges,
  persistSystemDelete,
} from "@/lib/plans-data";
import {
  applyCreationPayload,
  systems as mockSystems,
  type CreateSystemPayload,
  type DailyAction,
  type System,
  type TabKey,
  type TodaySystemView,
  type WeekdayKey,
} from "@/lib/mock-data";

export default function Home() {
  return (
    <AuthGuard>
      <PlansApp />
    </AuthGuard>
  );
}

function PlansApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [systems, setSystems] = useState<System[]>([]);

  const refreshSystems = useCallback(async () => {
    try {
      setSystems(await loadPlansData());
    } catch (error) {
      console.error("[Plans] Supabase data yuklanmadi:", error);
      if (process.env.NODE_ENV === "development") {
        setSystems(mockSystems);
      }
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    void loadPlansData()
      .then((data) => {
        if (isActive) setSystems(data);
      })
      .catch((error) => {
        console.error("[Plans] Supabase data yuklanmadi:", error);
        if (isActive && process.env.NODE_ENV === "development") {
          setSystems(mockSystems);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleCreate = useCallback(
    (payload: CreateSystemPayload) => {
      const snapshot = systems;
      setSystems((current) => applyCreationPayload(current, payload));
      void persistCreation(snapshot, payload)
        .then(refreshSystems)
        .catch((error) => {
          console.error("[Plans] Yaratish Supabase'ga yozilmadi:", error);
          void refreshSystems();
        });
    },
    [refreshSystems, systems],
  );

  const handleStatusPersist = useCallback(
    (system: System, action: DailyAction, date: string, status: "planned" | "completed" | "missed", reflectionBody?: string) => {
      void persistActionStatus({ system, action, date, status, reflectionBody })
        .then(refreshSystems)
        .catch((error) => {
          console.error("[Plans] Status Supabase'ga yozilmadi:", error);
          void refreshSystems();
        });
    },
    [refreshSystems],
  );

  const handleNamePersist = useCallback(
    (view: TodaySystemView, name: string) => {
      void persistEntityName(view, name).then(refreshSystems).catch((error) => {
        console.error("[Plans] Nom Supabase'da yangilanmadi:", error);
        void refreshSystems();
      });
    },
    [refreshSystems],
  );

  const handleSchedulePersist = useCallback(
    (view: TodaySystemView, cadence: string, days: WeekdayKey[]) => {
      void persistEntitySchedule(view, cadence, days).then(refreshSystems).catch((error) => {
        console.error("[Plans] Jadval Supabase'da yangilanmadi:", error);
        void refreshSystems();
      });
    },
    [refreshSystems],
  );

  const handleGoalProgressPersist = useCallback(
    (input: {
      goalId: string;
      systemId: string;
      date: string;
      currentAmount: number;
      targetAmount: number;
      unit: string;
    }) => {
      void persistGoalProgress(input)
        .then(refreshSystems)
        .catch((error) => {
          console.error("[Plans] Maqsad progressi Supabase'da yangilanmadi:", error);
          void refreshSystems();
        });
    },
    [refreshSystems],
  );

  const handleSystemChangePersist = useCallback(
    (systemId: string, changes: Partial<System>) => {
      void persistSystemChanges(systemId, changes).then(refreshSystems).catch((error) => {
        console.error("[Plans] Tizim Supabase'da yangilanmadi:", error);
        void refreshSystems();
      });
    },
    [refreshSystems],
  );

  const handleSystemDeletePersist = useCallback(
    (systemId: string) => {
      void persistSystemDelete(systemId).then(refreshSystems).catch((error) => {
        console.error("[Plans] Tizim Supabase'dan o'chirilmadi:", error);
        void refreshSystems();
      });
    },
    [refreshSystems],
  );

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#050816] px-3.5 pb-44 pt-5 sm:px-5">
      <TouchDebugger />
        {activeTab === "today" ? (
          <TodayTab
            systems={systems}
            onSystemsChange={setSystems}
            onStatusPersist={handleStatusPersist}
            onNamePersist={handleNamePersist}
            onSchedulePersist={handleSchedulePersist}
            onGoalProgressPersist={handleGoalProgressPersist}
          />
        ) : null}
        {activeTab === "progress" ? (
          <ProgressTab
            systems={systems}
            onSystemsChange={setSystems}
            onCreate={handleCreate}
            onSystemChangePersist={handleSystemChangePersist}
            onSystemDeletePersist={handleSystemDeletePersist}
          />
        ) : null}
        {activeTab === "settings" ? <SettingsTab systems={systems} /> : null}

      <BottomNav
        activeTab={activeTab}
        systems={systems}
        onChange={setActiveTab}
        onCreate={handleCreate}
      />
    </main>
  );
}
