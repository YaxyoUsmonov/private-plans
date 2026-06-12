"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  HelpCircle,
  Languages,
  LifeBuoy,
  LogOut,
  Palette,
  RefreshCcw,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DetailPanel, PanelEmptyState } from "@/components/ui/detail-panel";
import { sheetSpring } from "@/lib/motion";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { System } from "@/lib/mock-data";
import { getProfile, updateProfileDisplayName } from "@/lib/plans-db";
import { uz } from "@/lib/uz";

type SettingsKey = "profile" | "notifications" | "appearance" | "language" | "ai" | "privacy" | "help";
type ThemeValue = "Qorong‘i" | "Tizim";
type LanguageValue = "O‘zbek" | "Ingliz" | "Rus";

const settingsSections = [
  { key: "profile", title: uz.settings.profile, subtitle: uz.settings.profileSubtitle, icon: User },
  { key: "notifications", title: uz.settings.notifications, subtitle: uz.settings.notificationsSubtitle, icon: Bell },
  { key: "appearance", title: uz.settings.appearance, subtitle: uz.settings.appearanceSubtitle, icon: Palette },
  { key: "language", title: uz.settings.language, subtitle: uz.settings.languageSubtitle, icon: Languages },
  { key: "ai", title: uz.settings.aiPreferences, subtitle: uz.settings.aiSubtitle, icon: Bot },
  { key: "privacy", title: uz.settings.privacy, subtitle: uz.settings.privacySubtitle, icon: Shield },
  { key: "help", title: uz.settings.help, subtitle: uz.settings.helpSubtitle, icon: HelpCircle },
] satisfies Array<{ key: SettingsKey; title: string; subtitle: string; icon: typeof User }>;

const helpRows = [
  "Private Plans qanday ishlaydi",
  "Tizimlar nima?",
  "Odatlar va maqsadlar farqi",
  "AI murabbiy haqida",
  "Ko‘p so‘raladigan savollar",
  "Yordam bilan bog‘lanish",
];

const queueNotifications: Array<{ title: string; time: string; enabled: boolean }> = [];

const soundOptions = ["Private standart", "Yumshoq puls", "Chuqur fokus", "Sokin qo‘ng‘iroq"] as const;

type CachedAccountProfile = {
  email: string | null;
  displayName: string;
};

let cachedAccountProfile: CachedAccountProfile | null = null;

