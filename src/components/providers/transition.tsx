"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useUi } from "@/lib/ui-store";
import { useLenis } from "./smooth-scroll";
import { useLocale } from "./locale";
import { navItems, ui } from "@/lib/dict";
import { Mark } from "@/components/brand/logo";
import { Louvers } from "@/components/ui/louvers";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const useTransitionNav = () => useContext(TransitionContext);

/**
 * Page transitions as a rawshan: the timber louvres swing shut over the
 * page, the next sheet slides in behind them, and they swing open again.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const { t, dir } = useLocale();
  const shell = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [title, setTitle] = useState("");

  const titleFor = useCallback(
    (path: string) => {
      const p = path.replace(/^\/(en|ar)/, "") || "/";
      const item = navItems.find((i) => p.startsWith(i.path));
      return t(item ? ui.nav[item.key] : ui.nav.home);
    },
    [t],
  );

  const navigate = useCallback(
    (target: string) => {
      const url = new URL(target, window.location.href);
      if (url.pathname === pathname) {
        if (url.hash) return router.push(target);
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      useUi.getState().set({ menuOpen: false });
      const el = shell.current;
      if (prefersReducedMotion() || !el) {
        router.push(target);
        return;
      }
      setTitle(titleFor(url.pathname));
      pending.current = url.pathname;
      useUi.getState().set({ covering: true });
      lenis?.stop();
      router.prefetch(target);

      const boards = el.querySelectorAll("[data-louver]");
      tl.current?.kill();
      tl.current = gsap
        .timeline({ onComplete: () => router.push(target) })
        .set(el, { visibility: "visible" })
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.15 })
        .fromTo(
          boards,
          { rotationY: 90 },
          { rotationY: 0, duration: 0.75, ease: "power3.inOut", stagger: { each: 0.035, from: dir === "rtl" ? "end" : "start" } },
          0,
        )
        .to("#main", { scale: 0.97, opacity: 0.6, duration: 0.8, ease: "power2.inOut" }, 0)
        .fromTo(
          el.querySelectorAll("[data-meta]"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.06 },
          0.45,
        );
    },
    [pathname, router, lenis, titleFor, dir],
  );

  // New route rendered: reset scroll, then swing the louvres open.
  useEffect(() => {
    const el = shell.current;
    if (!pending.current || !el) return;
    pending.current = null;
    window.scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    gsap.set("#main", { scale: 1, opacity: 1, clearProps: "transform" });
    const boards = el.querySelectorAll("[data-louver]");
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      useUi.getState().set({ covering: false });
      lenis?.start();
      tl.current?.kill();
      tl.current = gsap
        .timeline({ delay: 0.12 })
        .to(el.querySelectorAll("[data-meta]"), { yPercent: -110, duration: 0.45, ease: "power3.in" })
        .to(
          boards,
          { rotationY: -90, duration: 0.9, ease: "power3.inOut", stagger: { each: 0.035, from: dir === "rtl" ? "end" : "start" } },
          "-=0.1",
        )
        .fromTo("#main", { y: 60 }, { y: 0, duration: 1.1, ease: "expo.out", clearProps: "transform" }, "<0.15")
        .to(el, { opacity: 0, duration: 0.2 }, "-=0.25")
        .set(el, { visibility: "hidden" });
    });
  }, [pathname, lenis, dir]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={shell}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[80]"
        style={{ visibility: "hidden" }}
      >
        <Louvers count={12} angle={90} className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-gypsum">
          <div className="overflow-hidden">
            <div data-meta>
              <Mark className="h-12 w-auto" />
            </div>
          </div>
          <div className="overflow-hidden px-6 text-center">
            <div data-meta className="mega mega-md">
              {title}
            </div>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
