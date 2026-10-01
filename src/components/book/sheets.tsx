"use client";

import Image from "next/image";
import { Fragment } from "react";
import clsx from "clsx";
import { Mark } from "@/components/brand/logo";
import { plain } from "@/components/ui/rich";
import type { BookPage } from "@/lib/book";
import type { Project, SiteContent, Settings, TeamMember } from "@/lib/content/types";
import type { L, Locale } from "@/lib/i18n";
import { ui } from "@/lib/dict";

export type Side = "left" | "right";

/** Everything a page needs to set itself, in the reader's language. */
export type BookCtx = {
  lang: Locale;
  t: (v: L | undefined) => string;
  n: (v: string | number) => string;
  content: SiteContent;
  settings: Settings;
  team: TeamMember[];
  /** Turn to the page with this folio. Absent in the printed copy. */
  go?: (folio: number) => void;
};

export const pad = (value: number, width = 3) => String(value).padStart(width, "0");

/** A folio or index number: zero-padded in Latin figures, plain in Arabic ones, as each is printed. */
export const figure = (c: Pick<BookCtx, "lang" | "n">, value: number, width = 3) => c.n(c.lang === "ar" ? String(value) : pad(value, width));

export const projectName = (p: Project, lang: Locale) => (lang === "ar" ? p.nameAr || p.name : p.name);

const JEDDAH: L = { en: "Jeddah", ar: "جدة" };

/*
 * Type inside a page is sized in container units, so it scales with the page
 * rather than the window. The minimums are set for a single page on a phone,
 * where the page is the whole reading surface and has to stay legible.
 */
const T = {
  micro: "text-[clamp(0.56rem,1.8cqw,0.66rem)]",
  label: "text-[clamp(0.6rem,2cqw,0.72rem)]",
  small: "text-[clamp(0.64rem,2.1cqw,0.76rem)]",
  body: "text-[clamp(0.72rem,2.55cqw,0.9rem)]",
  lead: "text-[clamp(1.05rem,5.2cqw,1.8rem)]",
  title: "text-[clamp(1.5rem,8cqw,2.9rem)]",
  numeral: "text-[clamp(1.9rem,11cqw,3.8rem)]",
};

/** Bronze: the gold of the mark, darkened to read on paper. */
const BRONZE = "text-[#7a5a12]";

/* ---- Paper, boards, and the furniture every page shares ------------------ */

function Paper({ children }: { children: React.ReactNode }) {
  return (
    <div className="book-paper @container relative h-full w-full overflow-hidden text-[#17130f]">
      {children}
      <span aria-hidden="true" className="book-gutter" />
    </div>
  );
}

function Board({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("@container relative h-full w-full overflow-hidden bg-[#0f0e0d] text-[#f3eee6]", className)}>
      <span
        aria-hidden="true"
        className="book-glow absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,rgb(224_171_38/0.2),transparent_70%)]"
      />
      <span aria-hidden="true" className="absolute inset-[5cqw] border border-[#e0ab26]/15" />
      {children}
      <span aria-hidden="true" className="book-gutter" />
    </div>
  );
}

function Folio({ value, side, c, onDark = false }: { value: number; side: Side; c: BookCtx; onDark?: boolean }) {
  return (
    <span
      className={clsx(
        "bk-mono absolute bottom-[4.5cqw] z-20",
        T.micro,
        side === "left" ? "left-[5.5cqw]" : "right-[5.5cqw]",
        onDark ? "text-white/55" : "text-black/45",
      )}
    >
      {figure(c, value)}
    </span>
  );
}

