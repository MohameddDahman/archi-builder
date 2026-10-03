"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { useIntro } from "@/lib/ui-store";
import { TLink } from "./tlink";

/* ------------------------------------------------------------------
   Section marker: a structural-grid bubble, like the axes on a plan.
------------------------------------------------------------------ */
/** Arabic outlines count in abjad order: أ ب ج د هـ و ز ح. */
const ABJAD: Record<string, string> = { A: "أ", B: "ب", C: "ج", D: "د", E: "هـ", F: "و", G: "ز", H: "ح" };

export function Axis({ letter, children, className }: { letter?: string; children: React.ReactNode; className?: string }) {
  const { lang } = useLocale();
  return (
    <div className={clsx("label flex items-center gap-3", className)}>
      {letter ? (
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current font-mono text-[0.68rem] tracking-normal rtl:text-[0.8rem]"
          aria-hidden="true"
        >
          {lang === "ar" ? (ABJAD[letter] ?? letter) : letter}
        </span>
      ) : (
        <Slab />
      )}
      <span>{children}</span>
    </div>
  );
}

/**
 * Arrows after link text, drawn rather than typed: none of the site's fonts
 * has → or ↗, so the browser borrowed them from Arial or Segoe UI Symbol.
 * They point the way the text reads.
 */
export function TextArrow({ to = "forward", className }: { to?: "forward" | "back" | "out"; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      strokeWidth={1.3}
      className={clsx(
        "inline-block h-[1em] w-[1em] shrink-0 fill-none stroke-current align-[-0.15em]",
        to === "back" ? "ltr:-scale-x-100" : "rtl:-scale-x-100",
        className,
      )}
    >
      {to === "out" ? <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" /> : <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />}
    </svg>
  );
}

/** The slanted slab from the 1:1 mark, used as a bullet. */
export function Slab({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 14" className={clsx("h-3.5 w-2 shrink-0 fill-ochre", className)} aria-hidden="true">
      <path d="M0 2.4 8 0v11.6L0 14z" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Buttons: chamfered, with a line-arrow that extends, and a gentle
   magnetic pull on fine pointers.
------------------------------------------------------------------ */
type Tone = "ochre" | "light" | "dark" | "ghost";
const tones: Record<Tone, string> = {
  ochre: "gold-fill text-ink",
  light: "bg-gypsum text-ink hover:bg-white",
  dark: "bg-deep-3 text-gypsum hover:bg-ochre hover:text-ink",
  ghost: "bg-transparent text-current ring-1 ring-inset ring-current/30 hover:ring-current",
};

function useMagnet<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
  return ref;
}

function Arrow() {
  return (
    <span className="relative flex h-3 w-6 items-center overflow-hidden transition-[width] duration-500 ease-[var(--ease-out-expo)] group-hover:w-9 rtl:-scale-x-100" aria-hidden="true">
      <span className="h-px flex-1 bg-current" />
      <svg viewBox="0 0 8 12" className="-ms-px h-3 w-2 fill-none stroke-current" strokeWidth={1.2}>
        <path d="M1 1l6 5-6 5" />
      </svg>
    </span>
  );
}

const btnClass = (tone: Tone, className?: string) =>
  clsx(
    "chamfer group inline-flex h-12 items-center gap-4 px-5 transition-colors duration-500 will-change-transform",
    tones[tone],
    className,
  );

export function Btn({
  to,
  tone = "ochre",
  className,
  children,
  ...rest
}: { to: string; tone?: Tone; className?: string; children: React.ReactNode } & Omit<React.ComponentProps<typeof TLink>, "to" | "className" | "children">) {
  const ref = useMagnet<HTMLAnchorElement>();
  return (
    <TLink ref={ref} to={to} className={btnClass(tone, className)} {...rest}>
      <span className="label">{children}</span>
      <Arrow />
    </TLink>
  );
}

export function BtnA({
  tone = "ghost",
  className,
  children,
  external,
  ...rest
}: { tone?: Tone; external?: boolean; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const ref = useMagnet<HTMLAnchorElement>();
  return (
    <a ref={ref} className={btnClass(tone, className)} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...rest}>
      <span className="label">{children}</span>
      <Arrow />
    </a>
  );
}

export function BtnButton({
  tone = "ochre",
  className,
  children,
  ...rest
}: { tone?: Tone; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useMagnet<HTMLButtonElement>();
  return (
    <button ref={ref} className={btnClass(tone, className)} {...rest}>
      <span className="label">{children}</span>
      <Arrow />
    </button>
  );
}

/* ------------------------------------------------------------------
   Scramble: technical labels decode themselves when they appear.
------------------------------------------------------------------ */
const GLYPHS = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ:./-";

export function Scramble({ text, className, intro = false }: { text: string; className?: string; intro?: boolean }) {
  const { lang } = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const run = useRef<() => void>(() => {});

  useEffect(() => {
    setOut(text);
    if (lang === "ar" || prefersReducedMotion()) {
      run.current = () => {};
      return;
    }
    let raf = 0;
    run.current = () => {
      const start = performance.now();
      const dur = 700 + text.length * 22;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const settled = Math.floor(t * text.length);
        setOut(
          text
            .split("")
            .map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (intro) return () => cancelAnimationFrame(raf);
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => run.current() });
    return () => {
      st.kill();
      cancelAnimationFrame(raf);
    };
  }, [text, lang, intro]);

  useIntro(() => {
    if (intro) run.current();
  });

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
