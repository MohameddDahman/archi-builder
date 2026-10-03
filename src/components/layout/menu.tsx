"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { gsap, prefersReducedMotion, maskDrop } from "@/lib/gsap";
import { useUi } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";
import { useLenis } from "@/components/providers/smooth-scroll";
import { TLink } from "@/components/ui/tlink";
import { useSite } from "@/lib/content/store";
import { navItems, ui } from "@/lib/dict";

/**
 * Full-screen index. A black slab drops from the menu button's corner, its
 * leading edge cut on the slant of the 1:1 mark and lit by a gold line; once
 * it lands flat, the sheets list rises into it line by line.
 */
export function Menu() {
  const open = useUi((s) => s.menuOpen);
  const setUi = useUi((s) => s.set);
  const { t, n, dir, lang } = useLocale();
  const lenis = useLenis();
  const settings = useSite((s) => s.settings);
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(0);
  const mounted = useRef(false);
  // Percent of the screen covered at the left and right edges of the slab.
  const edge = useRef({ l: 0, r: 0 });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const panel = el.querySelector<HTMLElement>("[data-panel]")!;
    const line = el.querySelector<SVGLineElement>("[data-edge] line")!;
    const items = el.querySelectorAll("[data-item]");
    const rules = el.querySelectorAll("[data-rule]");
    const extras = el.querySelectorAll("[data-extra]");
    const plate = el.querySelector("[data-plate]");
    const state = edge.current;
    const draw = () => {
      panel.style.clipPath = `polygon(0 0, 100% 0, 100% ${state.r}%, 0 ${state.l}%)`;
      line.setAttribute("y1", `${state.l}%`);
      line.setAttribute("y2", `${state.r}%`);
    };
    // The button sits in the top corner on the reading side's end: the slab leads from there.
    const lead = dir === "rtl" ? "l" : "r";
    const trail = dir === "rtl" ? "r" : "l";
    const reduced = prefersReducedMotion();

    if (open) {
      lenis?.stop();
      // Visible at once, so focus can move into the menu straight away.
      gsap.set(el, { visibility: "visible" });
      const tl = gsap.timeline();
      if (reduced) {
        tl.call(() => {
          state.l = state.r = 100;
          draw();
        }).set(line, { opacity: 0 });
      } else {
        tl.set(line, { opacity: 1 })
          .to(state, { [lead]: 100, duration: 0.9, ease: "power3.inOut", onUpdate: draw }, 0)
          .to(state, { [trail]: 100, duration: 0.9, ease: "power3.inOut", onUpdate: draw }, 0.16)
          .to(line, { opacity: 0, duration: 0.3 }, 0.85)
          .fromTo(items, { yPercent: maskDrop(lang, 115) }, { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.055 }, 0.5)
          .fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out", stagger: 0.055 }, 0.58)
          .fromTo(extras, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.75);
        if (plate) tl.fromTo(plate, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut" }, 0.55);
      }
      el.querySelector<HTMLElement>("nav a")?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUi({ menuOpen: false });
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        tl.kill();
      };
    }

    lenis?.start();
    // Hand focus back to the button that opened the menu.
    if (el.contains(document.activeElement)) document.querySelector<HTMLElement>('[aria-controls="site-menu"]')?.focus({ preventScroll: true });
    const tl = gsap.timeline();
    if (reduced) {
      tl.call(() => {
        state.l = state.r = 0;
        draw();
      });
    } else {
      // Lifts back the way it came: the far edge first, the button's corner last.
      tl.to([...items, ...rules, ...extras], { opacity: 0, duration: 0.22 })
        .set(line, { opacity: 1 }, 0.12)
        .to(state, { [trail]: 0, duration: 0.75, ease: "power3.inOut", onUpdate: draw }, 0.12)
        .to(state, { [lead]: 0, duration: 0.75, ease: "power3.inOut", onUpdate: draw }, 0.24);
    }
    tl.set(el, { visibility: "hidden" }).set([...items, ...rules, ...extras], { opacity: 1 }).set(line, { opacity: 0 });
    return () => {
      tl.kill();
    };
  }, [open, lenis, setUi, dir, lang]);

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
      <div data-panel className="absolute inset-0 bg-deep" style={{ clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)" }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_85%_0%,rgb(224_171_38/0.1),transparent_70%)] rtl:bg-[radial-gradient(70%_50%_at_15%_0%,rgb(224_171_38/0.1),transparent_70%)]" />

        <div className="relative flex h-full flex-col overflow-y-auto px-[var(--gutter)] pb-8 pt-[calc(var(--header-h)+2rem)]">
          <div className="grid flex-1 gap-12 md:grid-cols-[1.5fr_1fr]">
            <nav aria-label={t(ui.menu)}>
              <ol className="flex flex-col">
                {navItems.map((item, i) => (
                  <li key={item.key} className="relative">
                    <TLink
                      to={item.path}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      className="group flex items-baseline gap-4 overflow-hidden py-3"
                    >
                      <span data-item className="label w-6 shrink-0 text-gypsum/45 transition-colors group-hover:text-ochre">
                        {n(String(i + 1).padStart(2, "0"))}
                      </span>
                      <span data-item className="block">
                        <span className="mega block text-[clamp(1.7rem,6.4vw,3rem)] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-ochre rtl:group-hover:-translate-x-2">
                          {t(ui.nav[item.key])}
                        </span>
                      </span>
                    </TLink>
                    <span data-rule className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/12 rtl:origin-right" aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </nav>
            <div className="hidden md:block">
              <div data-plate className="chamfer chamfer-lg relative ms-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-deep-3">
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

      {/* the lit leading edge of the slab */}
      <svg data-edge className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="menu-edge" gradientUnits="userSpaceOnUse" x1="0%" x2="100%" y1="0" y2="0">
            <stop offset="0" stopColor="#b3801a" />
            <stop offset="0.45" stopColor="#f7df94" />
            <stop offset="1" stopColor="#e0ab26" />
          </linearGradient>
        </defs>
        <line x1="0%" y1="0%" x2="100%" y2="0%" stroke="url(#menu-edge)" strokeWidth="1.5" opacity="0" />
      </svg>
    </div>
  );
}
