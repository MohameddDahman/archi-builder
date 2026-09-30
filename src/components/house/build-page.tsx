"use client";

import Image from "next/image";
import { useLocale } from "@/components/providers/locale";
import { ui } from "@/lib/dict";
import { PageHero } from "@/components/ui/page-hero";
import { Rich } from "@/components/ui/rich";
import { Reveal, RevealText } from "@/components/ui/motion";
import { Axis } from "@/components/ui/primitives";
import { HouseExperience } from "./experience";

export function BuildPage() {
  const { t, n } = useLocale();
  return (
    <>
      <PageHero index="03" name={t(ui.nav.build)} title={t(ui.buildTitle)} lead={t(ui.buildPageBody)}>
        <ol className="grid grid-cols-2 gap-x-4 gap-y-5">
          {ui.buildChips.map((c, i) => (
            <li key={i} className="border-t hair pt-3">
              <span className="label block text-mist">
                {n(String(i + 1).padStart(2, "0"))} · {t(c.k)}
              </span>
              <span className="mt-1 block font-medium">{t(c.v)}</span>
            </li>
          ))}
        </ol>
      </PageHero>
      <div className="h-[var(--bay)]" aria-hidden="true" />
      <HouseExperience length={700} />
      <Materials />
    </>
  );
}

function Materials() {
  const { t, n } = useLocale();
  return (
    <section className="on-light px-[var(--gutter)] py-[var(--bay)]">
      <div className="mb-16 max-w-4xl">
        <Axis letter="B" className="mb-8 text-ochre">
          {t(ui.materialsLabel)}
        </Axis>
        <RevealText as="h2" className="mega mega-lg">
          <Rich text={t(ui.materialsTitle)} />
        </RevealText>
      </div>
      <Reveal as="ul" className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
        {ui.materials.map((m, i) => (
          <li key={m.id} className="group">
            <div className="chamfer chamfer-lg relative aspect-[4/3] overflow-hidden bg-gypsum-2">
              <Image
                src={`/house/textures/${m.id}_diff.webp`}
                alt=""
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-110"
              />
            </div>
            <div className="mt-5 flex items-baseline gap-4">
              <span className="font-mono text-xs text-ochre">M·{n(String(i + 1).padStart(2, "0"))}</span>
              <div>
                <h3 className="mega mega-sm">{t(m.name)}</h3>
                <p className="label mt-2 text-taupe">{t(m.use)}</p>
              </div>
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
