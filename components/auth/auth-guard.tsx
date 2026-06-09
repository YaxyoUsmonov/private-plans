"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession, onAuthChange } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isActive = true;
    let subscription: ReturnType<typeof onAuthChange> | null = null;

    if (!isSupabaseConfigured) {
      router.replace("/login");
      return;
    }

    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (!isActive) return;

        if (!session) {
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("[Auth] Session tekshiruvi muvaffaqiyatsiz:", error);
        if (isActive) router.replace("/login");
      }
    };

    void checkSession();

    subscription = onAuthChange((_event, session) => {
      if (!isActive) return;

      if (session) {
        setIsAuthenticated(true);
        return;
      }

      setIsAuthenticated(false);
      router.replace("/login");
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="h-8 w-8 animate-pulse rounded-full border border-violet-300/20 bg-violet-400/15" />
          <p className="text-sm font-bold text-slate-400">Sessiya tekshirilmoqda...</p>
        </div>
      </main>
    );
  }

  return children;
}
