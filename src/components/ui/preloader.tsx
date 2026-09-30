"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useUi } from "@/lib/ui-store";
import { Mark } from "@/components/brand/logo";
import { useLocale } from "@/components/providers/locale";
import { ui } from "@/lib/dict";
import { Louvers } from "./louvers";

const KEY = "ab-intro-seen";
const SCALES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

/**
 * First visit of a session: the rawshan is shut, the 1:1 mark assembles
 * while the drawing scale counts down to 1:1, then the boards swing open.
 */
export function Preloader() {
  const { t, n, dir } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(SCALES[0]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    const el = root.current;
    if (seen || prefersReducedMotion() || !el) {
      setActive(false);
      useUi.getState().set({ preloaderDone: true });
      return;
    }
    useUi.getState().set({ preloaderRan: true });
    document.documentElement.style.overflow = "hidden";
    const counter = { i: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        document.documentElement.style.overflow = "";
        setActive(false);
      },
    });
    tl.fromTo(
      el.querySelectorAll("[data-mark-part]"),
      { scaleY: 0, transformOrigin: "50% 100%" },
      { scaleY: 1, duration: 0.9, ease: "power4.out", stagger: 0.12 },
      0.15,
    )
      .fromTo(el.querySelectorAll("[data-fade]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.2)
      .to(counter, { i: SCALES.length - 1, duration: 1.7, ease: "power2.inOut", onUpdate: () => setScale(SCALES[Math.round(counter.i)]) }, 0.2)
      .fromTo(el.querySelector("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0.2)
      .to(el.querySelectorAll("[data-fade], [data-mark]"), { opacity: 0, y: -16, duration: 0.4, stagger: 0.03 }, "+=0.1")
      .add(() => useUi.getState().set({ preloaderDone: true }))
      .to(
        el.querySelectorAll("[data-louver]"),
        { rotationY: 86, duration: 1.2, ease: "power3.inOut", stagger: { each: 0.05, from: dir === "rtl" ? "end" : "start" } },
        "-=0.1",
      )
      .to(el, { opacity: 0, duration: 0.35 }, "-=0.35");
    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, [dir]);

  if (!active) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[85] text-gypsum" aria-hidden="true">
      <Louvers count={14} angle={0} className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col justify-between px-[var(--gutter)] py-7">
        <div className="label flex justify-between text-gypsum/70" data-fade>
          <span>{t(ui.basedIn)}</span>
          <span dir="ltr">21.63°N 39.14°E</span>
        </div>
        <div className="flex flex-col items-center gap-8">
          <div data-mark>
            <Mark className="h-24 w-auto md:h-32" />
          </div>
          <div data-fade className="flex flex-col items-center gap-3">
            <span className="label text-gypsum/60">{t(ui.scaleLabel)}</span>
            <span className="font-mono text-4xl tabular-nums md:text-5xl" dir="ltr">
              {n(1)}:{n(scale)}
            </span>
            <span className="mt-1 block h-px w-44 bg-white/15">
              <span data-bar className="block h-full origin-left bg-ochre" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>
        <div className="label flex justify-between text-gypsum/70" data-fade>
          <span>Archi Builder</span>
          <span>{t(ui.tagline)}</span>
        </div>
      </div>
    </div>
  );
}
