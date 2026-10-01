import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { readSite, replaceSite, toMessage } from "./lib/data";
import { isAdmin, requireAdmin } from "./lib/session";
import { memberInput, projectInput, settingsInput } from "./lib/validators";
import { seed } from "../src/lib/content/seed";

const MAX_MESSAGES = 300;

/**
 * Everything the site manager edits, drafts included, plus the inbox.
 * Returns null for a missing or ended session, so the admin can show sign-in.
 */
export const data = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!(await isAdmin(ctx, token))) return null;
    const site = await readSite(ctx, { drafts: true });
    const messages = await ctx.db.query("messages").order("desc").take(MAX_MESSAGES);
    return { ...site, messages: messages.map(toMessage) };
  },
});

/* ---- Page content and settings ------------------------------------------- */

export const saveContent = mutation({
  args: { token: v.string(), content: v.any() },
  handler: async (ctx, { token, content }) => {
    await requireAdmin(ctx, token);
    const doc = await ctx.db
      .query("content")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (doc) await ctx.db.patch("content", doc._id, { value: content });
    else await ctx.db.insert("content", { key: "site", value: content });
    return null;
  },
});

export const saveSettings = mutation({
  args: { token: v.string(), settings: settingsInput },
  handler: async (ctx, { token, settings }) => {
    await requireAdmin(ctx, token);
    const doc = await ctx.db.query("settings").first();
    if (doc) await ctx.db.replace("settings", doc._id, settings);
    else await ctx.db.insert("settings", settings);
    return null;
  },
});

/* ---- Projects ------------------------------------------------------------- */

export const saveProject = mutation({
  args: { token: v.string(), project: projectInput },
  handler: async (ctx, { token, project }) => {
    await requireAdmin(ctx, token);
    const { id, ...fields } = project;
    if (!fields.slug.trim()) throw new ConvexError({ code: "INVALID", message: "The project needs a web address." });
    const clash = (await ctx.db.query("projects").take(200)).find((p) => p.slug === fields.slug && p.key !== id);
    if (clash) throw new ConvexError({ code: "SLUG_TAKEN", message: "Another project already uses this web address." });
    const doc = await ctx.db
      .query("projects")
      .withIndex("by_key", (q) => q.eq("key", id))
      .unique();
    if (doc) await ctx.db.replace("projects", doc._id, { key: id, ...fields });
    else await ctx.db.insert("projects", { key: id, ...fields });
    return null;
  },
});

export const deleteProject = mutation({
  args: { token: v.string(), id: v.string() },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    const doc = await ctx.db
      .query("projects")
      .withIndex("by_key", (q) => q.eq("key", id))
      .unique();
    if (doc) await ctx.db.delete("projects", doc._id);
    return null;
  },
});

/** `ids` in their new running order. */
export const reorderProjects = mutation({
  args: { token: v.string(), ids: v.array(v.string()) },
  handler: async (ctx, { token, ids }) => {
    await requireAdmin(ctx, token);
    for (const doc of await ctx.db.query("projects").take(200)) {
      const order = ids.indexOf(doc.key) + 1;
      if (order > 0 && order !== doc.order) await ctx.db.patch("projects", doc._id, { order });
    }
    return null;
  },
});

/* ---- Team ----------------------------------------------------------------- */

/** The whole team as edited: updates, additions and running order in one go. */
export const saveTeam = mutation({
  args: { token: v.string(), team: v.array(memberInput) },
  handler: async (ctx, { token, team }) => {
    await requireAdmin(ctx, token);
    for (const [i, member] of team.entries()) {
      const { id, ...fields } = member;
      const doc = await ctx.db
        .query("team")
        .withIndex("by_key", (q) => q.eq("key", id))
        .unique();
      const next = { key: id, ...fields, order: i + 1 };
      if (doc) await ctx.db.replace("team", doc._id, next);
      else await ctx.db.insert("team", next);
    }
    return null;
  },
});

export const deleteMember = mutation({
  args: { token: v.string(), id: v.string() },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    const doc = await ctx.db
      .query("team")
      .withIndex("by_key", (q) => q.eq("key", id))
      .unique();
    if (doc) await ctx.db.delete("team", doc._id);
    return null;
  },
});

/* ---- Inbox ---------------------------------------------------------------- */

export const setMessageRead = mutation({
  args: { token: v.string(), id: v.id("messages"), read: v.boolean() },
  handler: async (ctx, { token, id, read }) => {
    await requireAdmin(ctx, token);
    if (await ctx.db.get("messages", id)) await ctx.db.patch("messages", id, { read });
    return null;
  },
});

export const deleteMessage = mutation({
  args: { token: v.string(), id: v.id("messages") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    if (await ctx.db.get("messages", id)) await ctx.db.delete("messages", id);
    return null;
  },
});

/* ---- Images ----------------------------------------------------------------- */

/** Step 1 of an upload: a short-lived URL the browser posts the file to. */
export const uploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Step 2: the address the site uses to show the uploaded file. */
export const fileUrl = mutation({
  args: { token: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, { token, storageId }) => {
    await requireAdmin(ctx, token);
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new ConvexError({ code: "NOT_FOUND", message: "The upload didn't arrive. Try again." });
    return url;
  },
});

/* ---- Backup ----------------------------------------------------------------- */

export const restore = mutation({
  args: {
    token: v.string(),
    data: v.object({
      content: v.any(),
      settings: settingsInput,
      projects: v.array(projectInput),
      team: v.array(memberInput),
    }),
  },
  handler: async (ctx, { token, data }) => {
    await requireAdmin(ctx, token);
    await replaceSite(ctx, data);
    return null;
  },
});

/** Back to the launch content. Messages stay. */
export const resetToLaunch = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    await replaceSite(ctx, { content: seed.content, settings: seed.settings, projects: seed.projects, team: seed.team });
    return null;
  },
});
