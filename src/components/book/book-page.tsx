"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, CornersOut, CornersIn, SpeakerHigh, SpeakerSlash, ListBullets } from "@phosphor-icons/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIntro } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";
import { ui } from "@/lib/dict";
import { Slab } from "@/components/ui/primitives";
import type { FlipApi } from "./flipbook";

const Flipbook = dynamic(() => import("./flipbook"), { ssr: false });

/** A soft paper turn, synthesised: filtered noise with a falling band. */
function usePaperSound(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);
  return useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = (ctx.current ??= new Ctor());
      const dur = 0.5;
      const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        const attack = t < 0.06 ? t / 0.06 : 1;
        data[i] = (Math.random() * 2 - 1) * attack * Math.pow(1 - t, 2.2);
      }
      const src = ac.createBufferSource();
      src.buffer = buffer;
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 0.8;
      band.frequency.setValueAtTime(2400, ac.currentTime);
      band.frequency.exponentialRampToValueAtTime(700, ac.currentTime + dur);
      const gain = ac.createGain();
      gain.gain.value = 0.28;
      src.connect(band).connect(gain).connect(ac.destination);
      src.start();
    } catch {
      /* audio is decorative */
    }
  }, [enabled]);
}

export function BookPage() {
  const { t, n, dir } = useLocale();
  const api = useRef<FlipApi>(null);
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const [page, setPage] = useState({ i: 0, total: 0, portrait: false });
  const [sound, setSound] = useState(true);
  const [full, setFull] = useState(false);
  const [menu, setMenu] = useState(false);
  const playSound = usePaperSound(sound);

  useEffect(() => {
    try {
      if (localStorage.getItem("ab-book-sound") === "off") setSound(false);
    } catch {}
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward) api.current?.next();
      if (e.key === back) api.current?.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir]);

  useIntro(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(el.querySelectorAll("[data-fade]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 })
      .fromTo(stage.current, { opacity: 0, y: 60, rotateX: 18 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.6, ease: "expo.out" }, 0.1);
    return () => tl.kill();
  });

  const onPage = useCallback((i: number, total: number, portrait: boolean) => setPage({ i, total, portrait }), []);

  const toggleSound = () =>
    setSound((v) => {
      try {
        localStorage.setItem("ab-book-sound", v ? "off" : "on");
      } catch {}
      return !v;
    });

  const toggleFull = () => {
    const el = root.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  // Human page label: "04–05 / 28" on spreads, "04 / 28" on covers or in portrait
  const label = (() => {
    const { i, total, portrait } = page;
    if (!total) return "";
    const pad = (v: number) => n(String(v).padStart(2, "0"));
    if (portrait || i === 0 || i === total - 1) return `${pad(i + 1)} / ${pad(total)}`;
    const left = i % 2 === 1 ? i : i - 1;
    return `${pad(left + 1)}–${pad(left + 2)} / ${pad(total)}`;
  })();

  const ctrl = "chamfer grid h-11 w-11 place-items-center bg-white/[0.07] transition-colors hover:bg-ochre hover:text-ink disabled:opacity-30";

  // Front cover shows on the right half of the spread, back cover on the left: centre them.
  const atFront = page.i === 0;
  const atBack = page.total > 0 && page.i === page.total - 1;
  const rtlFactor = dir === "rtl" ? -1 : 1;
  const shift = page.portrait || !page.total ? 0 : atFront ? -25 * rtlFactor : atBack ? 25 * rtlFactor : 0;

  return (
    <section ref={root} className={clsx("relative flex min-h-svh flex-col bg-deep", full ? "justify-center" : "pt-[calc(var(--header-h)+2rem)]")}>
      {/* stage light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgb(224_171_38/0.09),transparent_70%)]" aria-hidden="true" />

      {!full && (
        <div className="relative grid gap-6 px-[var(--gutter)] md:grid-cols-12 md:items-end">
          <div data-fade className="md:col-span-7">
            <div className="label mb-5 flex items-center gap-3 text-gypsum/70">
              <Slab />
              04 — Archi Builder
            </div>
            <h1 className="mega mega-lg">{t(ui.bookLabel)}</h1>
          </div>
          <p data-fade className="max-w-md text-sm text-gypsum/60 md:col-span-5 md:justify-self-end md:text-end">
            {t(ui.bookIntro)}
          </p>
        </div>
      )}

      <div className="relative flex flex-1 items-center justify-center px-[var(--gutter)] py-8 [perspective:2000px]">
        <div ref={stage} className={clsx("book-stage w-full", full && "is-full")}>
          {/* A closed book rests centred; it slides over as it opens, like a real one on a table. */}
          <div className="book-slide" style={{ transform: `translateX(${shift}%)` }}>
            <Flipbook ref={api} onPage={onPage} onFlipSound={playSound} />
          </div>
          <div className="mx-auto mt-2 h-8 w-[80%] rounded-[50%] bg-black/60 blur-2xl" aria-hidden="true" />
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-3 px-[var(--gutter)] pb-8">
        <button type="button" onClick={() => api.current?.prev()} aria-label={t(ui.prevPage)} className={ctrl}>
          <ArrowLeft size={18} className="rtl:-scale-x-100" />
        </button>
        <span className="label min-w-[8.5rem] text-center text-gypsum/80" aria-live="polite" dir="ltr">
          {t(ui.page)} {label}
        </span>
        <button type="button" onClick={() => api.current?.next()} aria-label={t(ui.nextPage)} className={ctrl}>
          <ArrowRight size={18} className="rtl:-scale-x-100" />
        </button>
        <span className="mx-2 h-6 w-px bg-white/15" aria-hidden="true" />
        <div className="relative">
          <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label={t(ui.contents)} className={ctrl}>
            <ListBullets size={18} />
          </button>
          {menu && (
            <ol className="chamfer absolute bottom-14 start-1/2 z-10 w-64 -translate-x-1/2 bg-deep-3 p-2 shadow-2xl rtl:translate-x-1/2">
              {(api.current?.chapters ?? []).map((ch) => (
                <li key={ch.label}>
                  <button
                    type="button"
                    onClick={() => {
                      api.current?.go(ch.page);
                      setMenu(false);
                    }}
                    className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-start text-sm hover:bg-white/[0.06] hover:text-ochre"
                  >
                    <span>{ch.label}</span>
                    <span className="font-mono text-xs text-mist">{n(String(ch.page + 1).padStart(2, "0"))}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
        <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={t(ui.sound)} className={ctrl}>
          {sound ? <SpeakerHigh size={18} /> : <SpeakerSlash size={18} />}
        </button>
        <button type="button" onClick={toggleFull} aria-pressed={full} aria-label={t(ui.fullscreen)} className={ctrl}>
          {full ? <CornersIn size={18} /> : <CornersOut size={18} />}
        </button>
      </div>
    </section>
  );
}
