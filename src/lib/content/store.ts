"use client";

import { create } from "zustand";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { convex } from "@/lib/convex";
import { adminMutation, republish } from "@/lib/admin/session";
import { seed } from "./seed";
import type { Message, Project, SiteContent, SiteData, Settings, TeamMember } from "./types";

/**
 * What the site shows, held in memory. The public pages fill it from Convex
 * (server render, then live updates); the site manager fills it with drafts and
 * the inbox, and every edit is written to Convex. Edits show at once and are
 * rolled back if the save fails.
 */
type Snapshot = Pick<SiteData, "content" | "projects" | "team" | "settings">;

type Actions = {
  /** Take what the server holds (first render, or a live update). */
  load: (data: Partial<SiteData>) => void;
  setContent: (fn: (c: SiteContent) => SiteContent) => Promise<void>;
  saveProject: (p: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (ids: string[]) => Promise<void>;
  saveTeam: (team: TeamMember[]) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  setSettings: (s: Settings) => Promise<void>;
  addMessage: (m: Omit<Message, "id" | "createdAt" | "read">) => Promise<void>;
  setMessageRead: (id: string, read: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  restore: (data: Snapshot) => Promise<void>;
  resetAll: () => Promise<void>;
  /** The site manager's data has arrived from the server. */
  hydrated: boolean;
};

export type SiteStore = SiteData & Actions;

const uid = () => Math.random().toString(36).slice(2, 10);

export const useSite = create<SiteStore>()((set, get) => {
  /** Apply an edit locally, write it to Convex, and undo it locally if the write fails. */
  const edit = async (change: Partial<SiteData>, write: () => Promise<unknown>) => {
    const before = get();
    const undo: Partial<SiteData> = {};
    for (const key of Object.keys(change) as (keyof SiteData)[]) (undo as Record<string, unknown>)[key] = before[key];
    set(change);
    try {
      await write();
      republish();
    } catch (error) {
      set(undo);
      throw error;
    }
  };

  return {
    ...seed,
    hydrated: false,
    load: (data) => set(data),

    setContent: (fn) => {
      const content = fn(get().content);
      return edit({ content }, () => adminMutation(api.admin.saveContent, { content }));
    },
    saveProject: (p) => {
      const projects = get().projects.some((x) => x.id === p.id) ? get().projects.map((x) => (x.id === p.id ? p : x)) : [...get().projects, p];
      return edit({ projects }, () => adminMutation(api.admin.saveProject, { project: p }));
    },
    deleteProject: (id) => edit({ projects: get().projects.filter((p) => p.id !== id) }, () => adminMutation(api.admin.deleteProject, { id })),
    reorderProjects: (ids) =>
      edit({ projects: get().projects.map((p) => ({ ...p, order: ids.indexOf(p.id) + 1 })) }, () => adminMutation(api.admin.reorderProjects, { ids })),
    saveTeam: (team) => {
      const ordered = team.map((m, i) => ({ ...m, order: i + 1 }));
      return edit({ team: ordered }, () => adminMutation(api.admin.saveTeam, { team: ordered }));
    },
    deleteMember: (id) => edit({ team: get().team.filter((m) => m.id !== id) }, () => adminMutation(api.admin.deleteMember, { id })),
    setSettings: (settings) => edit({ settings }, () => adminMutation(api.admin.saveSettings, { settings })),

    addMessage: async (m) => {
      if (!convex) throw new Error("offline");
      await convex.mutation(api.messages.send, m);
    },
    setMessageRead: (id, read) =>
      edit({ messages: get().messages.map((m) => (m.id === id ? { ...m, read } : m)) }, () =>
        adminMutation(api.admin.setMessageRead, { id: id as Id<"messages">, read }),
      ),
    deleteMessage: (id) =>
      edit({ messages: get().messages.filter((m) => m.id !== id) }, () => adminMutation(api.admin.deleteMessage, { id: id as Id<"messages"> })),

    restore: (data) => edit(data, () => adminMutation(api.admin.restore, { data })),
    resetAll: () =>
      edit(
        { content: seed.content, projects: seed.projects, team: seed.team, settings: seed.settings },
        () => adminMutation(api.admin.resetToLaunch, {}),
      ),
  };
});

export const newId = (prefix: string) => `${prefix}-${uid()}`;

export const publishedProjects = (projects: Project[]) =>
  projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