export function SettingsTab({ systems }: { systems: System[] }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsKey | null>(null);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weekendReminder, setWeekendReminder] = useState(false);
  const [missedReminder, setMissedReminder] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [missedNudges, setMissedNudges] = useState(true);
  const [aiReminderOptimization, setAiReminderOptimization] = useState(false);
  const [queueState, setQueueState] = useState(queueNotifications);
  const [sound, setSound] = useState<(typeof soundOptions)[number]>("Private standart");
  const [aiCoach, setAiCoach] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(true);
  const [theme, setTheme] = useState<ThemeValue>("Qorong‘i");
  const [language, setLanguage] = useState<LanguageValue>("O‘zbek");
  const [mockMessage, setMockMessage] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const activeMeta = settingsSections.find((section) => section.key === activeSection) ?? null;
  const showMockMessage = (message: string) => {
    setMockMessage(message);
    window.setTimeout(() => setMockMessage(""), 1800);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await signOut();
      if (error) throw error;

      cachedAccountProfile = null;
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Hisobdan chiqib bo'lmadi.",
      );
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      <header>
        <h1 className="text-[34px] font-black leading-none tracking-tight text-white">{uz.settings.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{uz.settings.subtitle}</p>
      </header>

      {mockMessage ? (
        <div className="rounded-2xl border border-violet-200/12 bg-violet-400/10 px-3 py-2 text-sm font-bold text-violet-100">
          {mockMessage}
        </div>
      ) : null}

      <section className="space-y-1.5">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className="flex min-h-[60px] w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.055)] transition duration-300 active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">{section.title}</span>
              </span>
              <ChevronRight size={17} className="shrink-0 text-slate-500" />
            </button>
          );
        })}
      </section>

      <section className="space-y-1.5">
        <button
          type="button"
          onClick={() =>
            showMockMessage("Ma'lumotlarni eksport qilish tez orada mavjud bo'ladi.")
          }
          className="flex min-h-[60px] w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] px-3.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.055)] transition duration-300 active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/10 bg-violet-400/10 text-violet-100">
            <Download size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-black text-white">
              Ma&apos;lumotlarni eksport qilish
            </span>
          </span>
          <ChevronRight size={17} className="shrink-0 text-slate-500" />
        </button>

      </section>

      <AnimatePresence>
        {activeMeta ? (
          <SettingsDrawer title={activeMeta.title} icon={activeMeta.icon} onClose={() => setActiveSection(null)}>
            {activeMeta.key === "profile" ? (
              <ProfileDetail
                systems={systems}
                isSigningOut={isSigningOut}
                signOutError={signOutError}
                onSignOut={handleSignOut}
              />
            ) : null}
            {activeMeta.key === "notifications" ? (
              <div className="space-y-5">
                <DrawerSection title="Kunlik eslatmalar">
                  <ToggleRow icon={Bell} title="Kunlik eslatmalar" value={dailyReminder} onChange={setDailyReminder} />
                  <ValueRow icon={Bell} title="Eslatma vaqti" value="Belgilanmagan" />
                  <ToggleRow icon={RefreshCcw} title="Dam olish kunlari eslatma" value={weekendReminder} onChange={setWeekendReminder} />
                  <ToggleRow icon={RefreshCcw} title="Bajarilmagan rutin eslatmasi" value={missedReminder} onChange={setMissedReminder} />
                </DrawerSection>

                <DrawerSection title="Bugungi navbat eslatmalari">
                  {queueState.length === 0 ? <PanelEmptyState title="Hali navbat eslatmalari yo'q" description="Real odatlar yaratilganda eslatmalar shu yerda ko'rinadi." compact /> : null}
                  {queueState.map((item, index) => (
                    <div key={item.title} className="rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setQueueState((current) =>
                              current.map((notification, notificationIndex) =>
                                notificationIndex === index ? { ...notification, enabled: !notification.enabled } : notification,
                              ),
                            )
                          }
                          className={`flex h-7 w-12 shrink-0 items-center rounded-full border p-1 transition duration-300 ${
                            item.enabled ? "border-[#25EB2F]/24 bg-[#25EB2F]/14" : "border-violet-200/10 bg-white/[0.04]"
                          }`}
                          aria-label={`${item.title} eslatmasi`}
                        >
                          <span className={`h-5 w-5 rounded-full transition duration-300 ${item.enabled ? "translate-x-5 bg-[#25EB2F]" : "bg-slate-500"}`} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-white">{item.title}</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.time}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showMockMessage(`${item.title}: vaqtni sozlash keyin ulanadi.`)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-200/10 bg-violet-400/10 text-violet-100"
                          aria-label={`${item.title} eslatmasini tahrirlash`}
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </DrawerSection>

                <DrawerSection title="Eslatma tovushlari">
                  <SegmentRow icon={Bell} title="Hozirgi tovush" value={sound} options={[...soundOptions]} onChange={setSound} />
                  <ValueRow icon={Bell} title="Ovoz namunasi" value="70%" />
                  <ActionRow icon={Sparkles} title="Custom tovush joyi" onClick={() => showMockMessage("Custom tovush tizimi keyin ulanadi.")} />
                </DrawerSection>

                <DrawerSection title="Aqlli bildirishnomalar">
                  <ToggleRow icon={Sparkles} title="Aqlli eslatma tavsiyalari" value={smartSuggestions} onChange={setSmartSuggestions} />
                  <ToggleRow icon={RefreshCcw} title="Bajarilmagan tizim nudgelari" value={missedNudges} onChange={setMissedNudges} />
                  <ToggleRow icon={Bot} title="AI eslatma optimizatsiyasi" value={aiReminderOptimization} onChange={setAiReminderOptimization} />
                </DrawerSection>
              </div>
            ) : null}
            {activeMeta.key === "appearance" ? (
              <div className="space-y-2">
                <SegmentRow icon={Palette} title="Mavzu" value={theme} options={["Qorong‘i", "Tizim"]} onChange={setTheme} />
                <ValueRow icon={Sparkles} title="Aksent rangi" value="#25EB2F" accent />
              </div>
            ) : null}
            {activeMeta.key === "language" ? (
              <SegmentRow icon={Languages} title="Til" value={language} options={["O‘zbek", "Ingliz", "Rus"]} onChange={setLanguage} />
            ) : null}
            {activeMeta.key === "ai" ? (
              <div className="space-y-2">
                <ToggleRow icon={Bot} title="AI murabbiy" value={aiCoach} onChange={setAiCoach} />
                <ToggleRow icon={Sparkles} title="Haftalik tahlil" value={weeklyReview} onChange={setWeeklyReview} />
                <ValueRow icon={Languages} title="Tahlil tili" value={language} />
              </div>
            ) : null}
            {activeMeta.key === "privacy" ? (
              <div className="space-y-2">
                <ActionRow icon={Download} title="Ma’lumotlarni eksport qilish" onClick={() => showMockMessage("Eksport skeleton tayyor, real action ulanmagan.")} />
                <ActionRow icon={RefreshCcw} title="Demo ma’lumotlarni reset qilish" danger onClick={() => showMockMessage("Reset skeleton, demo data o‘zgarmadi.")} />
                <div className="flex items-start gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.03] p-3">
                  <Shield size={18} className="mt-0.5 shrink-0 text-violet-100" />
                  <p className="text-xs leading-5 text-slate-500">Maxfiylik qaydi: bu skeleton real backend yoki data storage bilan ulanmagan.</p>
                </div>
              </div>
            ) : null}
            {activeMeta.key === "help" ? (
              <div className="space-y-2">
                {helpRows.map((row, index) => (
                  <ActionRow
                    key={row}
                    icon={index === helpRows.length - 1 ? LifeBuoy : HelpCircle}
                    title={row}
                    onClick={() => showMockMessage(`${row}: placeholder ekran keyin ulanadi.`)}
                    chevron
                  />
                ))}
              </div>
            ) : null}
          </SettingsDrawer>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SettingsDrawer({
  title,
  icon: Icon,
  onClose,
  children,
}: {
  title: string;
  icon: typeof User;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div className="plans-overlay pointer-events-auto fixed inset-0 z-[60]" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 1 }} transition={{ duration: 0.01 }}>
      <motion.button
        type="button"
        aria-label="Sozlamalar drawerini yopish"
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
        <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/12 bg-violet-400/10 text-violet-100">
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black text-white">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/12 bg-white/[0.045] text-slate-300 transition duration-300 active:scale-95"
            aria-label={uz.common.close}
          >
            <X size={18} />
          </button>
        </div>

        <button type="button" onClick={onClose} className="mx-4 mb-2.5 flex items-center gap-2 text-sm font-black text-violet-100/80">
          <ChevronLeft size={17} />
          {uz.common.back}
        </button>

        <div className="flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">{children}</div>
      </motion.aside>
    </motion.div>
  );
}

function ProfileDetail({
  systems,
  isSigningOut,
  signOutError,
  onSignOut,
}: {
  systems: System[];
  isSigningOut: boolean;
  signOutError: string;
  onSignOut: () => void;
}) {
  const [email, setEmail] = useState<string | null>(
    () => cachedAccountProfile?.email ?? null,
  );
  const [displayName, setDisplayName] = useState(
    () => cachedAccountProfile?.displayName ?? "",
  );
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(
    () => cachedAccountProfile?.displayName ?? "",
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadUser = async () => {
      try {
        const [user, profile] = await Promise.all([
          getCurrentUser(),
          getProfile(),
        ]);
        if (!isActive) return;

        const nextEmail = user?.email ?? null;
        const nextDisplayName = profile?.display_name?.trim() ?? "";
        cachedAccountProfile = {
          email: nextEmail,
          displayName: nextDisplayName,
        };
        setEmail(nextEmail);
        setDisplayName(nextDisplayName);
        setDraftName((current) => current || nextDisplayName);
      } catch (error) {
        console.error("[Auth] Profil foydalanuvchisini yuklab bo'lmadi:", error);
      }
    };

    void loadUser();

    return () => {
      isActive = false;
    };
  }, []);

  const routinesCount = systems.reduce(
    (total, system) => total + system.routines.length,
    0,
  );
  const goalsCount = systems.reduce(
    (total, system) => total + system.goals.length,
    0,
  );
  const completionLogs = systems.flatMap((system) => system.completionLogs);
  const completedCount = completionLogs.filter(
    (log) => log.status === "completed",
  ).length;
  const missedCount = completionLogs.filter(
    (log) => log.status === "missed",
  ).length;
  const resolvedCount = completedCount + missedCount;
  const successRate =
    resolvedCount > 0 ? Math.round((completedCount / resolvedCount) * 100) : 0;
  const visibleName =
    displayName.trim() || email || "Hisob ma'lumoti yuklanmoqda...";

  const openProfileEditor = () => {
    setDraftName(displayName);
    setProfileError("");
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (isSavingProfile) return;

    setIsSavingProfile(true);
    setProfileError("");

    try {
      const normalizedName = draftName.trim();
      const profile = await updateProfileDisplayName(normalizedName || null);
      const nextDisplayName = profile.display_name?.trim() ?? "";
      cachedAccountProfile = {
        email,
        displayName: nextDisplayName,
      };
      setDisplayName(nextDisplayName);
      setDraftName(nextDisplayName);
      setEditOpen(false);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Profilni saqlab bo'lmadi.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <section className="rounded-[24px] border border-violet-200/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-violet-200/12 bg-violet-400/12 text-violet-100">
              <User size={25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black text-white">{visibleName}</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                {email ?? "Hisob ma'lumoti yuklanmoqda..."}
              </p>
              <span className="mt-2 inline-flex rounded-full border border-violet-200/12 bg-violet-400/10 px-2.5 py-1 text-[11px] font-black text-violet-100">
                Free
              </span>
            </div>
            <button
              type="button"
              onClick={openProfileEditor}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/20 bg-[#3A025B] text-white transition duration-300 hover:border-[#7F00FF]/50 hover:bg-[#3A025B] active:scale-95"
              aria-label="Profilni tahrirlash"
            >
              <Edit3 size={17} />
            </button>
          </div>
        </section>

        <ProfileMetricsCard
          title="Faollik"
          metrics={[
            { label: "Tizimlar", value: systems.length },
            { label: "Odatlar", value: routinesCount },
            { label: "Maqsadlar", value: goalsCount },
          ]}
        />

        <ProfileMetricsCard
          title="Umumiy progress"
          metrics={[
            { label: "Bajarilgan", value: completedCount, tone: "success" },
            { label: "Bajarilmagan", value: missedCount, tone: "danger" },
            {
              label: "Muvaffaqiyat",
              value: successRate,
              suffix: "%",
              tone: "accent",
            },
          ]}
        />

        {signOutError ? (
          <p
            role="alert"
            className="rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200"
          >
            {signOutError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          className="flex min-h-[56px] w-full items-center gap-3 rounded-[22px] border border-red-400/16 bg-red-500/[0.07] px-4 py-3 text-left transition duration-300 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut size={18} className="shrink-0 text-red-300" />
          <span className="min-w-0 flex-1 text-sm font-black text-red-100">
            {isSigningOut ? "Chiqilmoqda..." : "Hisobdan chiqish"}
          </span>
        </button>
      </div>

      <DetailPanel
        open={editOpen}
        title="Profilni tahrirlash"
        subtitle="Ismingizni yangilang"
        icon={User}
        mode="sheet"
        zIndex="z-[80]"
        showBack={false}
        onClose={() => setEditOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => void saveProfile()}
            disabled={isSavingProfile}
            className="plans-focus-button min-h-12 w-full rounded-full border text-sm font-black text-white disabled:cursor-wait disabled:opacity-50"
          >
            {isSavingProfile ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">
              Ism
            </span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              autoFocus
              maxLength={80}
              placeholder={email ?? "Ismingizni kiriting"}
              className="min-h-12 w-full rounded-[20px] border border-violet-200/10 bg-white/[0.04] px-4 text-sm font-bold text-white outline-none placeholder:text-slate-600 focus:border-violet-200/24"
            />
          </label>

          <p className="px-1 text-xs font-semibold leading-5 text-slate-500">
            Ism bo‘sh qoldirilsa, profil nomi sifatida emailingiz ko‘rsatiladi.
          </p>

          {profileError ? (
            <p
              role="alert"
              className="rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200"
            >
              {profileError}
            </p>
          ) : null}
        </div>
      </DetailPanel>
    </>
  );
}

function ProfileMetricsCard({
  title,
  metrics,
}: {
  title: string;
  metrics: Array<{
    label: string;
    value: number;
    suffix?: string;
    tone?: "success" | "danger" | "accent";
  }>;
}) {
  return (
    <section className="rounded-[24px] border border-violet-200/10 bg-white/[0.035] p-4">
      <h3 className="text-sm font-black text-white">{title}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-[18px] border border-white/[0.055] bg-black/10 px-2 py-3 text-center"
          >
            <p
              className={`text-xl font-black ${
                metric.tone === "success"
                  ? "text-[#25EB2F]"
                  : metric.tone === "danger"
                    ? "text-[#FF6B63]"
                    : metric.tone === "accent"
                      ? "text-violet-300"
                      : "text-white"
              }`}
            >
              {metric.value}
              {metric.suffix}
            </p>
            <p className="mt-1 truncate text-[10px] font-bold text-slate-500">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-[12px] font-black uppercase tracking-[0.14em] text-violet-100">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ToggleRow({ icon: Icon, title, value, onChange }: { icon: typeof Bell; title: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3 text-left">
      <Icon size={18} className="shrink-0 text-violet-100" />
      <span className="min-w-0 flex-1 text-sm font-bold text-white">{title}</span>
      <span className={`flex h-7 w-12 items-center rounded-full border p-1 transition duration-300 ${value ? "border-[#25EB2F]/24 bg-[#25EB2F]/14" : "border-violet-200/10 bg-white/[0.04]"}`}>
        <span className={`h-5 w-5 rounded-full transition duration-300 ${value ? "translate-x-5 bg-[#25EB2F]" : "bg-slate-500"}`} />
      </span>
    </button>
  );
}

function ValueRow({ icon: Icon, title, value, accent = false }: { icon: typeof Bell; title: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3">
      <Icon size={18} className="shrink-0 text-violet-100" />
      <span className="min-w-0 flex-1 text-sm font-bold text-white">{title}</span>
      <span className={`text-xs font-black ${accent ? "text-[#C9FFD0]" : "text-slate-400"}`}>{value}</span>
    </div>
  );
}

function SegmentRow<T extends string>({ icon: Icon, title, value, options, onChange }: { icon: typeof Bell; title: string; value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <div className="rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3">
      <div className="mb-3 flex items-center gap-3">
        <Icon size={18} className="shrink-0 text-violet-100" />
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3 py-1.5 text-xs font-black transition duration-300 ${
              option === value ? "plans-selected-purple" : "border-violet-200/10 bg-white/[0.025] text-slate-500"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, title, onClick, danger = false, chevron = false }: { icon: typeof Bell; title: string; onClick: () => void; danger?: boolean; chevron?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-[22px] border border-violet-200/10 bg-white/[0.035] p-3 text-left transition duration-300 active:scale-[0.99]">
      <Icon size={18} className={`shrink-0 ${danger ? "text-[#FF3B30]" : "text-violet-100"}`} />
      <span className={`min-w-0 flex-1 text-sm font-bold ${danger ? "text-[#FFD1CD]" : "text-white"}`}>{title}</span>
      {chevron ? <ChevronRight size={17} className="text-slate-500" /> : null}
    </button>
  );
}
