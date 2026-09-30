"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import clsx from "clsx";
import { useShallow } from "zustand/react/shallow";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { useSite, publishedProjects } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { TLink } from "@/components/ui/tlink";
import { Rich } from "@/components/ui/rich";
import { Counter, Reveal, RevealText } from "@/components/ui/motion";
import { Axis, Btn, Scramble } from "@/components/ui/primitives";
import { PlanSvg } from "@/components/house/plan-svg";
import { ClosedBook } from "@/components/book/closed-book";
import type { Project } from "@/lib/content/types";

const SCALE_STEPS = [100, 50, 20, 10, 5, 2, 1];

/* ------------------------------------------------------------------
   A · Manifesto: the scale morph. A drawing-sized image grows to full
   bleed while the scale counts down to 1:1 — the logo, acted out.
------------------------------------------------------------------ */
export function Manifesto() {
  const { t, n } = useLocale();
  const about = useSite((s) => s.content.about);
  const counts = useSite(
    useShallow((s) => [publishedProjects(s.projects).length, s.content.services.length, s.content.sectors.length, s.content.process.length]),
  );
  const pin = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(100);

  useGSAP(
    () => {
      const el = pin.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        setScale(1);
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const i = Math.min(SCALE_STEPS.length - 1, Math.floor(self.progress * SCALE_STEPS.length * 1.05));
            setScale(SCALE_STEPS[i]);
          },
        },
      });
      tl.fromTo("[data-frame]", { clipPath: "inset(32% 36% 32% 36%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
        .fromTo("[data-frame] img", { scale: 1.5 }, { scale: 1, ease: "none" }, 0)
        .fromTo("[data-top]", { yPercent: 0 }, { yPercent: -60, opacity: 0, ease: "none" }, 0)
        .fromTo("[data-bottom]", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.7);
    },
    { scope: pin },
  );

  return (
    <section aria-label={t(ui.studioLabel)}>
      <div ref={pin} className="relative h-[240svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div data-frame className="absolute inset-0" style={{ clipPath: "inset(32% 36% 32% 36%)" }}>
            <Image src={about.image} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.85),transparent_55%)]" />
          </div>

          <div data-top className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2rem)] flex items-start justify-between gap-10 px-[var(--gutter)]">
            <div>
              <Axis letter="A" className="mb-8 text-ochre">
                {t(ui.studioLabel)}
              </Axis>
              <p className="mega mega-md max-w-[10ch]">{t(ui.manifestoTop)}</p>
            </div>
            <p className="mt-14 hidden max-w-xs text-sm text-gypsum/60 md:block">{t(ui.manifestoNote)}</p>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex items-end justify-between px-[var(--gutter)]">
            <div>
              <p className="label text-gypsum/70">{t(ui.scaleLabel)}</p>
              <p className="mega mega-xl leading-none text-gypsum" dir="ltr" style={{ textAlign: "start" }}>
                {n(1)}:{n(scale)}
              </p>
            </div>
            <div data-bottom className="hidden max-w-sm text-end md:block">
              <p className="mega mega-sm text-ochre">{t(ui.manifestoBottom)} {n(1)}:{n(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[var(--gutter)] py-[var(--bay)]">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RevealText as="h2" className="statement text-balance">
              <Rich text={t(about.title)} />
            </RevealText>
          </div>
          <Reveal className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:pt-2">
            <p className="text-gypsum/70 md:hidden">{t(ui.manifestoNote)}</p>
            <p className="text-gypsum/70">{t(about.body[0])}</p>
            <div>
              <Btn to="/studio" tone="ghost">
                {t(ui.aboutStudio)}
              </Btn>
            </div>
          </Reveal>
        </div>
        <Reveal as="dl" className="mt-24 grid grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {ui.facts.map((f, i) => (
            <div key={i} className="flex flex-col-reverse border-t hair py-7 pe-6">
              <dt className="label mt-4 text-mist">{t(f)}</dt>
              <dd className="mega mega-lg">
                <Counter value={counts[i]} />
              </dd>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   B · Built work: a pinned filmstrip that leans with scroll speed.
------------------------------------------------------------------ */
function FilmCard({ p, i }: { p: Project; i: number }) {
  const { t, n, lang } = useLocale();
  return (
    <article data-card className="group relative w-full shrink-0 lg:w-[min(31vw,520px)]">
      <TLink to={`/projects/${p.slug}`} className="block">
        <div className="chamfer chamfer-lg relative aspect-[3/4] overflow-hidden bg-deep-3">
          <div data-card-img className="absolute inset-[-8%]">
            <Image
              src={p.cover}
              alt={`${lang === "ar" ? p.nameAr : p.name}, ${t(p.type)}`}
              fill
              sizes="(min-width:1024px) 32vw, 100vw"
              className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.8),transparent_50%)]" />
          <span
            className="mega pointer-events-none absolute -bottom-2 end-3 text-[4rem] text-transparent transition-colors duration-700 [-webkit-text-stroke:1px_rgb(240_237_230/0.5)] group-hover:[-webkit-text-stroke-color:var(--color-ochre)]"
            aria-hidden="true"
          >
            {n(String(i + 1).padStart(2, "0"))}
          </span>
          <span className="label absolute start-4 top-4 bg-deep/70 px-2.5 py-1.5 backdrop-blur-md">{t(ui.sectorNames[p.sector])}</span>
        </div>
        <div className="mt-5">
          <h3 className="mega mega-sm transition-colors group-hover:text-ochre">{lang === "ar" ? p.nameAr : p.name}</h3>
          <p className="label mt-2 text-mist">
            {t(p.type)} · {t(p.city)}
          </p>
        </div>
      </TLink>
    </article>
  );
}

