import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Message, Project, Settings, SiteContent, TeamMember } from "@/lib/content/types";

const MAX_PROJECTS = 200;
const MAX_TEAM = 100;

export function toProject(doc: Doc<"projects">): Project {
  const { _id, _creationTime, key, ...rest } = doc;
  void _id;
  void _creationTime;
  return { id: key, ...rest };
}

export function toMember(doc: Doc<"team">): TeamMember {
  const { _id, _creationTime, key, ...rest } = doc;
  void _id;
  void _creationTime;
  return { id: key, ...rest };
}

export function toMessage(doc: Doc<"messages">): Message {
  const { _id, _creationTime, ...rest } = doc;
  return { id: _id, createdAt: _creationTime, ...rest };
}

function toSettings(doc: Doc<"settings">): Settings {
  const { _id, _creationTime, ...rest } = doc;
  void _id;
  void _creationTime;
  return rest;
}

/** Everything the site shows. `null` content means the database hasn't been seeded yet. */
export async function readSite(ctx: QueryCtx, { drafts }: { drafts: boolean }) {
  const content = await ctx.db
    .query("content")
    .withIndex("by_key", (q) => q.eq("key", "site"))
    .unique();
  const settings = await ctx.db.query("settings").first();
  const projects = await ctx.db.query("projects").withIndex("by_order").take(MAX_PROJECTS);
  const team = await ctx.db.query("team").withIndex("by_order").take(MAX_TEAM);
  return {
    content: (content?.value ?? null) as SiteContent | null,
    settings: settings ? toSettings(settings) : null,
    projects: projects.filter((p) => drafts || p.published).map(toProject),
    team: team.map(toMember),
  };
}

export type SiteSnapshot = {
  content: SiteContent;
  settings: Settings;
  projects: Project[];
  team: TeamMember[];
};

/** Replace the editable content wholesale (restore a backup, or go back to the launch copy). Messages are kept. */
export async function replaceSite(ctx: MutationCtx, data: SiteSnapshot) {
  for (const table of ["projects", "team", "content", "settings"] as const) {
    for (const doc of await ctx.db.query(table).take(500)) await ctx.db.delete(table, doc._id);
  }
  await ctx.db.insert("content", { key: "site", value: data.content });
  await ctx.db.insert("settings", data.settings);
  for (const [i, p] of data.projects.entries()) {
    const { id, ...rest } = p;
    await ctx.db.insert("projects", { key: id, ...rest, order: rest.order ?? i + 1 });
  }
  for (const [i, m] of data.team.entries()) {
    const { id, ...rest } = m;
    await ctx.db.insert("team", { key: id, ...rest, order: rest.order ?? i + 1 });
  }
}
