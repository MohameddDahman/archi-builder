"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useLocale } from "@/components/providers/locale";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSite } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { PageHero } from "@/components/ui/page-hero";
import { Rich, paragraphs } from "@/components/ui/rich";
import { FrameImage, Reveal, RevealText } from "@/components/ui/motion";
import { Axis } from "@/components/ui/primitives";
import { Process } from "@/components/home/sections";

export function ServicesPage() {
  const { t } = useLocale();
  const c = useSite((s) => s.content);
  return (
    <>
      <PageHero index="02" name={t(ui.nav.services)} title={t(c.methodology.title)} lead={paragraphs(t(c.methodology.body))[0]} image="/images/site/process-hall.jpg" />
      <Method />
      <ServiceChapters />
      <Sectors />
      <Process letter="D" />
      <Chapters />
    </>
  );
}

/** The rest of the method, after the opening paragraph the hero carries. */
function Method() {
  const { t } = useLocale();
  const methodology = useSite((s) => s.content.methodology);
  const rest = paragraphs(t(methodology.body)).slice(1);
  if (!rest.length) return null;
  return (
    <section className="px-[var(--gutter)] pt-[var(--bay)]">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Axis letter="A" className="text-ochre lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            {t(methodology.kicker)}
          </Axis>
        </div>
        <div className="flex flex-col gap-10 lg:col-span-7 lg:col-start-6">
          {rest.map((p, i) => (
            <RevealText key={i} as="p" className="statement-sm text-gypsum/90">
              {p}
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceChapters() {
  const { t, n } = useLocale();
  const lenis = useLenis();
  const services = useSite((s) => s.content.services);
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.index))),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash && document.getElementById(hash);
    const id = target ? window.setTimeout(() => (lenis ? lenis.scrollTo(target, { offset: -100 }) : target.scrollIntoView()), 500) : 0;
    return () => {
      io.disconnect();
      window.clearTimeout(id);
    };
  }, [services.length, lenis]);

  const jump = (key: string) => {
    const el = document.getElementById(key);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -100 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="px-[var(--gutter)] py-[var(--bay)]">
      <div className="grid gap-12 lg:grid-cols-12">
        <nav className="hidden lg:col-span-3 lg:block" aria-label={t(ui.servicesLabel)}>
          <div className="sticky top-[calc(var(--header-h)+2rem)]">
            <Axis letter="B" className="mb-8 text-ochre">
              {t(ui.servicesLabel)}
            </Axis>
            <ol className="flex flex-col">
              {services.map((s, i) => (
                <li key={s.key}>
                  <a
                    href={`#${s.key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      jump(s.key);
                    }}
                    className={clsx(
                      "flex items-baseline gap-4 border-s-2 py-2.5 ps-5 transition-all duration-500",
                      active === i ? "border-ochre text-gypsum" : "border-white/10 text-gypsum/45 hover:text-gypsum/80",
                    )}
                  >
                    <span className="font-mono text-[0.68rem]">S·{n(String(i + 1).padStart(2, "0"))}</span>
                    <span className="font-medium">{t(s.title)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <div className="flex flex-col gap-28 md:gap-40 lg:col-span-8 lg:col-start-5">
          {services.map((s, i) => (
            <article
              key={s.key}
              id={s.key}
              data-index={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="scroll-mt-28"
            >
              <FrameImage src={s.image} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className="chamfer chamfer-lg aspect-[16/10]" />
              <div className="mt-10 grid gap-6 md:grid-cols-12">
                <span className="font-mono text-xs text-ochre md:col-span-1">S·{n(String(i + 1).padStart(2, "0"))}</span>
                <RevealText as="h2" className="mega mega-md md:col-span-6">
                  {t(s.title)}
                </RevealText>
                <Reveal className="md:col-span-5">
                  <p className="text-gypsum/70">{t(s.body)}</p>
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sectors() {
  const { t, n } = useLocale();
  const intro = useSite((s) => s.content.sectorsIntro);
  const sectors = useSite((s) => s.content.sectors);
  const [open, setOpen] = useState(0);
  return (
    <section className="on-light px-[var(--gutter)] py-[var(--bay)]">
      <div className="mb-16 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Axis letter="C" className="mb-8 text-ochre">
            {t(ui.sectors)}
          </Axis>
          <RevealText as="h2" className="mega mega-lg">
            <Rich text={t(intro.title)} />
          </RevealText>
        </div>
        <Reveal className="lg:col-span-4 lg:col-start-9">
          <p className="text-taupe">{t(intro.body)}</p>
        </Reveal>
      </div>
      <div className="flex flex-col gap-3 md:h-[80svh] md:flex-row">
        {sectors.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(i)}
            onPointerEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            className={clsx(
              "chamfer chamfer-lg group relative h-[62svh] overflow-hidden text-start text-gypsum transition-[flex-grow] duration-[1.1s] ease-[var(--ease-out-expo)] md:h-auto",
              open === i ? "md:grow-[3.2]" : "md:grow",
            )}
            style={{ flexBasis: 0 }}
          >
            <Image
              src={s.image}
              alt=""
              fill
              sizes="(min-width:768px) 60vw, 100vw"
              className={clsx("object-cover transition-all duration-[1.2s] ease-[var(--ease-out-expo)]", open === i ? "scale-100" : "scale-110 brightness-[.5] grayscale")}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.9),rgb(10_10_10/0.1)_55%,transparent)]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:p-9">
              <span className="font-mono text-xs text-ochre">{n(String(i + 1).padStart(2, "0"))}</span>
              <h3 className="mega mega-md">{t(s.title)}</h3>
              <ul className={clsx("flex flex-wrap gap-2 transition-all duration-700", open === i ? "opacity-100" : "md:translate-y-4 md:opacity-0")}>
                {s.items.map((it) => (
                  <li key={it.en} className="label chamfer bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                    {t(it)}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Chapters() {
  const { t } = useLocale();
  const { execution, quality } = useSite((s) => s.content);
  return (
    <section>
      <div className="grid items-center gap-12 px-[var(--gutter)] py-[var(--bay)] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <FrameImage src={execution.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="chamfer chamfer-lg aspect-[4/5]" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Axis letter="E" className="mb-8 text-ochre">
            {t(execution.kicker)}
          </Axis>
          <RevealText as="h2" className="statement">
            <Rich text={t(execution.title)} />
          </RevealText>
          <Reveal className="mt-8 flex flex-col gap-5">
            {paragraphs(t(execution.body)).map((p, i) => (
              <p key={i} className={i === 0 ? "lead text-gypsum/75" : "text-gypsum/65"}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
      <div className="grid bg-deep-2 lg:grid-cols-2">
        <div className="relative min-h-[60svh]">
          <Image src={quality.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-8 px-[var(--gutter)] py-24 lg:px-[6vw]">
          <Axis letter="F" className="text-ochre">
            {t(quality.kicker)}
          </Axis>
          <RevealText as="h2" className="statement max-w-[14ch]">
            <Rich text={t(quality.title)} />
          </RevealText>
          <div className="flex flex-col gap-5">
            {paragraphs(t(quality.body)).map((p, i) => (
              <p key={i} className={i === 0 ? "lead text-gypsum/75" : "text-gypsum/65"}>
                {p}
              </p>
            ))}
          </div>
          <Reveal as="ul" className="grid gap-x-8 gap-y-4 sm:grid-cols-2" stagger={0.07}>
            {quality.points.map((p, i) => (
              <li key={i} className="flex items-start gap-3 border-t border-white/15 pt-4">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-ochre" aria-hidden="true">
                  <path d="M1 4 16 1v15L1 19z" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M5 10.4l2.6 2.6 5.6-5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>{t(p)}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
