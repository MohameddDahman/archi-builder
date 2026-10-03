"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion, maskDrop } from "@/lib/gsap";
import { useIntro } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";

type TextTag = "h1" | "h2" | "h3" | "p" | "div" | "span";

/**
 * Line-by-line masked reveal. `intro` plays on page entrance instead of on scroll.
 * Arabic is split by lines only (never characters), so joined letters stay intact.
 */
export function RevealText({
  as: Tag = "div",
  children,
  className,
  intro = false,
  delay = 0,
  stagger = 0.09,
}: {
  as?: TextTag;
  children: React.ReactNode;
  className?: string;
  intro?: boolean;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { lang } = useLocale();
  const split = useRef<SplitText | null>(null);
  const played = useRef(false);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      split.current = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          if (intro) {
            if (!played.current) gsap.set(self.lines, { yPercent: maskDrop(lang) });
            return;
          }
          gsap.set(self.lines, { yPercent: maskDrop(lang) });
          return gsap.to(self.lines, {
            yPercent: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger,
            delay,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        },
      });
    },
    { scope: ref, dependencies: [lang] },
  );

  useIntro(() => {
    if (!intro || !split.current) return;
    played.current = true;
    gsap.to(split.current.lines, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger, delay });
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

/** Fades and lifts direct children into view on scroll. */
export function Reveal({
  children,
  className,
  y = 32,
  stagger = 0.08,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  as?: "div" | "ul" | "ol" | "section" | "dl";
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current.children,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger,
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        },
      );
    },
    { scope: ref },
  );
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

/** Image that unmasks from its centre on first view and drifts while scrolling. */
export function FrameImage({
  className,
  imgClassName,
  parallax = 10,
  reveal = true,
  children,
  ...img
}: ImageProps & { imgClassName?: string; parallax?: number; reveal?: boolean; children?: React.ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = frame.current;
      if (!el || prefersReducedMotion()) return;
      const pic = el.querySelector("img");
      if (reveal) {
        gsap.fromTo(
          el,
          { clipPath: "inset(10% 10% 10% 10%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      }
      if (pic && parallax) {
        gsap.fromTo(
          pic,
          { yPercent: -parallax / 2, scale: 1 + parallax / 90 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { scope: frame },
  );
  return (
    <div ref={frame} className={clsx("relative overflow-hidden bg-deep-3", className)}>
      <Image {...img} alt={img.alt} className={clsx("object-cover will-change-transform", imgClassName)} />
      {children}
    </div>
  );
}

/** Small uppercase label led by the slanted slab of the 1:1 mark. */
export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("label flex items-center gap-3", className)}>
      <svg viewBox="0 0 8 14" className="h-3.5 w-2 shrink-0 fill-ochre" aria-hidden="true">
        <path d="M0 2.4 8 0v11.6L0 14z" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

/** Counts up to a number the first time it scrolls into view. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const { n } = useLocale();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const obj = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(obj, { v: value, duration: 1.6, ease: "power2.out", onUpdate: () => setShown(Math.round(obj.v)) }),
    });
    return () => st.kill();
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {n(String(shown).padStart(2, "0"))}
    </span>
  );
}
