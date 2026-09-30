"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seed } from "./seed";
import type { Message, Project, SiteContent, SiteData, Settings, TeamMember } from "./types";

/**
 * Local content store. Mirrors the Convex tables in /convex so the swap is a
 * data-source change only: every page reads through `useSite`.
 */
type Actions = {
  setContent: (fn: (c: SiteContent) => SiteContent) => void;
  saveProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (ids: string[]) => void;
  saveMember: (m: TeamMember) => void;
  deleteMember: (id: string) => void;
  setSettings: (s: Settings) => void;
  addMessage: (m: Omit<Message, "id" | "createdAt" | "read">) => void;
  setMessageRead: (id: string, read: boolean) => void;
  deleteMessage: (id: string) => void;
  resetAll: () => void;
  hydrated: boolean;
};

export type SiteStore = SiteData & Actions;

const uid = () => Math.random().toString(36).slice(2, 10);

export const useSite = create<SiteStore>()(
  persist(
    (set) => ({
      ...seed,
      hydrated: false,
      setContent: (fn) => set((s) => ({ content: fn(s.content) })),
      saveProject: (p) =>
        set((s) => {
          const exists = s.projects.some((x) => x.id === p.id);
          return {
            projects: exists
              ? s.projects.map((x) => (x.id === p.id ? p : x))
              : [...s.projects, p],
          };
        }),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      reorderProjects: (ids) =>
        set((s) => ({
          projects: s.projects.map((p) => ({ ...p, order: ids.indexOf(p.id) + 1 })),
        })),
      saveMember: (m) =>
        set((s) => {
          const exists = s.team.some((x) => x.id === m.id);
          return { team: exists ? s.team.map((x) => (x.id === m.id ? m : x)) : [...s.team, m] };
        }),
      deleteMember: (id) => set((s) => ({ team: s.team.filter((m) => m.id !== id) })),
      setSettings: (settings) => set({ settings }),
      addMessage: (m) =>
        set((s) => ({
          messages: [{ ...m, id: uid(), createdAt: Date.now(), read: false }, ...s.messages],
        })),
      setMessageRead: (id, read) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, read } : m)) })),
      deleteMessage: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
      resetAll: () => set({ ...seed }),
    }),
    {
      name: "archi-builder-site",
      version: 3,
      migrate: (persisted, version) => {
        const old = persisted as Partial<SiteData> | undefined;
        // v3 introduced the redesign copy; keep only inbound messages from older data.
        if (version < 3) return { ...seed, messages: old?.messages ?? [] };
        return persisted as SiteData;
      },
      storage: createJSONStorage(() => ({
        getItem: (k) => localStorage.getItem(k),
        removeItem: (k) => localStorage.removeItem(k),
        setItem: (k, v) => {
          try {
            localStorage.setItem(k, v);
          } catch {
            // Browser storage is ~5 MB; uploaded images fill it fast until Convex storage is connected.
            window.dispatchEvent(new CustomEvent("ab:storage-full"));
          }
        },
      })),
      skipHydration: true,
      partialize: ({ content, projects, team, settings, messages }) => ({
        content,
        projects,
        team,
        settings,
        messages,
      }),
      onRehydrateStorage: () => () => {
        useSite.setState({ hydrated: true });
      },
    },
  ),
);

export const newId = (prefix: string) => `${prefix}-${uid()}`;

/** Approximate bytes used by the saved site in browser storage. */
export const storageUsed = () => {
  try {
    return (localStorage.getItem("archi-builder-site")?.length ?? 0) * 2;
  } catch {
    return 0;
  }
};

export const publishedProjects = (projects: Project[]) =>
  projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
