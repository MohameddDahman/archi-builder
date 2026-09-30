"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { useSite } from "@/lib/content/store";
import { ui } from "@/lib/dict";
import { PageHero } from "@/components/ui/page-hero";
import { Rich } from "@/components/ui/rich";
import { FrameImage, Reveal, RevealText } from "@/components/ui/motion";
import { Axis } from "@/components/ui/primitives";
import type { TeamMember } from "@/lib/content/types";

export function StudioPage() {
  const { t } = useLocale();
  const c = useSite((s) => s.content);
  return (
    <>
      <PageHero index="05" name={t(ui.nav.studio)} title={t(c.about.title)} lead={t(c.about.body[0])} image={c.about.image} />
      <section className="px-[var(--gutter)] py-[var(--bay)]">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <Axis letter="A" className="text-ochre">
                {t(ui.studioLabel)}
              </Axis>
            </div>
          </div>
          <div className="flex flex-col gap-10 lg:col-span-7 lg:col-start-6">
            {c.about.body.slice(1).map((p, i) => (
              <RevealText key={i} as="p" className="statement-sm text-gypsum/90">
                {t(p)}
              </RevealText>
            ))}
          </div>
        </div>
      </section>
      <VisionMission />
      <Values />
      <Team />
    </>
  );
}

function VisionMission() {
  const { t } = useLocale();
  const { vision, mission } = useSite((s) => s.content);
  const blocks = [
    { key: "vision", letter: "B", label: ui.vision, ...vision },
    { key: "mission", letter: "C", label: ui.mission, ...mission },
  ];
  return (
    <section className="on-light">
      {blocks.map((b, i) => (
        <div key={b.key} className="grid lg:min-h-svh lg:grid-cols-2">
          <div className={i % 2 ? "lg:order-2" : ""}>
            <div className="p-[var(--gutter)] lg:sticky lg:top-0 lg:h-svh">
              <FrameImage src={b.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="chamfer chamfer-lg aspect-[4/5] lg:aspect-auto lg:h-full" />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-8 px-[var(--gutter)] py-20 lg:px-[5vw]">
            <Axis letter={b.letter} className="text-ochre">
              {t(b.label)}
            </Axis>
            <RevealText as="h2" className="statement max-w-[16ch] text-balance">
              <Rich text={t(b.title)} />
            </RevealText>
            <Reveal>
              <p className="lead max-w-lg text-taupe">{t(b.body)}</p>
            </Reveal>
          </div>
        </div>
      ))}
    </section>
  );
}

/** Values stack like drawing sheets: each slides over the last and pushes it back. */
function Values() {
  const { t, n } = useLocale();
  const values = useSite((s) => s.content.values);
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-value]");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card.firstElementChild, {
          scale: 0.92,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 25%", scrub: true },
        });
      });
    },
    { scope: ref, dependencies: [values.length] },
  );
  const images = ["/images/site/detail.jpg", "/images/site/drawings.jpg", "/images/site/site-review.jpg", "/images/site/methodology.jpg", "/images/site/execution.jpg"];
  return (
    <section ref={ref} className="px-[var(--gutter)] py-[var(--bay)]">
      <div className="mb-16">
        <Axis letter="D" className="mb-8 text-ochre">
          {t(ui.values)}
        </Axis>
        <RevealText as="h2" className="mega mega-lg">
          <Rich text={t(ui.valuesTitle)} />
        </RevealText>
      </div>
      <div className="flex flex-col gap-6">
        {values.map((v, i) => (
          <div key={v.key} data-value className="sticky" style={{ top: `calc(var(--header-h) + ${1 + i * 1.1}rem)` }}>
            <article className="chamfer chamfer-lg grid min-h-[62svh] origin-top overflow-hidden bg-deep-2 md:grid-cols-12">
              <div className="flex flex-col justify-between gap-10 p-8 md:col-span-7 md:p-12">
                <span className="font-mono text-xs text-mist">
                  V·{n(String(i + 1).padStart(2, "0"))} / {n(String(values.length).padStart(2, "0"))}
                </span>
                <div>
                  <h3 className="mega mega-md text-ochre">{t(v.title)}</h3>
                  <p className="lead mt-6 max-w-md text-gypsum/75">{t(v.body)}</p>
                </div>
              </div>
              <div className="relative min-h-60 md:col-span-5">
                <Image src={images[i % images.length]} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}

function Team() {
  const { t } = useLocale();
  const team = useSite((s) => s.team);
  const intro = useSite((s) => s.content.teamIntro);
  const members = [...team].sort((a, b) => a.order - b.order);
  return (
    <section className="on-light px-[var(--gutter)] py-[var(--bay)]">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Axis letter="E" className="mb-8 text-ochre">
            {t(ui.team)}
          </Axis>
          <RevealText as="h2" className="statement text-balance">
            <Rich text={t(intro.title)} />
          </RevealText>
        </div>
        <Reveal className="lg:col-span-5 lg:col-start-8 lg:pt-16">
          <p className="text-taupe">{t(intro.body)}</p>
        </Reveal>
      </div>
      <Reveal className="mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" stagger={0.12}>
        {members.map((m) => (
          <MemberCard key={m.id} m={m} />
        ))}
      </Reveal>
    </section>
  );
}

function MemberCard({ m }: { m: TeamMember }) {
  const { t } = useLocale();
  const initials = m.name.en
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <article className="group">
      <div className="chamfer chamfer-lg relative aspect-[4/5] overflow-hidden bg-deep-3">
        {m.photo ? (
          <Image
            src={m.photo}
            alt={t(m.name)}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover grayscale transition-all duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(90%_70%_at_50%_30%,#1f1f1f,#0d0d0d)]">
            <span className="absolute inset-[8%] border border-white/[0.06]" aria-hidden="true" />
            <span className="mega gold-text text-[4.5rem] transition-transform duration-700 group-hover:scale-110" aria-hidden="true" dir="ltr">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="mt-6">
        <h3 className="mega mega-sm">{t(m.name)}</h3>
        <p className="label mt-2 text-ochre">{t(m.role)}</p>
        <p className="mt-4 text-[0.95rem] text-taupe">{t(m.bio)}</p>
      </div>
    </article>
  );
}
