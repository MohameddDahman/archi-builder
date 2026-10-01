import { v } from "convex/values";
import { env, internalMutation, mutation, query } from "./_generated/server";
import { limits } from "./lib/limits";
import { isAdmin, newToken, SESSION_DAYS, sha256 } from "./lib/session";

/**
 * The site manager signs in with one shared password (the ADMIN_PASSWORD env
 * var on the deployment) and gets a session token, kept in the browser.
 *
 * Wrong passwords return a result rather than throw: a thrown error would roll
 * back the rate limit with the rest of the transaction.
 */
export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const expected = env.ADMIN_PASSWORD;
    if (!expected) return { ok: false as const, reason: "not-configured" as const };

    const allowed = await limits.check(ctx, "adminLogin");
    if (!allowed.ok) return { ok: false as const, reason: "locked" as const, retryAfter: allowed.retryAfter };

    // Compare digests, so the comparison takes the same time whatever was typed.
    if ((await sha256(password.trim())) !== (await sha256(expected))) {
      await limits.limit(ctx, "adminLogin");
      return { ok: false as const, reason: "wrong" as const };
    }

    const token = newToken();
    await ctx.db.insert("sessions", {
      tokenHash: await sha256(token),
      expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    });
    return { ok: true as const, token };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const tokenHash = await sha256(token);
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (session) await ctx.db.delete("sessions", session._id);
    return null;
  },
});

/** Whether a stored token still opens the site manager. */
export const session = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => ({ valid: await isAdmin(ctx, token) }),
});

/** Run by the cron in crons.ts: drop sessions past their expiry. */
export const sweepSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("sessions")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", Date.now()))
      .take(200);
    for (const s of expired) await ctx.db.delete("sessions", s._id);
    return null;
  },
});

/**
 * A session without the password, for maintenance scripts and automated tests.
 * Internal: only runnable from the CLI or dashboard by the deployment's owner
 * (npx convex run auth:issueSession), never from a browser.
 */
export const issueSession = internalMutation({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, { hours }) => {
    const token = newToken();
    await ctx.db.insert("sessions", { tokenHash: await sha256(token), expiresAt: Date.now() + (hours ?? 2) * 60 * 60 * 1000 });
    return token;
  },
});
