"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useIntro } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSite, publishedProjects } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { TLink } from "@/components/ui/tlink";
import { FrameImage, Reveal, RevealText } from "@/components/ui/motion";
import { Axis, Btn, Scramble } from "@/components/ui/primitives";
import type { Project } from "@/lib/content/types";

export function ProjectDetail({ slug }: { slug: string }) {
  const { t } = useLocale();
  const projects = useSite((s) => s.projects);
  const hydrated = useSite((s) => s.hydrated);
  const list = publishedProjects(projects);
  const index = list.findIndex((p) => p.slug === slug);
  const project = list[index];

  if (!project) {
    return (
      <section className="grid min-h-svh place-items-center px-[var(--gutter)] text-center">
        {hydrated ? (
          <div>
            <p className="mega mega-md">404</p>
            <p className="mt-4 text-gypsum/70">{t(ui.noProjects)}</p>
            <div className="mt-8">
              <Btn to="/projects">{t(ui.allProjects)}</Btn>
            </div>
          </div>
        ) : (
          <p className="label text-mist">…</p>
        )}
      </section>
    );
  }
  const next = list[(index + 1) % list.length];
  return <Detail key={project.id} p={project} i={index} next={next} />;
}

function Detail({ p, i, next }: { p: Project; i: number; next: Project }) {
  const { t, n, lang } = useLocale();
  const root = useRef<HTMLElement>(null);
  const [box, setBox] = useState<number | null>(null);
  const name = lang === "ar" ? p.nameAr : p.name;

  useIntro(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(
      el.querySelector("[data-cover-frame]"),
      { clipPath: "inset(16% 18% 16% 18%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.7, ease: "expo.inOut" },
      0,
    )
      .fromTo(el.querySelectorAll("[data-name]"), { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: "power4.out" }, 0.5)
      .fromTo(el.querySelectorAll("[data-fade]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.8);
    return () => tl.kill();
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to("[data-cover]", {
        yPercent: 16,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  const specs: [string, string][] = [
    [t(ui.type), t(p.type)],
    [t(ui.sector), t(ui.sectorNames[p.sector])],
    [t(ui.city), t(p.city)],
    ...(p.year ? ([[t(ui.year), n(p.year)]] as [string, string][]) : []),
    ...(p.area ? ([[t(ui.area), `${n(p.area)} m²`]] as [string, string][]) : []),
  ];

  return (
    <>
      <section ref={root} className="relative h-svh min-h-[620px] overflow-hidden">
        <div data-cover-frame className="absolute inset-0 overflow-hidden">
          <div data-cover className="absolute inset-0">
            <Image src={p.cover} alt={`${name}, ${t(p.type)}`} fill preload sizes="100vw" quality={85} className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_10_10/0.92),rgb(10_10_10/0.15)_55%,rgb(10_10_10/0.5))]" />
          </div>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-10">
          <div data-fade className="label mb-6 flex items-center justify-between text-gypsum/80">
            <Axis letter={n(String(i + 1).padStart(2, "0"))} className="text-ochre">
              {t(ui.nav.projects)}
            </Axis>
            <TLink to="/projects" className="link-line">
              ← {t(ui.allProjects)}
            </TLink>
          </div>
          <h1 className="mega mega-xl overflow-hidden">
            <span data-name className="block">
              {name}
            </span>
          </h1>
          <div data-fade className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/15 pt-5">
            {specs.map(([k, v]) => (
              <span key={k} className="label text-gypsum/80">
                <span className="text-gypsum/45">{k} · </span>
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-[var(--gutter)] py-[var(--bay)]">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <dl className="grid grid-cols-2 gap-x-6 lg:grid-cols-1">
              {specs.map(([k, v]) => (
                <div key={k} className="border-t hair py-4">
                  <dt className="label text-mist">{k}</dt>
                  <dd className="mt-1 font-medium">{v}</dd>
                </div>
              ))}
              <div className="col-span-2 border-t hair py-4 lg:col-span-1">
                <dt className="label text-mist">{t(ui.scope)}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {p.scope.map((s) => (
                    <span key={s.en} className="label chamfer bg-white/[0.07] px-3 py-1.5 [--chamfer:8px]">
                      {t(s)}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <RevealText as="p" className="statement text-balance">
              {t(p.summary)}
            </RevealText>
            <Reveal className="mt-10">
              <Scramble text={`P-${String(i + 1).padStart(2, "0")} / ${p.slug.toUpperCase()}`} className="label text-mist" />
            </Reveal>
          </div>
        </div>
      </section>

      <Gallery images={p.gallery} name={name} onOpen={setBox} />
      {box !== null && <Lightbox images={p.gallery} start={box} name={name} onClose={() => setBox(null)} />}

      <NextProject p={next} />
    </>
  );
}

function Gallery({ images, name, onOpen }: { images: string[]; name: string; onOpen: (i: number) => void }) {
  const { t, n } = useLocale();
  // Staggered three-column rhythm: frames stay close to the photographs' native size.
  const shapes = ["lg:col-span-5 aspect-[4/5]", "lg:col-span-4 lg:mt-28 aspect-[3/4]", "lg:col-span-3 lg:mt-56 aspect-[3/4]", "lg:col-span-4 lg:col-start-2 aspect-[3/4]", "lg:col-span-5 lg:mt-20 aspect-[4/5]"];
  return (
    <section className="on-light px-[var(--gutter)] py-[var(--bay)]" aria-label={t(ui.gallery)}>
      <Axis letter="G" className="mb-12 text-ochre">
        {t(ui.gallery)} · {n(images.length)}
      </Axis>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`${name} — ${i + 1}/${images.length}`}
            className={clsx("group block text-start", shapes[i % shapes.length].split(" ").filter((c) => c.startsWith("lg:")).join(" "))}
          >
            <FrameImage
              src={src}
              alt=""
              fill
              sizes="(min-width:1024px) 60vw, 100vw"
              className={clsx("chamfer chamfer-lg", shapes[i % shapes.length].split(" ").filter((c) => c.startsWith("aspect")).join(" "))}
              imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
            />
            <span className="label mt-3 block text-taupe">
              {n(String(i + 1).padStart(2, "0"))} / {n(String(images.length).padStart(2, "0"))}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Lightbox({ images, start, name, onClose }: { images: string[]; start: number; name: string; onClose: () => void }) {
  const { t, n } = useLocale();
  const lenis = useLenis();
  const [i, setI] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setI((v) => (v + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    lenis?.stop();
    const prevFocus = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(document.dir === "rtl" ? -1 : 1);
      if (e.key === "ArrowLeft") go(document.dir === "rtl" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    if (!prefersReducedMotion()) gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      prevFocus?.focus();
    };
  }, [go, onClose, lenis]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — ${t(ui.gallery)}`}
      className="fixed inset-0 z-[75] flex flex-col bg-deep/95 backdrop-blur-md"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
      data-lenis-prevent
    >
      <div className="flex items-center justify-between px-[var(--gutter)] py-5">
        <span className="label text-gypsum/70" dir="ltr">
          {n(String(i + 1).padStart(2, "0"))} / {n(String(images.length).padStart(2, "0"))}
        </span>
        <button type="button" onClick={onClose} aria-label={t(ui.closeImage)} className="chamfer grid h-11 w-11 place-items-center bg-white/10 hover:bg-ochre hover:text-ink">
          <X size={18} />
        </button>
      </div>
      <div className="relative flex-1">
        <Image key={images[i]} src={images[i]} alt={`${name} ${i + 1}`} fill sizes="100vw" quality={85} className="animate-[fadeUp_.5s_var(--ease-out-expo)] object-contain p-4 md:p-10" />
      </div>
      <div className="flex justify-center gap-3 pb-6">
        <button type="button" onClick={() => go(-1)} aria-label={t(ui.prevImage)} className="chamfer grid h-12 w-12 place-items-center bg-white/10 hover:bg-ochre hover:text-ink">
          <ArrowLeft size={18} className="rtl:-scale-x-100" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label={t(ui.nextImage)} className="chamfer grid h-12 w-12 place-items-center bg-white/10 hover:bg-ochre hover:text-ink">
          <ArrowRight size={18} className="rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}

function NextProject({ p }: { p: Project }) {
  const { t, lang } = useLocale();
  return (
    <section className="px-[var(--gutter)] py-[var(--bay)]">
      <TLink to={`/projects/${p.slug}`} className="group block">
        <span className="label text-ochre">{t(ui.nextProject)} →</span>
        <div className="mt-6 grid items-end gap-8 lg:grid-cols-12">
          <h2 className="mega mega-lg transition-colors duration-500 group-hover:text-ochre lg:col-span-7">{lang === "ar" ? p.nameAr : p.name}</h2>
          <div className="chamfer chamfer-lg relative aspect-[16/10] overflow-hidden lg:col-span-5">
            <Image
              src={p.cover}
              alt=""
              fill
              sizes="(min-width:1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
            />
          </div>
        </div>
      </TLink>
    </section>
  );
}
