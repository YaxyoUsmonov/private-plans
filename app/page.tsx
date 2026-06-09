"use client";

import { useCallback, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { TouchDebugger } from "@/components/debug/touch-debugger";
import { ProgressTab } from "@/components/tabs/progress-tab";
import { SettingsTab } from "@/components/tabs/settings-tab";
import { TodayTab } from "@/components/tabs/today-tab";
import { applyCreationPayload, systems as mockSystems, type CreateSystemPayload, type TabKey } from "@/lib/mock-data";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [systems, setSystems] = useState(mockSystems);
  const handleCreate = useCallback((payload: CreateSystemPayload) => {
    setSystems((current) => applyCreationPayload(current, payload));
  }, []);

  return (
    <AuthGuard>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#050816] px-3.5 pb-44 pt-5 sm:px-5">
        <TouchDebugger />
        {activeTab === "today" ? <TodayTab systems={systems} onSystemsChange={setSystems} /> : null}
        {activeTab === "progress" ? <ProgressTab systems={systems} onSystemsChange={setSystems} /> : null}
        {activeTab === "settings" ? <SettingsTab systems={systems} /> : null}

        <BottomNav
          activeTab={activeTab}
          systems={systems}
          onChange={setActiveTab}
          onCreate={handleCreate}
        />
      </main>
    </AuthGuard>
  );
}
