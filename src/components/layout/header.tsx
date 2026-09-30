"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Logo } from "@/components/brand/logo";
import { TLink } from "@/components/ui/tlink";
import { useLocale } from "@/components/providers/locale";
import { useTransitionNav } from "@/components/providers/transition";
import { useUi } from "@/lib/ui-store";
import { navItems, ui } from "@/lib/dict";
import { Menu } from "./menu";

export function Header() {
  const { t, lang } = useLocale();
  const { navigate } = useTransitionNav();
  const pathname = usePathname();
  const menuOpen = useUi((s) => s.menuOpen);
  const setUi = useUi((s) => s.set);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);

  const path = pathname.replace(/^\/(en|ar)/, "") || "/";
  const otherLang = lang === "en" ? "ar" : "en";

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y < 200) setHidden(false);
      else if (y > last.current + 4) setHidden(true);
      else if (y < last.current - 4) setHidden(false);
      last.current = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <>
      <a href="#main" className="label chamfer fixed start-4 top-4 z-[100] -translate-y-24 bg-ochre px-5 py-3 text-ink focus:translate-y-0">
        {t(ui.skip)}
      </a>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-[70] transition-transform duration-700 ease-[var(--ease-out-expo)]",
          hidden && !menuOpen && "-translate-y-full",
        )}
      >
        <div
          className={clsx(
            "flex h-[var(--header-h)] items-center gap-6 px-[var(--gutter)] transition-[background-color,border-color] duration-700",
            scrolled && !menuOpen ? "border-b border-white/[0.08] bg-deep/85 backdrop-blur-xl" : "border-b border-transparent",
          )}
        >
          <TLink to="/" aria-label={t(ui.nav.home)} className="shrink-0">
            <Logo className="h-9 w-auto" tone="light" />
          </TLink>

          <nav aria-label={t(ui.menu)} className="hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-7 xl:gap-9">
              {navItems.map((item) => {
                const active = path.startsWith(item.path);
                return (
                  <li key={item.key}>
                    <TLink
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "group relative flex items-start gap-1 py-2 text-[0.93rem] font-medium transition-colors",
                        active ? "text-gypsum" : "text-gypsum/60 hover:text-gypsum",
                      )}
                    >
                      <span>{t(ui.nav[item.key])}</span>
                      <span
                        className={clsx(
                          "absolute -bottom-0.5 start-0 h-px bg-ochre transition-[width] duration-500 ease-[var(--ease-out-expo)]",
                          active ? "w-full" : "w-0 group-hover:w-full",
                        )}
                        aria-hidden="true"
                      />
                    </TLink>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex-1 lg:hidden" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/${otherLang}${path === "/" ? "" : path}`)}
              className={clsx(
                "chamfer grid h-11 w-11 place-items-center bg-white/[0.07] transition-colors hover:bg-ochre hover:text-ink",
                otherLang === "ar" ? "font-[family-name:var(--font-plex-arabic)] text-base" : "font-mono text-[0.7rem] tracking-[0.1em]",
              )}
              lang={otherLang}
              aria-label={otherLang === "ar" ? "العربية" : "English"}
            >
              {otherLang === "ar" ? "ع" : "EN"}
            </button>
            <TLink
              to="/contact"
              className="label chamfer hidden h-11 items-center bg-ochre px-5 text-ink transition-colors duration-500 hover:bg-ochre-2 xl:inline-flex"
            >
              {t(ui.startProject)}
            </TLink>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setUi({ menuOpen: !menuOpen })}
              className="chamfer group flex h-11 items-center gap-3 bg-white/[0.07] ps-4 pe-4 transition-colors hover:bg-white/15 lg:hidden"
            >
              <span className="label">{menuOpen ? t(ui.close) : t(ui.menu)}</span>
              <span className="relative block h-2.5 w-5" aria-hidden="true">
                <span className={clsx("absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500", menuOpen && "translate-y-[5px] rotate-45")} />
                <span className={clsx("absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500", menuOpen && "-translate-y-[5px] -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <Menu />
    </>
  );
}
