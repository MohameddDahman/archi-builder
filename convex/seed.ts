import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { replaceSite } from "./lib/data";
import { seed } from "../src/lib/content/seed";

/**
 * Load the launch content (src/lib/content/seed.ts) into an empty deployment:
 *   npx convex run seed:run            (does nothing if content exists)
 *   npx convex run seed:run '{"force":true}'   (replaces the content; keeps messages)
 */
export const run = internalMutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (existing && !force) return "Content already exists; pass force to replace it.";
    await replaceSite(ctx, { content: seed.content, settings: seed.settings, projects: seed.projects, team: seed.team });
    return `Seeded ${seed.projects.length} projects and ${seed.team.length} team members.`;
  },
});
