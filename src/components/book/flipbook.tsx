"use client";

import HTMLFlipBook from "react-pageflip";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/providers/locale";
import { useSite, publishedProjects } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import {
  BackCover,
  bookCtx,
  ContactPage,
  ContentsPage,
  Endpaper,
  FrontCover,
  Page,
  ProcessPage,
  ProjectImagePage,
  ProjectInfoPage,
  SectorsPage,
  ServicesPage,
  StudioPage,
  TeamPage,
  TitlePage,
  ValuesPage,
  VisionPage,
} from "./pages";

export type FlipApi = {
  next: () => void;
  prev: () => void;
  go: (readingIndex: number) => void;
  total: number;
  chapters: { label: string; page: number }[];
};

type Props = {
  onPage: (readingIndex: number, total: number, portrait: boolean) => void;
  onFlipSound: () => void;
};

/**
 * The printed portfolio as a real flip-book. Pages are generated from
 * the CMS, so new projects appear as new spreads. Arabic reads from the
 * right: the page order is mirrored and the book opens at the far end.
 */
const Flipbook = forwardRef<FlipApi, Props>(function Flipbook({ onPage, onFlipSound }, ref) {
  const { lang, t } = useLocale();
  const c = useMemo(() => bookCtx(lang), [lang]);
  const content = useSite((s) => s.content);
  const settings = useSite((s) => s.settings);
  const team = useSite((s) => s.team);
  const projects = publishedProjects(useSite((s) => s.projects)).filter((p) => p.inBook);
  const book = useRef<{ pageFlip: () => PageFlipLike } | null>(null);
  const rtl = lang === "ar";

  const P = projects.length;
  const total = 14 + 2 * P;
  const chapters = [
    { label: t(ui.nav.studio), page: 4 },
    { label: `${t(ui.vision)} · ${t(ui.mission)}`, page: 5 },
    { label: t(ui.values), page: 6 },
    { label: t(ui.servicesLabel), page: 7 },
    { label: t(ui.sectors), page: 8 },
    { label: t(ui.processLabel), page: 9 },
    { label: t(ui.nav.projects), page: 10 },
    { label: t(ui.team), page: 11 + 2 * P },
    { label: t(ui.nav.contact), page: 12 + 2 * P },
  ];

  const toArray = useCallback((reading: number) => (rtl ? total - 1 - reading : reading), [rtl, total]);
  const flipTo = useCallback((reading: number) => book.current?.pageFlip()?.flip(toArray(reading)), [toArray]);

  useImperativeHandle(
    ref,
    () => ({
      next: () => (rtl ? book.current?.pageFlip()?.flipPrev() : book.current?.pageFlip()?.flipNext()),
      prev: () => (rtl ? book.current?.pageFlip()?.flipNext() : book.current?.pageFlip()?.flipPrev()),
      go: flipTo,
      total,
      chapters,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rtl, flipTo, total, lang],
  );

  // Printed page numbers count from 1 (the cover), matching the counter below the book.
  const folio = (i: number) => c.n(String(i + 1).padStart(2, "0"));

  const reading: React.ReactElement[] = [
    <FrontCover key="cover" c={c} />,
    <Endpaper key="end-front" mark />,
    <TitlePage key="title" c={c} folio={folio(2)} />,
    <ContentsPage key="contents" c={c} folio={folio(3)} entries={chapters.map((ch) => ({ ...ch, go: () => flipTo(ch.page) }))} />,
    <StudioPage key="studio" c={c} folio={folio(4)} content={content} />,
    <VisionPage key="vision" c={c} folio={folio(5)} content={content} />,
    <ValuesPage key="values" c={c} folio={folio(6)} content={content} />,
    <ServicesPage key="services" c={c} folio={folio(7)} content={content} />,
    <SectorsPage key="sectors" c={c} folio={folio(8)} content={content} />,
    <ProcessPage key="process" c={c} folio={folio(9)} content={content} />,
    <ProjectsDivider key="divider" c={c} folio={folio(10)} items={projects.map((p, i) => ({ name: lang === "ar" ? p.nameAr : p.name, page: 11 + i * 2, go: () => flipTo(11 + i * 2) }))} />,
    ...projects.flatMap((p, i) => [
      <ProjectImagePage key={`${p.id}-img`} c={c} folio={folio(11 + i * 2)} p={p} />,
      <ProjectInfoPage key={`${p.id}-info`} c={c} folio={folio(12 + i * 2)} p={p} index={i} />,
    ]),
    <TeamPage key="team" c={c} folio={folio(11 + 2 * P)} team={[...team].sort((a, b) => a.order - b.order)} content={content} />,
    <ContactPage key="contact" c={c} folio={folio(12 + 2 * P)} settings={settings} />,
    <BackCover key="back" c={c} settings={settings} />,
  ];
  const pages = rtl ? [...reading].reverse() : reading;

  useEffect(() => {
    onPage(0, total, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, lang]);

  return (
    <HTMLFlipBook
      key={`${lang}-${total}`}
      ref={book as never}
      className="book"
      style={{}}
      startPage={rtl ? total - 1 : 0}
      size="stretch"
      width={500}
      height={707}
      minWidth={240}
      maxWidth={760}
      minHeight={340}
      maxHeight={1075}
      drawShadow
      flippingTime={950}
      usePortrait
      startZIndex={0}
      autoSize
      maxShadowOpacity={0.55}
      showCover
      mobileScrollSupport
      clickEventForward
      useMouseEvents
      swipeDistance={30}
      showPageCorners
      disableFlipByClick={false}
      onFlip={(e: { data: number }) => {
        const idx = rtl ? total - 1 - e.data : e.data;
        const portrait = book.current?.pageFlip()?.getOrientation?.() === "portrait";
        onPage(idx, total, portrait);
        onFlipSound();
      }}
      onChangeOrientation={(e: { data: string }) => {
        const cur = book.current?.pageFlip()?.getCurrentPageIndex?.() ?? 0;
        onPage(rtl ? total - 1 - cur : cur, total, e.data === "portrait");
      }}
    >
      {pages}
    </HTMLFlipBook>
  );
});

type PageFlipLike = {
  flipNext: () => void;
  flipPrev: () => void;
  flip: (i: number) => void;
  getCurrentPageIndex: () => number;
  getOrientation: () => string;
};

const ProjectsDivider = forwardRef<HTMLDivElement, { c: ReturnType<typeof bookCtx>; folio: string; items: { name: string; page: number; go: () => void }[] }>(
  function ProjectsDivider({ c, folio, items }, ref) {
    return (
      <Page ref={ref} folio={folio} dark className="bg-[#0d0d0d]">
        <div className="flex h-full flex-col p-[10%]">
          <p className="font-mono text-[clamp(7px,1.8cqw,11px)] uppercase tracking-[0.22em] text-[#e0ab26]">{c.t(ui.nav.projects)}</p>
          <p className="gold-text mt-[3cqw] font-[family-name:var(--display-face)] text-[clamp(18px,7cqw,44px)] font-semibold uppercase leading-none [font-variation-settings:'wdth'_118]">
            {c.t(ui.workLabel)}
          </p>
          <ol className="mt-auto flex flex-col">
            {items.map((it, i) => (
              <li key={it.name} className="border-t border-white/10">
                <button
                  type="button"
                  onClick={it.go}
                  className="flex w-full items-baseline gap-[3cqw] py-[2cqw] text-start text-[clamp(8px,2.5cqw,15px)] transition-colors hover:text-[#e0ab26]"
                >
                  <span className="font-mono text-[0.8em] text-white/40">{c.n(String(i + 1).padStart(2, "0"))}</span>
                  <span className="flex-1 uppercase tracking-wide">{it.name}</span>
                  <span className="font-mono text-[0.8em] text-white/40">{c.n(String(it.page + 1).padStart(2, "0"))}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Page>
    );
  },
);

export default Flipbook;
