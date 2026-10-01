"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLocale } from "@/components/providers/locale";
import { useSite, publishedProjects } from "@/lib/content/store";
import { buildBook } from "@/lib/book";
import type { BookCtx } from "./sheets";

/** The volume as the site sets it, built from the published projects marked for the book. */
export function useBook() {
  const all = useSite((s) => s.projects);
  return useMemo(() => {
    const projects = publishedProjects(all).filter((p) => p.inBook);
    return { projects, pages: buildBook(projects) };
  }, [all]);
}

/** What every page of the volume reads from: the language and the studio's content. */
export function useBookCtx(): Omit<BookCtx, "go"> {
  const { lang, t, n } = useLocale();
  const { content, settings, team } = useSite(useShallow((s) => ({ content: s.content, settings: s.settings, team: s.team })));
  return useMemo(() => ({ lang, t, n, content, settings, team }), [lang, t, n, content, settings, team]);
}