export function Filmstrip() {
  const { t, dir } = useLocale();
  const all = useSite((s) => s.projects);
  const list = publishedProjects(all);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const sign = dir === "rtl" ? 1 : -1;
        const skewTo = gsap.quickTo("[data-card]", "skewX", { duration: 0.5, ease: "power3" });
        const tween = gsap.to(el, {
          x: () => sign * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => skewTo(gsap.utils.clamp(-6, 6, (self.getVelocity() / 400) * sign * -1)),
            onScrubComplete: () => skewTo(0),
          },
        });
        el.querySelectorAll<HTMLElement>("[data-card-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: sign * 6 },
            {
              xPercent: sign * -6,
              ease: "none",
              scrollTrigger: { trigger: img.closest("[data-card]"), containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          );
        });
        gsap.fromTo("[data-strip-progress]", { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [dir, list.length] },
  );

  return (
    <section ref={section} className="relative overflow-hidden bg-deep-2" aria-label={t(ui.workLabel)}>
      <div
        ref={track}
        className="flex flex-col gap-16 px-[var(--gutter)] py-[var(--bay)] lg:h-svh lg:w-max lg:flex-row lg:items-center lg:gap-[3.5vw] lg:py-0"
      >
        <div className="flex shrink-0 flex-col justify-center gap-8 lg:w-[34vw]">
          <Axis letter="B" className="text-ochre">
            {t(ui.workLabel)}
          </Axis>
          <RevealText as="h2" className="mega mega-lg">
            <Rich text={t(ui.workTitle)} />
          </RevealText>
          <p className="max-w-sm text-gypsum/70">{t(ui.workBody)}</p>
          <div>
            <Btn to="/projects" tone="light">
              {t(ui.allProjects)}
            </Btn>
          </div>
        </div>
        {list.map((p, i) => (
          <FilmCard key={p.id} p={p} i={i} />
        ))}
        <div className="hidden w-[4vw] shrink-0 lg:block" aria-hidden="true" />
      </div>
      <div className="absolute inset-x-[var(--gutter)] bottom-8 hidden h-px bg-white/15 lg:block" aria-hidden="true">
        <div data-strip-progress className="h-full origin-left bg-ochre rtl:origin-right" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   C · The model: the plan draws itself, and leads to /build
------------------------------------------------------------------ */
export function BuildTeaser() {
  const { t, n } = useLocale();
  return (
    <section className="on-light px-[var(--gutter)] py-[var(--bay)]">
      <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <Axis letter="C" className="mb-8 text-ochre">
            {t(ui.buildLabel)}
          </Axis>
          <RevealText as="h2" className="mega mega-lg">
            <Rich text={t(ui.buildTitle)} />
          </RevealText>
          <Reveal className="mt-8 flex flex-col items-start gap-8">
            <p className="max-w-md text-taupe">{t(ui.buildBody)}</p>
            <Btn to="/build">
              {t(ui.enterBuild)}
            </Btn>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <TLink to="/build" aria-label={t(ui.enterBuild)} className="group block">
            <div className="chamfer chamfer-lg relative aspect-[30/26] overflow-hidden bg-deep-3 text-gypsum">
              <div
                className="absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                aria-hidden="true"
              />
              <PlanSvg className="absolute inset-[5%] h-[90%] w-[90%] transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
              <span className="label chamfer absolute bottom-4 end-4 translate-y-3 bg-ochre px-4 py-2.5 text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {t(ui.enterBuild)} →
              </span>
            </div>
          </TLink>
          <ol className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ui.buildChips.map((c, i) => (
              <li key={i} className="border-t hair pt-3">
                <span className="label block text-taupe">
                  {n(String(i + 1).padStart(2, "0"))} · {t(c.k)}
                </span>
                <span className="mt-1 block font-medium">{t(c.v)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   D · Scope: services as an opening schedule
------------------------------------------------------------------ */
export function Scope() {
  const { t, n } = useLocale();
  const services = useSite((s) => s.content.services);
  const [open, setOpen] = useState(0);
  return (
    <section className="px-[var(--gutter)] py-[var(--bay)]">
      <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Axis letter="D" className="mb-8 text-ochre">
            {t(ui.servicesLabel)}
          </Axis>
          <RevealText as="h2" className="mega mega-lg">
            <Rich text={t(ui.servicesTitle)} />
          </RevealText>
        </div>
        <div className="lg:col-span-3 lg:col-start-10 lg:justify-self-end">
          <Btn to="/services" tone="ghost">
            {t(ui.allServices)}
          </Btn>
        </div>
      </div>
      <ol className="border-t hair">
        {services.map((s, i) => {
          const active = open === i;
          return (
            <li key={s.key} className="border-b hair">
              <button
                type="button"
                aria-expanded={active}
                onClick={() => setOpen(i)}
                onPointerEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(i)}
                className="grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 py-6 text-start md:grid-cols-[5rem_1fr_auto]"
              >
                <span className={clsx("font-mono text-xs transition-colors", active ? "text-ochre" : "text-mist")}>
                  S·{n(String(i + 1).padStart(2, "0"))}
                </span>
                <span className={clsx("mega mega-sm transition-colors duration-500", active ? "text-gypsum" : "text-gypsum/45")}>{t(s.title)}</span>
                <span
                  className={clsx("chamfer grid h-9 w-9 place-items-center transition-colors duration-500", active ? "bg-ochre text-ink" : "bg-white/[0.07]")}
                  aria-hidden="true"
                >
                  <span className={clsx("block text-lg leading-none transition-transform duration-500", active && "rotate-45")}>+</span>
                </span>
              </button>
              <div
                className={clsx(
                  "grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)]",
                  active ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-6 pb-8 md:grid-cols-[5rem_1fr_1.2fr] md:gap-4">
                    <span />
                    <div className="flex flex-col justify-between gap-6">
                      <p className="lead max-w-md text-gypsum/75">{t(s.body)}</p>
                      <TLink to={`/services#${s.key}`} className="label link-line self-start text-ochre">
                        {t(ui.allServices)} →
                      </TLink>
                    </div>
                    <div className="chamfer relative aspect-[16/9] overflow-hidden bg-deep-3">
                      <Image src={s.image} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className={clsx("object-cover transition-transform duration-[1.4s]", active ? "scale-100" : "scale-110")} />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------
   Statement: one process, one direction, one accountable team
------------------------------------------------------------------ */
export function Statement() {
  const { t, lang } = useLocale();
  const lines = useSite((s) => s.content.statement);
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || lang === "ar") return;
      ref.current?.querySelectorAll<HTMLElement>("[data-line]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { "--w": 62, xPercent: i % 2 ? 6 : -6 },
          { "--w": 125, xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 98%", end: "top 45%", scrub: 0.5 } },
        );
      });
    },
    { scope: ref, dependencies: [lang] },
  );
  return (
    <section ref={ref} className="on-light overflow-hidden px-[var(--gutter)] py-[var(--bay)]">
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <p
            key={i}
            data-line
            className="mega text-[clamp(1.5rem,3.4vw,3.6rem)] even:self-end even:text-ochre"
            style={lang === "ar" ? undefined : { fontVariationSettings: "'wdth' var(--w, 125)" }}
          >
            {t(l)}
          </p>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   E · Process: pinned stages with the site photograph for each
------------------------------------------------------------------ */
const STAGE_IMAGES = [
  "/images/site/drawings.jpg",
  "/images/site/methodology.jpg",
  "/images/site/site-review.jpg",
  "/images/site/execution.jpg",
  "/images/site/quality.jpg",
  "/images/site/living-hall.jpg",
];

export function Process({ letter }: { letter?: string }) {
  const { t, n } = useLocale();
  const process = useSite((s) => s.content.process);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-stage]");
      items.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root, dependencies: [process.length] },
  );

  return (
    <section ref={root} className="px-[var(--gutter)] py-[var(--bay)]">
      <div className="mb-16">
        <Axis letter={letter} className="mb-8 text-ochre">
          {t(ui.processLabel)}
        </Axis>
        <RevealText as="h2" className="mega mega-lg max-w-[16ch]">
          <Rich text={t(ui.processTitle)} />
        </RevealText>
      </div>
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)]">
            <div className="chamfer chamfer-lg relative aspect-[4/5] overflow-hidden bg-deep-3">
              {STAGE_IMAGES.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="45vw"
                  className={clsx(
                    "object-cover transition-all duration-[1.2s] ease-[var(--ease-out-expo)]",
                    active === i ? "scale-100 opacity-100" : "scale-110 opacity-0",
                  )}
                />
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.7),transparent_45%)]" />
              <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
                <span className="mega mega-lg leading-none" dir="ltr">
                  {n(String(active + 1).padStart(2, "0"))}
                  <span className="text-gypsum/40">/{n("06")}</span>
                </span>
                <span className="label text-ochre">{t(process[active]?.title)}</span>
              </div>
            </div>
          </div>
        </div>
        <ol className="flex flex-col lg:col-span-5 lg:col-start-8">
          {process.map((s, i) => (
            <li
              key={i}
              data-stage
              className={clsx(
                "border-t hair py-10 transition-opacity duration-500 lg:min-h-[42svh]",
                active === i ? "opacity-100" : "lg:opacity-35",
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-ochre">
                  {n(String(i + 1).padStart(2, "0"))}
                </span>
                <Scramble text={`STAGE ${String(i + 1).padStart(2, "0")}/06`} className="label text-mist" />
              </div>
              <h3 className="mega mega-md mt-6">{t(s.title)}</h3>
              <p className="lead mt-4 max-w-md text-gypsum/70">{t(s.body)}</p>
              <div className="chamfer relative mt-6 aspect-[16/10] overflow-hidden lg:hidden">
                <Image src={STAGE_IMAGES[i]} alt="" fill sizes="100vw" className="object-cover" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   F · The portfolio book
------------------------------------------------------------------ */
export function BookTeaser() {
  const { t } = useLocale();
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-book]",
        { rotateY: 34, rotateX: 24, rotateZ: -10, y: 120 },
        { rotateY: -18, rotateX: 10, rotateZ: 4, y: -60, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="on-light relative overflow-hidden px-[var(--gutter)] py-[var(--bay)]">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <Axis letter="F" className="mb-8 text-ochre">
            {t(ui.bookLabel)}
          </Axis>
          <RevealText as="h2" className="mega mega-lg">
            <Rich text={t(ui.bookTitle)} />
          </RevealText>
          <p className="lead mt-8 max-w-md text-taupe">{t(ui.bookBody)}</p>
          <div className="mt-10" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
            <Btn to="/book" tone="light">
              {t(ui.openBook)}
            </Btn>
          </div>
        </div>
        <TLink
          to="/book"
          aria-label={t(ui.openBook)}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          className="mx-auto block w-[64%] max-w-[400px] [perspective:1600px]"
        >
          <div data-book className="[transform-style:preserve-3d]" dir="ltr">
            <ClosedBook open={hover ? 1 : 0} />
          </div>
        </TLink>
      </div>
    </section>
  );
}
