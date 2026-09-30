"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { gsap } from "@/lib/gsap";
import { useUi } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";
import { useLenis } from "@/components/providers/smooth-scroll";
import { TLink } from "@/components/ui/tlink";
import { Louvers } from "@/components/ui/louvers";
import { useSite } from "@/lib/content/store";
import { navItems, ui } from "@/lib/dict";

/** Full-screen index: the rawshan closes over the page and the sheets list appears on it. */
export function Menu() {
  const open = useUi((s) => s.menuOpen);
  const setUi = useUi((s) => s.set);
  const { t, n, dir } = useLocale();
  const lenis = useLenis();
  const settings = useSite((s) => s.settings);
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const boards = el.querySelectorAll("[data-louver]");
    const items = el.querySelectorAll("[data-item]");
    const extras = el.querySelectorAll("[data-extra]");
    const from = dir === "rtl" ? "end" : "start";
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (open) {
      lenis?.stop();
      const tl = gsap
        .timeline()
        .set(el, { visibility: "visible" })
        .fromTo(boards, { rotationY: 90 }, { rotationY: 0, duration: 0.8, ease: "power3.inOut", stagger: { each: 0.035, from } })
        .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.05 }, "-=0.35")
        .fromTo(extras, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.06 }, "-=0.8");
      el.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUi({ menuOpen: false });
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        tl.kill();
      };
    }
    lenis?.start();
    const tl = gsap
      .timeline()
      .to([...items, ...extras], { opacity: 0, duration: 0.25 })
      .to(boards, { rotationY: -90, duration: 0.7, ease: "power3.inOut", stagger: { each: 0.03, from } }, 0.1)
      .set(el, { visibility: "hidden" })
      .set([...items, ...extras], { opacity: 1 });
    return () => {
      tl.kill();
    };
  }, [open, lenis, setUi, dir]);

  return (
    <div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t(ui.menu)}
      className="fixed inset-0 z-[65] text-gypsum"
      style={{ visibility: "hidden" }}
      data-lenis-prevent
    >
      <Louvers count={10} angle={90} className="absolute inset-0" />
      <div className="relative flex h-full flex-col overflow-y-auto px-[var(--gutter)] pb-8 pt-[calc(var(--header-h)+2.5rem)]">
        <div className="grid flex-1 gap-12 md:grid-cols-[1.5fr_1fr]">
          <nav aria-label={t(ui.menu)}>
            <ol className="flex flex-col">
              {navItems.map((item, i) => (
                <li key={item.key} className="overflow-hidden">
                  <TLink
                    to={item.path}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    className="group flex items-baseline gap-4 py-1"
                  >
                    <span data-item className="font-mono text-xs text-gypsum/50 transition-colors group-hover:text-ochre">
                      {n(String(i + 1).padStart(2, "0"))}
                    </span>
                    <span data-item className="mega text-[clamp(1.8rem,4.2vw,3.2rem)] transition-colors duration-300 group-hover:text-ochre">
                      {t(ui.nav[item.key])}
                    </span>
                  </TLink>
                </li>
              ))}
            </ol>
          </nav>
          <div className="hidden md:block" data-extra>
            <div className="chamfer chamfer-lg relative ms-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-deep-3">
              {navItems.map((item, i) => (
                <Image
                  key={item.key}
                  src={item.image}
                  alt=""
                  fill
                  sizes="30vw"
                  className={clsx(
                    "object-cover transition-all duration-[1.2s] ease-[var(--ease-out-expo)]",
                    hover === i ? "scale-100 opacity-100" : "scale-110 opacity-0",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-6 border-t border-white/15 pt-6 text-sm text-gypsum/80 sm:grid-cols-3" data-extra>
          <p className="max-w-xs">{t(settings.address)}</p>
          <div className="flex flex-col gap-1">
            {settings.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="link-line self-start" dir="ltr">
                {p}
              </a>
            ))}
          </div>
          <div className="flex items-end sm:justify-end">
            <TLink to="/contact" className="label chamfer bg-ochre px-5 py-3.5 text-ink transition-colors hover:bg-ochre-2">
              {t(ui.startProject)}
            </TLink>
          </div>
        </div>
      </div>
    </div>
  );
}
