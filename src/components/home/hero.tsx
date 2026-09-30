"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Pause, Play } from "@phosphor-icons/react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useIntro } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";
import { useSite, publishedProjects } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { TLink } from "@/components/ui/tlink";
import { Btn, Scramble, Slab } from "@/components/ui/primitives";
import { Rich } from "@/components/ui/rich";

const HOLD = 6500;

type Slide = {
  id: string;
  image: string;
  alt: string;
  label: string;
  name: string;
  sub: string;
  href: string;
};

/**
 * Editorial hero: the headline on clean black, and the work shown in a
 * tall framed window (the slanted corner of the 1:1 mark). Photographs
 * are never darkened or overlaid, and stay close to their native size.
 */
export function Hero() {
  const { t, n, lang } = useLocale();
  const hero = useSite((s) => s.content.hero);
  const settings = useSite((s) => s.settings);
  const all = useSite((s) => s.projects);
  const featured = publishedProjects(all).filter((p) => p.featured);

  const slides: Slide[] = [
    {
      id: "studio",
      image: hero.image || "/images/site/villa-dusk.jpg",
      alt: t(settings.companyName),
      label: t(ui.studioLabel),
      name: t(settings.companyName),
      sub: t(ui.tagline),
      href: "/studio",
    },
    ...(featured.length ? featured : publishedProjects(all)).slice(0, 4).map((p) => ({
      id: p.id,
      image: p.cover,
      alt: `${lang === "ar" ? p.nameAr : p.name}, ${t(p.type)}`,
      label: `${t(ui.sectorNames[p.sector])} · ${t(p.city)}`,
      name: lang === "ar" ? p.nameAr : p.name,
      sub: t(p.type),
      href: `/projects/${p.slug}`,
    })),
  ];

  const root = useRef<HTMLElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const go = useCallback((next: number) => {
    if (next === indexRef.current) return;
    setPrev(indexRef.current);
    indexRef.current = next;
    setIndex(next);
  }, []);

  useEffect(() => {
    if (!started || paused || slides.length < 2 || prefersReducedMotion()) return;
    const id = window.setTimeout(() => go((index + 1) % slides.length), HOLD);
    return () => window.clearTimeout(id);
  }, [index, paused, started, slides.length, go]);

  // Slide change: the next photograph rises into the frame; the caption follows
  useGSAP(
    () => {
      const el = root.current?.querySelector<HTMLElement>(`[data-slide="${index}"]`);
      if (!el || prev === null || prefersReducedMotion()) return;
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" });
      gsap.fromTo(el.querySelector("img"), { scale: 1.25 }, { scale: 1.06, duration: 2.2, ease: "expo.out" });
      gsap.fromTo(
        root.current!.querySelectorAll("[data-caption] > *"),
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.05, delay: 0.45 },
      );
    },
    { scope: root, dependencies: [index] },
  );

  // Scroll: the frame drifts up, the photograph inside drifts the other way
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to("[data-frame]", { yPercent: -8, ease: "none", scrollTrigger: st });
      gsap.to("[data-frame-inner]", { yPercent: 8, ease: "none", scrollTrigger: st });
      gsap.to("[data-hero-copy]", { yPercent: -12, opacity: 0.3, ease: "none", scrollTrigger: st });
    },
    { scope: root },
  );

  useIntro(() => {
    setStarted(true);
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo("[data-frame]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0.1)
      .fromTo(el.querySelector(`[data-slide="0"] img`), { scale: 1.35 }, { scale: 1.06, duration: 2.4, ease: "expo.out" }, 0.1)
      .fromTo(el.querySelectorAll("[data-line]"), { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.09 }, 0.35)
      .fromTo(el.querySelectorAll("[data-fade]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.8);
    return () => tl.kill();
  });

  const current = slides[index];
  const lines = t(hero.title).split("\n");

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-deep pt-[calc(var(--header-h)+1.5rem)] lg:min-h-svh"
      aria-roledescription="carousel"
      aria-label={t(ui.heroLabel)}
    >
      {/* gallery light behind the frame */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(38%_55%_at_74%_52%,rgb(224_171_38/0.11),transparent_72%)] rtl:bg-[radial-gradient(38%_55%_at_26%_52%,rgb(224_171_38/0.11),transparent_72%)]"
        aria-hidden="true"
      />

      <div className="relative grid gap-10 px-[var(--gutter)] pb-10 lg:min-h-[calc(100svh-var(--header-h)-1.5rem)] lg:grid-cols-12 lg:gap-8">
        {/* copy */}
        <div data-hero-copy className="flex flex-col justify-between gap-10 lg:col-span-6 lg:py-4">
          <div data-fade className="label flex items-center gap-3 text-gypsum/70">
            <Slab />
            {t(ui.basedIn)}
          </div>

          <h1 className="mega mega-xl text-gypsum" aria-label={lines.join(" ").replace(/\*/g, "")}>
            {lines.map((line, i) => (
              <span key={i} className="split-line block" aria-hidden="true">
                <span data-line className="block">
                  <Rich text={line} />
                </span>
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-8">
            <p data-fade className="max-w-md text-gypsum/70">
              {t(hero.sub)}
            </p>
            <div data-fade className="flex flex-wrap items-center gap-6">
              <Btn to="/contact">{t(hero.cta)}</Btn>
              <TLink to="/projects" className="label link-line text-gypsum/80 hover:text-gypsum">
                {t(ui.allProjects)} →
              </TLink>
            </div>
            <div data-fade className="hidden lg:block">
              <Scramble text={settings.coordinates} intro className="label text-gypsum/40" />
            </div>
          </div>
        </div>

        {/* the frame */}
        <div className="flex flex-col lg:col-span-6 lg:items-end">
          <div
            data-frame
            className="relative aspect-[4/5] w-full lg:w-[min(100%,calc((100svh-var(--header-h)-9rem)*0.8))]"
          >
            {/* the reveal animates the outer clip; the slanted corner lives on this layer */}
            <TLink to={current?.href ?? "/projects"} className="chamfer chamfer-lg group absolute inset-0 block overflow-hidden bg-deep-3" aria-label={current?.name}>
              <div data-frame-inner className="absolute inset-[-6%]">
                {slides.map((s, i) => (
                  <div
                    key={s.id}
                    data-slide={i}
                    className={clsx("absolute inset-0", i === index ? "z-10" : i === prev ? "z-0" : "invisible z-0")}
                    aria-hidden={i !== index}
                  >
                    <Image
                      src={s.image}
                      alt={i === index ? s.alt : ""}
                      fill
                      preload={i === 0}
                      sizes="(min-width:1024px) 45vw, 100vw"
                      quality={85}
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                      style={{ transform: "scale(1.06)" }}
                    />
                  </div>
                ))}
              </div>
            </TLink>
          </div>

          {/* caption + controls, aligned to the frame */}
          <div className="mt-5 w-full lg:w-[min(100%,calc((100svh-var(--header-h)-9rem)*0.8))]" aria-live="polite">
            <div className="flex items-end justify-between gap-6">
              <div className="min-w-0">
                <span data-caption className="block overflow-hidden">
                  <span className="label block text-ochre">{current?.label}</span>
                </span>
                <span data-caption className="mt-1.5 block overflow-hidden">
                  <span className="mega mega-sm block truncate">{current?.name}</span>
                </span>
              </div>
              <span className="label shrink-0 text-gypsum/50" dir="ltr">
                {n(String(index + 1).padStart(2, "0"))} / {n(String(slides.length).padStart(2, "0"))}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <ol className="flex flex-1 gap-1.5">
                {slides.map((s, i) => (
                  <li key={s.id} className="flex-1">
                    <button type="button" onClick={() => go(i)} aria-label={s.name} aria-current={i === index} className="block w-full py-2.5">
                      <span className="block h-[2px] w-full overflow-hidden bg-white/15">
                        <span
                          key={`${index}-${paused}-${started}`}
                          className={clsx("block h-full origin-left bg-ochre rtl:origin-right", i < index ? "scale-x-100" : i > index && "scale-x-0")}
                          style={
                            i === index
                              ? paused || !started
                                ? { transform: "scaleX(0.12)" }
                                : { animation: `fill ${HOLD}ms linear forwards` }
                              : undefined
                          }
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                aria-label={paused ? t(ui.play) : t(ui.pause)}
                className="chamfer grid h-9 w-9 shrink-0 place-items-center bg-white/[0.08] transition-colors hover:bg-ochre hover:text-ink [--chamfer:8px]"
              >
                {paused ? <Play size={13} weight="fill" /> : <Pause size={13} weight="fill" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
