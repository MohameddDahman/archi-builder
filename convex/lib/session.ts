import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const SESSION_DAYS = 30;

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256(text: string) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

/** 32 random bytes, URL-safe. */
export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function findSession(ctx: QueryCtx, token: string) {
  if (!token) return null;
  const tokenHash = await sha256(token);
  return await ctx.db
    .query("sessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
}

/** For queries: is this a signed-in site manager? (Expired sessions are swept by a cron.) */
export async function isAdmin(ctx: QueryCtx, token: string) {
  return (await findSession(ctx, token)) !== null;
}

/** For mutations: the session, or an UNAUTHORIZED error the admin turns into "sign in again". */
export async function requireAdmin(ctx: MutationCtx, token: string) {
  const session = await findSession(ctx, token);
  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Your session has ended. Sign in again." });
  }
  return session;
}
