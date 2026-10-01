"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import type { Orientation, PageFlip } from "page-flip";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { TLink } from "@/components/ui/tlink";
import { spreadStartOf, type BookPage } from "@/lib/book";
import { ui } from "@/lib/dict";
import { figure, folioOf, mediaOf, projectName, SheetContent, titleOf, type BookCtx } from "./sheets";

/**
 * Page proportion in page-flip's units: 240 × 307 mm, a portfolio page. The
 * book scales to fit its column, so only the ratio matters.
 */
const PAGE_W = 500;
const PAGE_H = 640;

const noopSubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/** Page-edge stack: one offset hairline per few sheets, alternating paper tones. */
function stackEdges(depth: number, direction: 1 | -1) {
  if (depth <= 0) return "none";
  return Array.from({ length: depth }, (_, i) => `${direction * (i + 1)}px ${i + 1}px 0 ${i % 2 === 0 ? "#e9e1d4" : "#cfc4b2"}`).join(", ");
}

type BlockPoint = { x: number; y: number };

/** While a scripted turn runs, page-flip must not see the real pointer. */
function lockPointer() {
  const swallow = (event: Event) => event.stopPropagation();
  const types = ["mousemove", "mouseup", "touchmove", "touchend"];
  types.forEach((type) => window.addEventListener(type, swallow, true));
  return () => types.forEach((type) => window.removeEventListener(type, swallow, true));
}

/**
 * Turn a page the way a hand does.
 *
 * page-flip's flipNext() drags the corner along a straight line at a constant
 * speed, which is what makes a scripted turn look mechanical. This drives the
 * library's own drag primitives instead: the corner lifts off the page and
 * sweeps across in one continuous arc, all the way to where the page lies
 * flat, and is only let go once it has landed, so there is no hand-off pause.
 *
 * Coordinates are page-relative (x = 0 at the spine, positive toward the
 * corner being lifted) and converted to page-flip's block coordinates the
 * same way its Render.convertToGlobal does.
 */
function turnByHand(flip: PageFlip, direction: "next" | "prev", onDone: () => void): () => void {
  const rect = flip.getBoundsRect();
  const forward = direction === "next";
  const pageWidth = rect.pageWidth;
  const toBlock = (x: number, y: number): BlockPoint => ({
    x: forward ? x + rect.left + rect.width / 2 : rect.width / 2 - x + rect.left,
    y: y + rect.top,
  });

  const fromX = pageWidth - 2;
  const toX = -pageWidth;
  const baseY = rect.height - 1;
  const lift = rect.height * 0.14;
  const at = (t: number) => toBlock(fromX + (toX - fromX) * t, baseY - Math.sin(Math.PI * t) * lift);

  const release = lockPointer();
  const state = { t: 0 };

  // page-flip ignores a drag until it has moved 5px from where the touch
  // began. Starting just off the page edge means the very first frame already
  // counts as a drag, so the turn starts without a dead beat.
  flip.startUserTouch(toBlock(fromX + 8, baseY));
  flip.userMove(at(0), false);

  const tween = gsap.to(state, {
    t: 1,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => flip.userMove(at(state.t), false),
    onComplete: () => {
      flip.userStop(at(1));
      release();
      onDone();
    },
  });
  // Cancels a turn still in the air, e.g. when the reader leaves the page mid-turn.
  return () => {
    tween.kill();
    release();
  };
}

type Props = {
  /** The volume in reading order */
  pages: BookPage[];
  ctx: Omit<BookCtx, "go">;
};

/**
 * The portfolio as an object on a desk.
 *
 * The turn itself is page-flip, which bends a real paper curl with moving
 * shadows. It is a plain DOM library, so it is kept at arm's length from React:
 *
 * - It deletes the element it is given when destroyed, so that element is
 *   created here by hand, inside a div React renders but never fills.
 * - It moves page elements into its own container and clones them mid-turn,
 *   so pages are detached elements React renders into through portals. React
 *   owns what is inside a page; page-flip owns where the page is.
 * - It rewrites every page's inline style each frame but only adds and removes
 *   classes, so everything visual is done with classes, including the gutter
 *   shading keyed off the --left / --right classes it maintains.
 *
 * page-flip only binds books on the left. The Arabic volume is bound on the
 * right, so its sheets are handed over in reverse: the last sheet is the front
 * cover, the book opens at the far end, and reading on turns backwards.
 */
