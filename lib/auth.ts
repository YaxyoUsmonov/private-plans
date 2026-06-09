import type {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
} from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export function signUpWithEmail(email: string, password: string) {
  return getSupabaseClient().auth.signUp({
    email,
    password,
  });
}

export function signInWithEmail(email: string, password: string) {
  return getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });
}

function signInWithOAuth(provider: "google" | "apple") {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Ijtimoiy kirish faqat brauzerda ishlaydi."),
    );
  }

  return getSupabaseClient().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export function signInWithGoogle() {
  return signInWithOAuth("google");
}

export function signInWithApple() {
  return signInWithOAuth("apple");
}

export function signOut() {
  return getSupabaseClient().auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await getSupabaseClient().auth.getUser();

  if (error) throw error;
  return user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await getSupabaseClient().auth.getSession();

  if (error) throw error;
  return session;
}

export function onAuthChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): Subscription {
  const {
    data: { subscription },
  } = getSupabaseClient().auth.onAuthStateChange(callback);

  return subscription;
}
