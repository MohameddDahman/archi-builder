"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, maskDrop } from "@/lib/gsap";
import { useIntro } from "@/lib/ui-store";
import { useLocale } from "@/components/providers/locale";
import { useSite } from "@/lib/content/store";
import { RevealText } from "./motion";
import { Rich } from "./rich";
import { Scramble, Slab } from "./primitives";

type Props = {
  /** Page name, set as the monumental headline */
  name: string;
  /** Sentence under it; supports *accent* markup */
  title: string;
  lead?: string;
  image?: string;
  imageAlt?: string;
  index?: string;
  children?: React.ReactNode;
};

/** Opening of every inner page: the page name in monumental capitals, a statement, and a chamfered plate. */
export function PageHero({ name, title, lead, image, imageAlt = "", index, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { t, n, lang } = useLocale();
  const coords = useSite((s) => s.settings.coordinates);
  const company = useSite((s) => s.settings.companyName);

  useIntro(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(ref.current.querySelectorAll("[data-name]"), { yPercent: maskDrop(lang, 105) }, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.08 })
      .fromTo(ref.current.querySelectorAll("[data-hero-fade]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.35);
    const plate = ref.current.querySelector("[data-plate]");
    if (plate)
      tl.fromTo(plate, { clipPath: "inset(18% 22% 18% 22%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" }, 0.2);
    return () => tl.kill();
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const img = ref.current?.querySelector("[data-plate] img");
      if (img)
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.15 },
          { yPercent: 8, scale: 1.02, ease: "none", scrollTrigger: { trigger: "[data-plate]", start: "top bottom", end: "bottom top", scrub: true } },
        );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+4.5rem)]">
      <div className="px-[var(--gutter)]">
        <div data-hero-fade className="label mb-6 flex items-center justify-between gap-6 text-gypsum/70">
          <span className="flex items-center gap-3">
            <Slab />
            {index ? `${n(index)} — ` : ""}{t(company)}
          </span>
          <Scramble text={coords} intro className="hidden sm:inline" />
        </div>
        <h1 className="mask-line mega mega-xl overflow-hidden">
          <span data-name className="block">
            {name}
          </span>
        </h1>
        <div className="mt-10 grid gap-10 border-t hair pt-8 lg:grid-cols-12">
          <RevealText as="p" intro className="statement text-balance lg:col-span-7">
            <Rich text={title} />
          </RevealText>
          {(lead || children) && (
            <div data-hero-fade className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:pt-2">
              {lead && <p className="text-gypsum/70">{lead}</p>}
              {children}
            </div>
          )}
        </div>
      </div>
      {image && (
        <div className="mt-16 px-[var(--gutter)]">
          <div data-plate className="chamfer chamfer-lg relative aspect-[4/5] overflow-hidden bg-deep-3 sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image src={image} alt={imageAlt} fill preload sizes="100vw" quality={85} className="object-cover" />
          </div>
        </div>
      )}
    </section>
  );
}
