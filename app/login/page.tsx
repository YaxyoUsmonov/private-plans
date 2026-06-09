"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getCurrentSession,
  onAuthChange,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

type AuthMode = "signin" | "signup";
type OAuthProvider = "google" | "apple";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] =
    useState<OAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isActive = true;
    const redirectAuthenticatedUser = async () => {
      try {
        const session = await getCurrentSession();
        if (isActive && session) router.replace("/");
      } catch (error) {
        console.error("[Auth] Login sahifasida sessiya tekshiruvi muvaffaqiyatsiz:", error);
      }
    };

    void redirectAuthenticatedUser();

    const subscription = onAuthChange((_event, session) => {
      if (isActive && session) router.replace("/");
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Supabase is not configured. Add the URL and anon key to .env.local.",
      );
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(normalizedEmail, password);
        if (error) throw error;
      } else {
        const { data, error } = await signUpWithEmail(normalizedEmail, password);
        if (error) throw error;

        if (!data.session) {
          setSuccessMessage(
            "Account created. Check your email to confirm your account.",
          );
          return;
        }
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage(
        "Supabase is not configured. Add the URL and anon key to .env.local.",
      );
      return;
    }

    setActiveOAuthProvider(provider);

    try {
      const { error } =
        provider === "google"
          ? await signInWithGoogle()
          : await signInWithApple();

      if (error) throw error;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not start social login.",
      );
      setActiveOAuthProvider(null);
    }
  };

  const authIsBusy = isSubmitting || activeOAuthProvider !== null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B1B] px-4 py-[calc(env(safe-area-inset-top)+1.5rem)] sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[#050816]" />
      <div className="pointer-events-none absolute left-1/2 top-[-19rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#7F00FF]/10" />
      <div className="pointer-events-none absolute bottom-[-18rem] left-1/2 h-[30rem] w-[42rem] -translate-x-1/2 rounded-full bg-[#7F00FF]/5" />

      <section className="relative w-full max-w-[400px] rounded-[30px] border border-violet-400/[0.22] bg-[#11162A]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)] sm:p-7">
        <header className="mb-6 text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-white/[0.045] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Private Plans
          </p>
          <h1 className="mt-3.5 text-[29px] font-black leading-tight text-white">
            {mode === "signin" ? "Login" : "Create account"}
          </h1>
          <p className="mx-auto mt-2 max-w-[310px] text-[13px] font-semibold leading-5 text-slate-400">
            {mode === "signin"
              ? "Continue to your private growth system."
              : "Create your Private Plans account."}
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block px-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              Email
            </span>
            <span className="flex items-center gap-3 rounded-[18px] border border-white/[0.09] bg-white/[0.045] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition duration-200 focus-within:border-violet-400/45 focus-within:bg-violet-500/[0.055] focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <Mail size={17} strokeWidth={1.8} className="shrink-0 text-violet-200/80" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="email@example.com"
                className="login-auth-input min-w-0 flex-1 bg-transparent py-3.5 text-[15px] font-semibold text-white outline-none placeholder:text-slate-600"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block px-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              Password
            </span>
            <span className="flex items-center gap-3 rounded-[18px] border border-white/[0.09] bg-white/[0.045] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition duration-200 focus-within:border-violet-400/45 focus-within:bg-violet-500/[0.055] focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <LockKeyhole size={17} strokeWidth={1.8} className="shrink-0 text-violet-200/80" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="At least 6 characters"
                minLength={6}
                className="login-auth-input min-w-0 flex-1 bg-transparent py-3.5 text-[15px] font-semibold text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition active:scale-95"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {mode === "signin" ? (
            <div className="flex items-center justify-between gap-4 px-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded-[5px] border border-white/15 bg-white/[0.04] accent-violet-500"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() =>
                  setSuccessMessage("Password recovery will be available soon.")
                }
                className="text-xs font-bold text-violet-300 transition hover:text-violet-200"
              >
                Forgot Password?
              </button>
            </div>
          ) : null}

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-[18px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold leading-5 text-red-200"
            >
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-[18px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold leading-5 text-emerald-100">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={authIsBusy}
            className="plans-focus-button mt-1 flex h-[50px] w-full items-center justify-center rounded-[18px] border px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signin"
                ? "Login"
                : "Sign up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3.5">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => void handleOAuthSignIn("google")}
            disabled={authIsBusy}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[18px] border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-200 hover:-translate-y-px hover:border-violet-300/30 hover:bg-violet-500/[0.075] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:translate-y-0 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
          >
            <GoogleLogo />
            {activeOAuthProvider === "google"
              ? "Opening Google..."
              : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={() => void handleOAuthSignIn("apple")}
            disabled={authIsBusy}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[18px] border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-200 hover:-translate-y-px hover:border-violet-300/30 hover:bg-violet-500/[0.075] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:translate-y-0 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
          >
            <AppleLogo />
            {activeOAuthProvider === "apple"
              ? "Opening Apple..."
              : "Continue with Apple"}
          </button>
        </div>

        <p className="mt-5 text-center text-xs font-semibold text-slate-500">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="font-black text-violet-300 transition hover:text-violet-200"
          >
            {mode === "signin" ? "Sign up" : "Login"}
          </button>
        </p>
      </section>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.837.859-3.047.859-2.344 0-4.329-1.585-5.037-3.711H.956v2.333A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.963 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.281-1.71V4.957H.956A9 9 0 0 0 0 9c0 1.452.348 2.827.956 4.043l3.007-2.333Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.442 1.345l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.957L3.963 7.29C4.67 5.164 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[21px] w-[21px] shrink-0 fill-current text-white"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  );
}
