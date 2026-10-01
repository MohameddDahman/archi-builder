"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { ConvexError } from "convex/values";
import { convex } from "@/lib/convex";

type SessionState = { token: string | null; setToken: (token: string | null) => void };

/** The site manager's session token, kept in this browser. */
export const useAdminSession = create<SessionState>()(
  persist((set) => ({ token: null, setToken: (token) => set({ token }) }), {
    name: "ab-admin-session",
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({ token: s.token }),
    skipHydration: true,
  }),
);

export class SessionEnded extends Error {}

/** Run a site-manager mutation with the stored token; an ended session signs the admin out. */
export async function adminMutation<M extends FunctionReference<"mutation">>(
  ref: M,
  args: Omit<FunctionArgs<M>, "token">,
): Promise<FunctionReturnType<M>> {
  const token = useAdminSession.getState().token;
  if (!convex || !token) throw new SessionEnded();
  try {
    return await convex.mutation(ref, { ...args, token } as FunctionArgs<M>);
  } catch (error) {
    if (error instanceof ConvexError && (error.data as { code?: string } | undefined)?.code === "UNAUTHORIZED") {
      useAdminSession.getState().setToken(null);
      throw new SessionEnded();
    }
    throw error;
  }
}

let timer: number | undefined;
/** After a save: have the public pages rebuilt from the new content (batched). */
export function republish() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    const token = useAdminSession.getState().token;
    if (!token) return;
    void fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
  }, 600);
}

/** What to tell the site manager when a save fails. */
export function errorText(error: unknown) {
  if (error instanceof SessionEnded) return "Your session ended. Sign in again to keep editing.";
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return "Couldn't reach the server. Check your connection and try again.";
}