export function BookVolume({ pages, ctx }: Props) {
  const { t } = ctx;
  const rtl = ctx.lang === "ar";
  const isClient = useIsClient();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const handRef = useRef(false);
  const cancelHandRef = useRef<(() => void) | null>(null);

  const count = pages.length;
  const order = useMemo(() => (rtl ? [...pages].reverse() : pages), [pages, rtl]);
  const toReading = useCallback((i: number) => (rtl ? count - 1 - i : i), [rtl, count]);
  const toSheet = toReading; // the mapping is its own inverse

  /** Where page-flip is, as a sheet index (not reading order). */
  const [index, setIndex] = useState(() => (rtl ? count - 1 : 0));
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [ready, setReady] = useState(false);
  const [turning, setTurning] = useState(false);
  const [peek, setPeek] = useState(false);
  const [touched, setTouched] = useState(false);

  // Sheets are recreated only when the run of pages changes, not when the
  // words or pictures on them do: those flow in through the portals.
  const structure = order.map((page) => page.id).join("|");
  const sheets = useMemo(() => {
    if (!isClient) return null;
    return structure.split("|").map((id) => {
      const el = document.createElement("div");
      el.className = "book-sheet";
      if (id === "cover" || id === "back") el.dataset.density = "hard";
      return el;
    });
  }, [isClient, structure]);

  /* ---- Mount page-flip --------------------------------------------------- */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !sheets) return;

    let cancelled = false;
    let flip: PageFlip | null = null;

    const host = document.createElement("div");
    mount.appendChild(host);

    void import("page-flip").then((mod) => {
      if (cancelled) return;
      // The package's entry is a UMD build; depending on interop the class is
      // either a named export or hangs off the default.
      const Ctor = mod.PageFlip ?? (mod as unknown as { default: { PageFlip: typeof mod.PageFlip } }).default.PageFlip;
      const reduced = prefersReducedMotion();

      flip = new Ctor(host, {
        width: PAGE_W,
        height: PAGE_H,
        size: "stretch",
        // Below a 720px-wide column the book shows single pages.
        minWidth: 360,
        maxWidth: 600,
        minHeight: 300,
        maxHeight: 900,
        showCover: true,
        usePortrait: true,
        autoSize: true,
        drawShadow: true,
        maxShadowOpacity: 0.85,
        flippingTime: reduced ? 260 : 900,
        showPageCorners: !reduced,
        mobileScrollSupport: true,
        useMouseEvents: true,
        clickEventForward: true,
        swipeDistance: 30,
        startPage: rtl ? sheets.length - 1 : 0,
        startZIndex: 0,
        disableFlipByClick: false,
      });

      flip.on("init", (e) => {
        setIndex(e.data.page);
        setOrientation(e.data.mode);
        setReady(true);
      });
      flip.on("flip", (e) => setIndex(e.data));
      flip.on("changeOrientation", (e) => setOrientation(e.data));
      flip.on("changeState", (e) => {
        const busy = e.data === "flipping" || e.data === "user_fold";
        setTurning(busy);
        if (busy) setTouched(true);
      });

      flip.loadFromHTML(sheets);
      flipRef.current = flip;
    });

    return () => {
      cancelled = true;
      cancelHandRef.current?.();
      cancelHandRef.current = null;
      handRef.current = false;
      flipRef.current = null;
      setReady(false);
      // destroy() removes `host` itself; if the library never loaded, do it here.
      if (flip) flip.destroy();
      else host.remove();
    };
  }, [sheets, rtl]);

  /* ---- The book rises off the desk as it arrives ------------------------- */
  useGSAP(
    () => {
      const stage = stageRef.current;
      const section = sectionRef.current;
      if (!stage || !section) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          stage,
          { rotateX: 34, yPercent: 10, scale: 0.84, transformPerspective: 1800, transformOrigin: "50% 100%" },
          {
            rotateX: 0,
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 92%", end: "top 20%", scrub: true },
          },
        );
        ScrollTrigger.create({ trigger: section, start: "top 45%", once: true, onEnter: () => setPeek(true) });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  /* ---- Turning ------------------------------------------------------------ */
  const reading = toReading(index);
  const atStart = reading <= 0;
  const atEnd = reading >= count - 1;

  const turn = useCallback(
    (onward: boolean) => {
      const flip = flipRef.current;
      if (!flip) return;
      const here = toReading(flip.getCurrentPageIndex());
      if (onward ? here >= count - 1 : here <= 0) return;
      setTouched(true);
      // In the Arabic volume the sheets run backwards, so reading on turns back.
      const step: "next" | "prev" = onward !== rtl ? "next" : "prev";
      if (prefersReducedMotion()) {
        if (step === "next") flip.turnToNextPage();
        else flip.turnToPrevPage();
        setIndex(flip.getCurrentPageIndex());
      } else if (handRef.current) {
        return;
      } else if (flip.getState() === "read") {
        handRef.current = true;
        cancelHandRef.current = turnByHand(flip, step, () => {
          handRef.current = false;
          cancelHandRef.current = null;
        });
      } else if (step === "next") {
        flip.flipNext("bottom");
      } else {
        flip.flipPrev("bottom");
      }
    },
    [rtl, count, toReading],
  );
  const next = useCallback(() => turn(true), [turn]);
  const prev = useCallback(() => turn(false), [turn]);

  /** Jump to a page, given in reading order. */
  const goTo = useCallback(
    (readingIndex: number) => {
      const flip = flipRef.current;
      if (!flip) return;
      setTouched(true);
      const target = toSheet(Math.max(0, Math.min(count - 1, readingIndex)));
      if (prefersReducedMotion()) {
        flip.turnToPage(target);
        setIndex(flip.getCurrentPageIndex());
      } else {
        flip.flip(target, "bottom");
      }
    },
    [count, toSheet],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      // Arabic reads right to left, so the next page lies to the left.
      const onward = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === onward) {
        e.preventDefault();
        next();
      } else if (e.key === back) {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, rtl]);

  /* ---- Where we are ------------------------------------------------------- */
  const landscape = orientation === "landscape";
  const spreadStart = spreadStartOf(reading, count);
  const firstPage = pages[spreadStart];
  const secondPage = landscape && !atStart && !atEnd ? pages[spreadStart + 1] : undefined;
  const shownPage = landscape ? firstPage : pages[reading];

  const status = atStart ? (
    t(ui.book.cover)
  ) : atEnd ? (
    t(ui.book.backCover)
  ) : secondPage ? (
    `${t(ui.book.pagesRange)} ${figure(ctx, folioOf(firstPage) ?? 0)} — ${figure(ctx, folioOf(secondPage) ?? 0)}`
  ) : (
    <>
      <span className="sr-only">{t(ui.book.page)} </span>
      {figure(ctx, folioOf(shownPage) ?? 0)}
      <span aria-hidden="true"> / </span>
      <span className="sr-only"> {t(ui.book.of)} </span>
      {figure(ctx, count - 1)}
    </>
  );

  // A closed book sits centred on the desk. The shift is released the moment a
  // turn starts, so the volume slides open while the cover is swinging. The
  // English cover lies on the right half of the spread, the Arabic on the left.
  const shiftFront = landscape && atStart && !turning;
  const shiftBack = landscape && atEnd && !turning;
  const shift = shiftFront ? (rtl ? "translate-x-1/4" : "-translate-x-1/4") : shiftBack ? (rtl ? "-translate-x-1/4" : "translate-x-1/4") : "translate-x-0";
  // The shadow and page block follow the pages actually on the desk, which
  // only change once a turn lands; widening them as the turn starts would show
  // a blank page under the swinging cover.
  const coverOnly = landscape && atStart;
  const backOnly = landscape && atEnd;
  const onRight = (coverOnly && !rtl) || (backOnly && rtl);
  const onLeft = (coverOnly && rtl) || (backOnly && !rtl);
  // Turned sheets pile up on the left of the spread, whichever way the book reads.
  const leftDepth = Math.round((6 * Math.max(0, index)) / Math.max(1, count - 1));
  const progress = count > 1 ? reading / (count - 1) : 0;

  /** One entry per spread, for the strip. Interior spreads pair [odd, even]. */
  const spreads = useMemo(() => {
    const out: { start: number; label: string; title: string; media?: string; board?: boolean }[] = [
      { start: 0, label: t(ui.book.cover), title: t(ui.book.cover), board: true },
    ];
    for (let i = 1; i < count - 1; i += 2) {
      const a = pages[i];
      const b = pages[i + 1];
      out.push({
        start: i,
        label: figure(ctx, folioOf(a) ?? i + 1),
        title: titleOf(a, ctx) ?? titleOf(b, ctx) ?? "",
        media: mediaOf(b) ?? mediaOf(a),
      });
    }
    out.push({ start: count - 1, label: t(ui.book.back), title: t(ui.book.backCover), board: true });
    return out;
  }, [pages, count, t, ctx]);

  // Keep the active spread centred in the strip, in either reading direction.
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!strip || !active) return;
    const a = active.getBoundingClientRect();
    const s = strip.getBoundingClientRect();
    strip.scrollBy({ left: a.left + a.width / 2 - (s.left + s.width / 2), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [spreadStart]);

  const sheetCtx = useMemo<BookCtx>(() => ({ ...ctx, go: (folio: number) => goTo(folio - 1) }), [ctx, goTo]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="volume-heading"
      className="relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_28%,#f2ece2_0%,#e3dacb_52%,#d2c7b5_100%)] pb-16 pt-14 text-[#17130f] md:pb-20 md:pt-16"
    >
      <h2 id="volume-heading" className="sr-only">
        {t(ui.book.volume)} — {t(ctx.settings.companyName)}
      </h2>

      {/*
        The book is drawn for the eye and marked aria-hidden. Its contents are
        carried here instead, in reading order, with the links a page cannot hold.
      */}
      <div className="sr-only">
        <p>{t(ui.book.srHelp)}</p>
        <ol>
          {pages.map((page) =>
            page.kind === "opener" ? (
              <li key={page.id}>
                <h3>
                  {figure(ctx, page.number, 2)}. {projectName(page.project, ctx.lang)}
                </h3>
                <p>
                  {t(ui.sectorNames[page.project.sector])} · {t(page.project.city)}
                </p>
                <p>{t(page.project.summary)}</p>
                <TLink to={`/projects/${page.project.slug}`}>
                  {t(ui.book.openProject)}: {projectName(page.project, ctx.lang)}
                </TLink>
              </li>
            ) : null,
          )}
        </ol>
      </div>

      <div className="px-[var(--gutter)]">
        <div className="book-column relative">
          <div ref={stageRef} className="relative will-change-transform">
            <div className={clsx("relative transition-transform duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)]", shift)}>
              {/* The desk: contact shadow, ambient shadow, and the edges of the page block */}
              <div
                aria-hidden="true"
                className={clsx(
                  "pointer-events-none absolute inset-y-0 transition-[left,right,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  onRight ? "left-1/2 right-0" : onLeft ? "left-0 right-1/2" : "left-0 right-0",
                  ready ? "opacity-100" : "opacity-0",
                )}
              >
                <span className="absolute inset-x-[6%] -bottom-[4%] h-[10%] rounded-[50%] bg-[#17130f]/45 blur-2xl" />
                <span className="absolute inset-0 shadow-[0_50px_90px_-40px_rgba(22,17,13,0.65)]" />
                {landscape && !coverOnly && !backOnly ? (
                  <>
                    <span className="absolute inset-y-0 left-0 w-1/2 bg-[#efe8dd]" style={{ boxShadow: stackEdges(leftDepth, -1) }} />
                    <span className="absolute inset-y-0 right-0 w-1/2 bg-[#efe8dd]" style={{ boxShadow: stackEdges(6 - leftDepth, 1) }} />
                  </>
                ) : (
                  <span className="absolute inset-0 bg-[#efe8dd]" style={{ boxShadow: stackEdges(5, onLeft ? -1 : 1) }} />
                )}
              </div>

              <div
                ref={mountRef}
                aria-hidden="true"
                dir="ltr"
                data-binding={rtl ? "right" : "left"}
                data-peek={peek && ready && atStart && !touched ? "true" : undefined}
                className={clsx("ab-book relative", !ready && "aspect-[25/32] min-[56.25rem]:aspect-[25/16]")}
              />
            </div>
          </div>

          {!ready && (
            <p aria-hidden="true" className="label absolute inset-0 flex items-center justify-center text-[#17130f]/45">
              {t(ui.book.loading)}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="book-column mt-8">
          <div aria-hidden="true" className="relative h-px bg-[#17130f]/15">
            <span
              className="absolute inset-0 origin-left bg-[#7a5a12] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] rtl:origin-right"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={prev}
              disabled={!ready || atStart}
              className="group inline-flex min-h-12 cursor-pointer items-center gap-3 px-1 transition-colors duration-300 hover:text-[#7a5a12] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span aria-hidden="true" className="block h-px w-6 bg-current transition-all duration-500 group-hover:w-10 sm:w-8" />
              <span className="label">
                <span className="sm:hidden">{t(ui.book.prevShort)}</span>
                <span className="hidden sm:inline">{t(ui.book.prev)}</span>
              </span>
            </button>

            <p className="label truncate text-center text-[#17130f]/60" aria-live="polite">
              {status}
            </p>

            <button
              type="button"
              onClick={next}
              disabled={!ready || atEnd}
              className="group inline-flex min-h-12 cursor-pointer items-center gap-3 bg-[#0f0e0d] px-4 py-3 text-[#f3eee6] transition-colors duration-300 hover:bg-[#2a2420] disabled:cursor-not-allowed disabled:opacity-30 sm:gap-4 sm:px-7"
            >
              <span className="label">
                <span className="sm:hidden">{atStart ? t(ui.book.openShort) : atEnd ? t(ui.book.endShort) : t(ui.book.nextShort)}</span>
                <span className="hidden sm:inline">{atStart ? t(ui.book.open) : atEnd ? t(ui.book.end) : t(ui.book.next)}</span>
              </span>
              <span aria-hidden="true" className="block h-px w-6 bg-[#e0ab26] transition-all duration-500 group-hover:w-10 sm:w-8" />
            </button>
          </div>

          <p className="label mt-4 text-center text-[#17130f]/40">
            <span className="md:hidden">{t(ui.book.hintTouch)}</span>
            <span className="hidden md:inline">{t(ui.book.hint)}</span>
          </p>

          {/* Every spread: jump anywhere */}
          <ol ref={stripRef} aria-label={t(ui.book.spreads)} className="no-scrollbar mt-6 flex snap-x gap-2 overflow-x-auto pb-3">
            {spreads.map((s) => {
              const active = s.start === spreadStart;
              const name = s.board ? s.title : `${t(ui.book.pagesRange)} ${s.label} — ${s.title}`;
              return (
                <li key={s.start} className="shrink-0 snap-start">
                  <button
                    type="button"
                    onClick={() => goTo(s.start)}
                    disabled={!ready}
                    aria-current={active ? "true" : undefined}
                    aria-label={`${t(ui.book.goTo)} ${name}`}
                    className={clsx(
                      "relative flex h-12 w-20 cursor-pointer items-end overflow-hidden border transition-all duration-500 disabled:cursor-not-allowed sm:h-14 sm:w-24",
                      active ? "border-[#7a5a12] opacity-100 shadow-[0_8px_20px_-10px_rgba(22,17,13,0.6)]" : "border-[#17130f]/15 opacity-60 hover:opacity-100",
                    )}
                  >
                    {s.board ? (
                      <span aria-hidden="true" className="absolute inset-0 bg-[#0f0e0d]" />
                    ) : s.media ? (
                      <Image src={s.media} alt="" fill sizes="96px" quality={60} className="object-cover" />
                    ) : (
                      <span aria-hidden="true" className="book-paper absolute inset-0" />
                    )}
                    <span aria-hidden="true" className="relative z-10 w-full bg-gradient-to-t from-[#0f0e0d]/75 to-transparent px-1.5 pb-1 pt-4 text-start font-mono text-[0.55rem] uppercase tracking-[0.1em] text-[#f3eee6]">
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {sheets &&
        order.map((page, i) =>
          sheets[i]
            ? createPortal(
                <SheetContent page={page} side={i % 2 === 1 ? "left" : "right"} eager={Math.abs(i - index) <= 3} c={sheetCtx} />,
                sheets[i],
                page.id,
              )
            : null,
        )}
    </section>
  );
}
