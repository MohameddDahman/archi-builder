import type { Project } from "@/lib/content/types";

/**
 * The portfolio as a sequence of physical pages.
 *
 * The flip-book needs a flat list of pages, but the content is edited as
 * projects. This imposes one into the other the way a book designer would:
 *
 *   cover
 *   contents | foreword
 *   opener   | plate           ← one per project
 *   plate    | detail grid     ← only when the project has the photographs
 *   colophon | endpaper
 *   back cover
 *
 * Every block adds an even number of pages, so openers always start a spread
 * and the back cover always closes the volume alone, which is what the
 * flip-book needs to shut properly. Folios follow print: the page facing the
 * inside of the cover is 002, and they run on from there.
 */

export type ContentsEntry = { number: number; project: Project; folio: number };

type Interior<T> = T & { id: string; folio: number };

export type BookPage =
  | { kind: "cover"; id: string }
  | Interior<{ kind: "contents"; entries: ContentsEntry[] }>
  | Interior<{ kind: "foreword" }>
  | Interior<{ kind: "opener"; number: number; project: Project; inset?: string }>
  | Interior<{ kind: "plate"; src: string; project: Project }>
  | Interior<{ kind: "grid"; project: Project; images: string[] }>
  | Interior<{ kind: "colophon" }>
  | Interior<{ kind: "endpaper" }>
  | { kind: "back"; id: string };

/** Distinct photographs, in order, leaving out any already used. */
function distinct(srcs: (string | undefined)[], exclude: string[]) {
  const seen = new Set(exclude);
  const out: string[] = [];
  for (const src of srcs) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

export function buildBook(projects: Project[]): BookPage[] {
  const entries: ContentsEntry[] = [];

  // Folios are filled in once the final order is known.
  const pages: BookPage[] = [
    { kind: "cover", id: "cover" },
    { kind: "contents", id: "contents", folio: 0, entries },
    { kind: "foreword", id: "foreword", folio: 0 },
  ];

  projects.forEach((project) => {
    const lead = project.cover || project.gallery[0];
    if (!lead) return;
    const more = distinct(project.gallery, [lead]);

    entries.push({ number: entries.length + 1, project, folio: pages.length + 1 });
    pages.push(
      { kind: "opener", id: `opener-${project.id}`, folio: 0, number: entries.length, project, inset: more[0] },
      { kind: "plate", id: `plate-${project.id}`, folio: 0, src: lead, project },
    );

    // A second spread only when there is enough photography to fill it well:
    // a detail page with one lonely photograph reads as padding.
    if (more.length >= 2) {
      pages.push(
        { kind: "plate", id: `plate-b-${project.id}`, folio: 0, src: more[0], project },
        { kind: "grid", id: `grid-${project.id}`, folio: 0, project, images: more.slice(1, 4) },
      );
    }
  });

  pages.push(
    { kind: "colophon", id: "colophon", folio: 0 },
    { kind: "endpaper", id: "endpaper", folio: 0 },
    { kind: "back", id: "back" },
  );

  // Interior page n sits at index n - 1 after the cover, so its folio is its
  // index + 1: the left page of every spread is even, the right page odd.
  pages.forEach((page, index) => {
    if (page.kind !== "cover" && page.kind !== "back") page.folio = index + 1;
  });

  return pages;
}

/** The spread a page index belongs to: 0 is the cover, then one per opening. */
export function spreadStartOf(index: number, count: number) {
  if (index <= 0) return 0;
  if (index >= count - 1) return count - 1;
  return index % 2 === 1 ? index : index - 1;
}
