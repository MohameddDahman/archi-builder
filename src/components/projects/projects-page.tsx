"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import { GridFour, Rows } from "@phosphor-icons/react";
import { Flip } from "gsap/Flip";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { useSite, publishedProjects } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { PageHero } from "@/components/ui/page-hero";
import { TLink } from "@/components/ui/tlink";
import type { Project, Sector } from "@/lib/content/types";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

type Filter = "all" | Sector;

export function ProjectsPage() {
  const { t, n } = useLocale();
  const all = publishedProjects(useSite((s) => s.projects));
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem("ab-projects-view");
      if (v === "grid" || v === "list") setView(v);
    } catch {}
  }, []);

  const sectors: Filter[] = [
    "all",
    ...(["hospitality", "commercial", "residential"] as Sector[]).filter((s) => all.some((p) => p.sector === s)),
  ];
  const shown = filter === "all" ? all : all.filter((p) => p.sector === filter);

  const choose = (f: Filter) => {
    if (grid.current && !prefersReducedMotion()) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-flip]"));
    setFilter(f);
  };

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.8,
      ease: "power3.inOut",
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.25 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.35 }),
    });
    flipState.current = null;
  }, [filter]);

  const setViewSaved = (v: "grid" | "list") => {
    setView(v);
    try {
      localStorage.setItem("ab-projects-view", v);
    } catch {}
  };

  return (
    <>
      <PageHero index="01" name={t(ui.nav.projects)} title={t(ui.projectsTitle)} lead={t(ui.projectsBody)}>
        <p className="mega mega-md" dir="ltr" style={{ textAlign: "start" }}>
          {n(String(all.length).padStart(2, "0"))}
        </p>
      </PageHero>

      {/* On phones every filter stays in view, wrapping to a second row; from sm up they share one sticky row. */}
      <div className="z-30 mt-16 border-y hair bg-deep/85 px-[var(--gutter)] backdrop-blur-xl sm:sticky sm:top-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div className="no-scrollbar flex min-w-0 flex-wrap gap-1.5 sm:flex-nowrap sm:gap-2 sm:overflow-x-auto" role="group" aria-label={t(ui.sector)}>
            {sectors.map((s) => {
              const count = s === "all" ? all.length : all.filter((p) => p.sector === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={filter === s}
                  onClick={() => choose(s)}
                  className={clsx(
                    "label chamfer flex h-10 shrink-0 items-center gap-1.5 px-2.5 transition-colors duration-300 max-sm:ltr:!text-[0.62rem] max-sm:ltr:!tracking-[0.08em] sm:gap-2 sm:px-4",
                    filter === s ? "bg-ochre text-ink" : "bg-white/[0.06] text-gypsum/70 hover:bg-white/[0.12] hover:text-gypsum",
                  )}
                >
                  {s === "all" ? t(ui.filterAll) : t(ui.sectorNames[s])}
                  <span className="opacity-60">{n(count)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex shrink-0 gap-1" role="group" aria-label={t(ui.viewLabel)}>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                aria-label={v === "grid" ? t(ui.gridView) : t(ui.listView)}
                onClick={() => setViewSaved(v)}
                className={clsx(
                  "chamfer grid h-10 w-9 place-items-center transition-colors sm:w-10",
                  view === v ? "bg-gypsum text-ink" : "bg-white/[0.06] text-gypsum/60 hover:text-gypsum",
                )}
              >
                {v === "grid" ? <GridFour size={16} /> : <Rows size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="px-[var(--gutter)] pb-[var(--bay)] pt-16">
        {shown.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gypsum/70">{t(ui.noProjects)}</p>
            <button type="button" onClick={() => choose("all")} className="label link-line mt-4 text-ochre">
              {t(ui.filterAll)}
            </button>
          </div>
        ) : view === "grid" ? (
          <div ref={grid} className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {shown.map((p, i) => (
              <GridCard key={p.id} p={p} i={i} />
            ))}
          </div>
        ) : (
          <ListView items={shown} />
        )}
      </section>
    </>
  );
}

function GridCard({ p, i }: { p: Project; i: number }) {
  const { t, n, lang } = useLocale();
  return (
    <article data-flip data-flip-id={p.id} className={clsx(i % 2 === 1 && "md:mt-28")}>
      <TLink to={`/projects/${p.slug}`} className="group block">
        <div className="chamfer chamfer-lg relative aspect-[4/5] overflow-hidden bg-deep-3">
          <Image
            src={p.cover}
            alt={`${lang === "ar" ? p.nameAr : p.name}, ${t(p.type)}`}
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.75),transparent_50%)]" />
          <span className="label absolute start-4 top-4 bg-deep/70 px-2.5 py-1.5 backdrop-blur-md">{t(ui.sectorNames[p.sector])}</span>
          <span
            className="mega pointer-events-none absolute -bottom-2 end-4 text-[4.5rem] text-transparent transition-colors duration-700 [-webkit-text-stroke:1px_rgb(240_237_230/0.45)] group-hover:[-webkit-text-stroke-color:var(--color-ochre)]"
            aria-hidden="true"
          >
            {n(String(i + 1).padStart(2, "0"))}
          </span>
        </div>
        <div className="mt-5">
          <h2 className="mega mega-sm transition-colors group-hover:text-ochre">{lang === "ar" ? p.nameAr : p.name}</h2>
          <p className="label mt-2 text-mist">
            {t(p.type)} · {t(p.city)}
          </p>
        </div>
      </TLink>
    </article>
  );
}

function ListView({ items }: { items: Project[] }) {
  const { t, n, lang } = useLocale();
  const [active, setActive] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = float.current;
    const root = box.current;
    if (!el || !root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    root.addEventListener("pointermove", move);
    return () => root.removeEventListener("pointermove", move);
  }, []);

  return (
    <div ref={box} className="relative" onPointerLeave={() => setActive(null)}>
      <div className="label hidden grid-cols-[4rem_2fr_1.3fr_1fr_1fr] gap-4 border-b hair pb-3 text-mist md:grid">
        <span>#</span>
        <span>{t(ui.nav.projects)}</span>
        <span>{t(ui.type)}</span>
        <span>{t(ui.city)}</span>
        <span>{t(ui.sector)}</span>
      </div>
      <ol>
        {items.map((p, i) => (
          <li key={p.id} className="border-b hair">
            <TLink
              to={`/projects/${p.slug}`}
              onPointerEnter={() => setActive(p.id)}
              onFocus={() => setActive(p.id)}
              className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 gap-y-1 py-6 md:grid-cols-[4rem_2fr_1.3fr_1fr_1fr]"
            >
              <span className="font-mono text-xs text-mist">P·{n(String(i + 1).padStart(2, "0"))}</span>
              <span className={clsx("mega mega-sm transition-all duration-500", active === p.id ? "text-ochre" : active && "md:opacity-40")}>
                {lang === "ar" ? p.nameAr : p.name}
              </span>
              <span className="col-start-2 text-gypsum/70 md:col-start-auto">{t(p.type)}</span>
              <span className="col-start-2 text-gypsum/70 md:col-start-auto">{t(p.city)}</span>
              <span className="label col-start-2 text-mist md:col-start-auto">{t(ui.sectorNames[p.sector])}</span>
            </TLink>
          </li>
        ))}
      </ol>
      <div ref={float} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block">
        <div
          className={clsx(
            "relative -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[var(--ease-out-expo)]",
            active ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <div className="chamfer relative h-[18rem] w-[14rem] overflow-hidden bg-deep-3">
            {items.map((p) => (
              <Image
                key={p.id}
                src={p.cover}
                alt=""
                fill
                sizes="240px"
                className={clsx(
                  "object-cover transition-[clip-path] duration-700 ease-[var(--ease-out-expo)]",
                  active === p.id ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