function Photo({
  src,
  sizes,
  eager,
  quality = 75,
  bleed = false,
  className,
}: {
  src: string;
  sizes: string;
  eager: boolean;
  quality?: 60 | 75 | 85;
  /** Printed to the trim: fills the whole page. */
  bleed?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx(bleed ? "absolute inset-0" : "relative", "overflow-hidden bg-[#e3dbcf]", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        quality={quality}
        // Hidden pages are display:none, so a lazy photograph would only start
        // loading as its page is uncovered, mid-turn. Pages near the reader
        // load ahead instead.
        loading={eager ? "eager" : "lazy"}
        className="object-cover"
      />
    </div>
  );
}

/* ---- The pages ------------------------------------------------------------ */

function CoverSheet({ c }: { c: BookCtx }) {
  return (
    <Board className="book-cover-lift">
      <div className="relative flex h-full flex-col items-center justify-between px-[9cqw] py-[13cqw] text-center">
        <p className={clsx("bk-mono text-[#e0ab26]", T.label)}>
          {c.t(ui.book.volume)} · {c.n("2026")}
        </p>
        <div className="flex flex-col items-center">
          <Mark className="mb-[8cqw] h-[13cqw] w-auto" />
          <p className="bk-display flex flex-col items-center gap-[2cqw] text-[clamp(1.6rem,11cqw,3.9rem)] leading-none">
            {c
              .t(c.settings.companyName)
              .split(" ")
              .map((word) => (
                <span key={word} className="book-foil">
                  {word}
                </span>
              ))}
          </p>
          <span aria-hidden="true" className="mt-[6cqw] block h-px w-[20cqw] bg-[#e0ab26]/70" />
          <p className={clsx("bk-cond mt-[6cqw] text-white/75", T.body)}>{c.t(ui.tagline)}</p>
        </div>
        <p className={clsx("bk-mono text-white/45", T.micro)}>
          {c.t(c.settings.companyName)} · {c.t(JEDDAH)}
        </p>
      </div>
    </Board>
  );
}

function BackSheet({ c }: { c: BookCtx }) {
  return (
    <Board>
      <div className="relative flex h-full flex-col items-center justify-center gap-[5cqw] px-[9cqw] text-center">
        <Mark className="h-[9cqw] w-auto" />
        <p className="book-foil bk-display text-[clamp(1rem,5.5cqw,1.9rem)] leading-none">{c.t(c.settings.companyName)}</p>
        <span aria-hidden="true" className="block h-px w-[12cqw] bg-[#e0ab26]/60" />
        <p className={clsx("bk-mono text-white/50", T.micro)} dir="ltr">
          {c.settings.phones[0]}
        </p>
      </div>
    </Board>
  );
}

function ContentsSheet({ page, side, c }: { page: Extract<BookPage, { kind: "contents" }>; side: Side; c: BookCtx }) {
  // Seven or more projects set a little tighter, so the list never runs into the folio.
  const tight = page.entries.length > 6;
  return (
    <Paper>
      <div className="flex h-full flex-col px-[9cqw] pb-[12cqw] pt-[11cqw]">
        <p className={clsx("bk-mono", BRONZE, T.label)}>{c.t(ui.book.volume)}</p>
        <h3 className={clsx("bk-serif mt-[3cqw] leading-none", T.title)}>{c.t(ui.book.contents)}</h3>
        <ol className={clsx("flex flex-col", tight ? "mt-[5cqw]" : "mt-[7cqw]")}>
          {page.entries.map((entry) => {
            const row = (
              <>
                <span className={clsx("bk-mono", BRONZE, T.micro)}>{figure(c, entry.number, 2)}</span>
                <span className="min-w-0 flex-1">
                  <span className="bk-serif block text-[clamp(0.95rem,4cqw,1.35rem)] leading-tight transition-colors group-hover:text-[#7a5a12]">
                    {projectName(entry.project, c.lang)}
                  </span>
                  <span className={clsx("bk-mono mt-[0.9cqw] block text-black/50 @max-sm:hidden", T.micro)}>
                    {c.t(ui.sectorNames[entry.project.sector])} · {c.t(entry.project.city)}
                  </span>
                </span>
                <span className={clsx("bk-mono", T.micro)}>{figure(c, entry.folio)}</span>
              </>
            );
            const cls = clsx("flex w-full items-baseline gap-[2.5cqw] text-start", tight ? "py-[1.75cqw]" : "py-[2.4cqw]");
            return (
              <li key={entry.number} className="border-b border-black/15">
                {c.go ? (
                  // The book is drawn for the eye; the same links are in the reading list beside it.
                  // page-flip only lets a click through when it lands on the button itself, not on its text.
                  <button type="button" tabIndex={-1} onClick={() => c.go?.(entry.folio)} className={clsx("group cursor-pointer [&_*]:pointer-events-none", cls)}>
                    {row}
                  </button>
                ) : (
                  <div className={cls}>{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <Folio value={page.folio} side={side} c={c} />
    </Paper>
  );
}

function ForewordSheet({ page, side, c }: { page: Extract<BookPage, { kind: "foreword" }>; side: Side; c: BookCtx }) {
  const { about } = c.content;
  return (
    <Paper>
      <div className="flex h-full flex-col justify-between px-[9cqw] pb-[14cqw] pt-[11cqw]">
        <p className={clsx("bk-mono", BRONZE, T.label)}>{c.t(ui.book.foreword)}</p>
        <div>
          <p className={clsx("bk-serif text-balance leading-[1.2]", T.lead)}>{plain(c.t(about.title))}</p>
          {about.body[0] && <p className={clsx("mt-[5cqw] leading-[1.65] text-black/65 @max-sm:hidden", T.body)}>{c.t(about.body[0])}</p>}
        </div>
        <div className="border-t border-black/15 pt-[3cqw]">
          <p className={clsx("bk-cond font-medium", T.body)}>{c.t(c.settings.companyName)}</p>
          <p className={clsx("bk-mono mt-[1.2cqw] text-black/50", T.micro)}>{c.t(ui.tagline)}</p>
        </div>
      </div>
      <Folio value={page.folio} side={side} c={c} />
    </Paper>
  );
}

/** Project opener: a dark index strip on the fore-edge, the text beside it. */
function OpenerSheet({ page, side, eager, c }: { page: Extract<BookPage, { kind: "opener" }>; side: Side; eager: boolean; c: BookCtx }) {
  const p = page.project;
  const facts: [string, string][] = [
    [c.t(ui.sector), c.t(ui.sectorNames[p.sector])],
    ...(p.scope[0] ? ([[c.t(ui.scope), c.t(p.scope[0])]] as [string, string][]) : []),
    [c.t(ui.city), c.t(p.city)],
  ];
  const meta: [string, string][] = [
    ...(p.year ? ([[c.t(ui.year), c.n(p.year)]] as [string, string][]) : []),
    [c.t(ui.type), c.t(p.type)],
    [c.t(ui.book.location), c.t(p.city)],
    ...(p.area ? ([[c.t(ui.area), `${c.n(p.area)} m²`]] as [string, string][]) : []),
  ];

  return (
    <Paper>
      <div className="grid h-full grid-cols-[25%_1fr]">
        <aside className="relative flex flex-col justify-between gap-[4cqw] bg-[#0f0e0d] px-[3.2cqw] pb-[12cqw] pt-[8cqw] text-[#f3eee6]">
          <p className={clsx("bk-serif leading-none text-white/90", T.numeral)}>{figure(c, page.number, 2)}</p>
          {page.inset && <Photo src={page.inset} sizes="160px" eager={eager} quality={60} className="aspect-[3/4] w-full @max-sm:hidden" />}
          <div className="flex flex-col gap-[2.2cqw]">
            <p className={clsx("bk-mono text-[#e0ab26]", T.micro)}>{c.t(ui.book.siteIndex)}</p>
            <dl className="flex flex-col gap-[1.8cqw]">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className={clsx("bk-mono text-white/45", T.micro)}>{label}</dt>
                  <dd className={clsx("mt-[0.6cqw] text-white/85", T.small)}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        <div className="relative flex min-h-0 flex-col px-[6cqw] pb-[12cqw] pt-[8cqw]">
          <p className={clsx("bk-mono", BRONZE, T.label)}>
            {c.t(ui.sectorNames[p.sector])} · {c.t(p.city)}
          </p>
          <h3 className={clsx("bk-serif mt-[2.5cqw] leading-[0.95]", T.title)}>{projectName(p, c.lang)}</h3>

          <dl className="mt-[5cqw] grid grid-cols-[auto_1fr] gap-x-[3.5cqw] gap-y-[1.4cqw] border-y border-black/15 py-[3cqw]">
            {meta.map(([label, value]) => (
              <Fragment key={label}>
                <dt className={clsx("bk-mono text-black/45", T.micro)}>{label}</dt>
                <dd className={T.small}>{value}</dd>
              </Fragment>
            ))}
          </dl>

          <p className={clsx("mt-[4cqw] line-clamp-6 leading-[1.6] text-black/75 @sm:line-clamp-8", T.body)}>{c.t(p.summary)}</p>

          {p.scope.length > 0 && (
            <div className="mt-auto pt-[4cqw] @max-sm:hidden">
              <p className={clsx("bk-mono text-black/45", T.micro)}>{c.t(ui.scope)}</p>
              <ul className="mt-[1.6cqw] grid grid-cols-2 gap-x-[3cqw] gap-y-[0.9cqw]">
                {p.scope.slice(0, 4).map((s) => (
                  <li key={s.en} className={clsx("leading-snug", T.small)}>
                    {c.t(s)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* The strip runs down the fore-edge, so the folio prints on the dark. */}
      <Folio value={page.folio} side={side} c={c} onDark />
    </Paper>
  );
}

/** A photograph printed to the trim, the caption by the spine and the folio at the outer corner. */
function PlateSheet({ page, side, eager, c }: { page: Extract<BookPage, { kind: "plate" }>; side: Side; eager: boolean; c: BookCtx }) {
  return (
    <div className="@container relative h-full w-full overflow-hidden bg-[#1a1714]">
      <Photo src={page.src} sizes="(min-width: 900px) 600px, 92vw" eager={eager} quality={85} bleed />
      <span className={clsx("book-caption bk-mono absolute bottom-[4.5cqw] z-20 text-white/85", T.micro, side === "left" ? "right-[5.5cqw]" : "left-[5.5cqw]")}>
        {projectName(page.project, c.lang)}
      </span>
      <span className={clsx("book-caption bk-mono absolute bottom-[4.5cqw] z-20 text-white", T.micro, side === "left" ? "left-[5.5cqw]" : "right-[5.5cqw]")}>
        {figure(c, page.folio)}
      </span>
      <span aria-hidden="true" className="book-gutter" />
    </div>
  );
}

/** The detail page: the remaining photographs, a title bar, and the finishes when the studio lists them. */
function GridSheet({ page, side, eager, c }: { page: Extract<BookPage, { kind: "grid" }>; side: Side; eager: boolean; c: BookCtx }) {
  const [a, b, d] = page.images;
  const notes = (page.project.materials ?? []).filter((m) => c.t(m)).slice(0, 4);
  const sizes = "(min-width: 900px) 300px, 46vw";
  return (
    <Paper>
      <div className="flex h-full flex-col gap-[2.6cqw] px-[6cqw] pb-[12cqw] pt-[6.5cqw]">
        {/* The photographs share whatever the title and notes leave. */}
        <div className={clsx("grid min-h-0 flex-1 gap-[2.2cqw]", d ? "grid-cols-2 grid-rows-2" : b ? "grid-cols-2" : "grid-cols-1")}>
          <Photo src={a} sizes={sizes} eager={eager} className={clsx("h-full", d && "row-span-2")} />
          {b && <Photo src={b} sizes={sizes} eager={eager} className="h-full" />}
          {d && <Photo src={d} sizes={sizes} eager={eager} className="h-full" />}
        </div>

        <div className="mt-[1.5cqw]">
          <p className={clsx("bk-cond font-semibold", T.body)}>
            {projectName(page.project, c.lang)} <span className="text-[#7a5a12]">::</span> {c.t(ui.book.details)}
          </p>
          <span aria-hidden="true" className="mt-[1.4cqw] block h-[0.9cqw] min-h-[2px] w-[42%] bg-[#17130f]" />
        </div>

        {notes.length > 0 && (
          <ul className={clsx("grid grid-cols-2 gap-x-[4cqw] gap-y-[1cqw] leading-snug text-black/70 @max-sm:hidden", T.small)}>
            {notes.map((note) => (
              <li key={note.en}>— {c.t(note)}</li>
            ))}
          </ul>
        )}
      </div>
      <Folio value={page.folio} side={side} c={c} />
    </Paper>
  );
}

function ColophonSheet({ page, side, c }: { page: Extract<BookPage, { kind: "colophon" }>; side: Side; c: BookCtx }) {
  const team = [...c.team].sort((x, y) => x.order - y.order);
  const rows: [string, string][] = [
    [c.t(ui.book.publishedBy), `${c.t(c.settings.companyName)}, ${c.t(JEDDAH)}`],
    ...(team.length ? ([[c.t(ui.team), team.map((m) => c.t(m.name)).join(" · ")]] as [string, string][]) : []),
    [c.t(ui.book.typefaces), c.lang === "ar" ? "Markazi Text, IBM Plex Sans Arabic" : "Instrument Serif, Archivo, IBM Plex Mono"],
    [c.t(ui.book.edition), `${c.t(ui.book.volume)}, ${c.n("2026")}`],
  ];
  return (
    <Paper>
      <div className="flex h-full flex-col justify-between px-[9cqw] pb-[14cqw] pt-[11cqw]">
        <div>
          <p className={clsx("bk-mono", BRONZE, T.label)}>{c.t(ui.book.colophon)}</p>
          <h3 className={clsx("bk-serif mt-[3cqw] leading-none", T.title)}>{c.t(c.settings.companyName)}</h3>
        </div>
        <dl className="flex flex-col gap-[2.6cqw]">
          {rows.map(([label, value]) => (
            <div key={label} className="border-t border-black/15 pt-[1.6cqw]">
              <dt className={clsx("bk-mono text-black/45", T.micro)}>{label}</dt>
              <dd className={clsx("mt-[0.8cqw]", T.small)}>{value}</dd>
            </div>
          ))}
        </dl>
        <div className={clsx("leading-[1.6] text-black/65 @max-sm:hidden", T.small)}>
          <p>{c.t(c.settings.address)}</p>
          <p className="mt-[1cqw]">
            <span dir="ltr">{c.settings.phones.join("  ·  ")}</span>
          </p>
        </div>
      </div>
      <Folio value={page.folio} side={side} c={c} />
    </Paper>
  );
}

function EndpaperSheet({ page, side, c }: { page: Extract<BookPage, { kind: "endpaper" }>; side: Side; c: BookCtx }) {
  return (
    <Paper>
      <div className="flex h-full items-center justify-center">
        <Mark className="h-[34cqw] w-auto opacity-[0.07]" color="#17130f" />
      </div>
      <Folio value={page.folio} side={side} c={c} />
    </Paper>
  );
}

/** One page of the volume, whatever its kind. The printed copy is set from these too. */
export function SheetContent({ page, side, eager, c }: { page: BookPage; side: Side; eager: boolean; c: BookCtx }) {
  const body = (() => {
    switch (page.kind) {
      case "cover":
        return <CoverSheet c={c} />;
      case "back":
        return <BackSheet c={c} />;
      case "contents":
        return <ContentsSheet page={page} side={side} c={c} />;
      case "foreword":
        return <ForewordSheet page={page} side={side} c={c} />;
      case "opener":
        return <OpenerSheet page={page} side={side} eager={eager} c={c} />;
      case "plate":
        return <PlateSheet page={page} side={side} eager={eager} c={c} />;
      case "grid":
        return <GridSheet page={page} side={side} eager={eager} c={c} />;
      case "colophon":
        return <ColophonSheet page={page} side={side} c={c} />;
      case "endpaper":
        return <EndpaperSheet page={page} side={side} c={c} />;
    }
  })();
  // page-flip lays pages out left to right; each page sets its own reading direction.
  return (
    <div dir={c.lang === "ar" ? "rtl" : "ltr"} lang={c.lang} className="h-full w-full">
      {body}
    </div>
  );
}

/** What a page is called in the strip of spreads and in status text. */
export function titleOf(page: BookPage | undefined, c: Pick<BookCtx, "t" | "lang">) {
  if (!page) return undefined;
  switch (page.kind) {
    case "contents":
      return c.t(ui.book.contents);
    case "foreword":
      return c.t(ui.book.foreword);
    case "opener":
    case "plate":
    case "grid":
      return projectName(page.project, c.lang);
    case "colophon":
      return c.t(ui.book.colophon);
    default:
      return undefined;
  }
}

/** The photograph that stands for a page in the strip of spreads. */
export function mediaOf(page: BookPage | undefined) {
  if (!page) return undefined;
  if (page.kind === "plate") return page.src;
  if (page.kind === "grid") return page.images[0];
  if (page.kind === "opener") return page.inset ?? page.project.cover;
  return undefined;
}

export function folioOf(page: BookPage | undefined) {
  return page && "folio" in page ? page.folio : undefined;
}
