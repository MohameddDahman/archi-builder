"use client";

import Image from "next/image";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useLocale } from "@/components/providers/locale";
import { useLenis } from "@/components/providers/smooth-scroll";
import { TLink } from "@/components/ui/tlink";
import { Btn, BtnA, Scramble, Slab, TextArrow } from "@/components/ui/primitives";
import { RevealText } from "@/components/ui/motion";
import { Rich } from "@/components/ui/rich";
import { Logo } from "@/components/brand/logo";
import { useSite } from "@/lib/content/store";
import { navItems, ui } from "@/lib/dict";

export function Footer() {
  const { t, n, lang } = useLocale();
  const pathname = usePathname();
  const settings = useSite((s) => s.settings);
  const lenis = useLenis();
  const ref = useRef<HTMLElement>(null);
  const onContact = pathname.endsWith("/contact");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-signature]",
        { yPercent: 60, opacity: 0.2 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-signature]", start: "top bottom", end: "bottom bottom", scrub: 0.6 },
        },
      );
      if (ref.current?.querySelector("[data-cta]"))
        gsap.fromTo(
          "[data-cta-img]",
          { scale: 1.25, yPercent: -10 },
          {
            scale: 1.05,
            yPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: "[data-cta]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
    },
    { scope: ref, dependencies: [lang, onContact] },
  );

  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.mapQuery)}`;

  return (
    <footer ref={ref} className="relative overflow-hidden bg-deep text-gypsum">
      {!onContact && (
        <div data-cta className="relative isolate overflow-hidden">
          <div data-cta-img className="absolute inset-0 -z-10">
            <Image src="/images/site/villa-dusk.jpg" alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-deep),rgb(10_10_10/0.55)_40%,var(--color-deep))]" />
          <div className="px-[var(--gutter)] py-[var(--bay)]">
            <div className="label mb-10 flex items-center gap-3 text-ochre">
              <Slab />
              {t(ui.ctaLabel)}
            </div>
            <RevealText as="h2" className="mega mega-lg max-w-[14ch]">
              <Rich text={t(ui.ctaTitle)} />
            </RevealText>
            <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="lead max-w-md text-gypsum/75">{t(ui.ctaBody)}</p>
              <div className="flex flex-wrap gap-3">
                <Btn to="/contact">{t(ui.startProject)}</Btn>
                {settings.whatsapp && (
                  <BtnA href={`https://wa.me/${settings.whatsapp}`} external tone="ghost">
                    {t(ui.whatsapp)}
                  </BtnA>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-12 border-t hair px-[var(--gutter)] py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="label mb-5 text-mist">{t(ui.visit)}</p>
          <address className="max-w-[17rem] not-italic text-gypsum/85">{t(settings.address)}</address>
          <a href={mapHref} target="_blank" rel="noreferrer" className="label link-line mt-4 inline-flex items-center gap-2 text-ochre">
            <Scramble text={settings.coordinates} /> <TextArrow to="out" />
          </a>
        </div>
        <div>
          <p className="label mb-5 text-mist">{t(ui.call)}</p>
          <ul className="flex flex-col gap-2">
            {settings.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="statement-sm link-line" dir="ltr">
                  {p}
                </a>
              </li>
            ))}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="link-line">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>
        <nav aria-label={t(ui.follow)}>
          <p className="label mb-5 text-mist">{t(ui.follow)}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
            {navItems.map((item, i) => (
              <li key={item.key}>
                <TLink to={item.path} className="group inline-flex items-baseline gap-2 text-gypsum/85 hover:text-gypsum">
                  <span className="font-mono text-[0.68rem] text-gypsum/45 group-hover:text-ochre rtl:text-[0.78rem]">{n(String(i + 1).padStart(2, "0"))}</span>
                  <span className="link-line">{t(ui.nav[item.key])}</span>
                </TLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <button
            type="button"
            onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2.2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
            className="label chamfer inline-flex h-11 items-center gap-2 bg-white/[0.07] px-5 transition-colors hover:bg-ochre hover:text-ink"
          >
            ↑ {t(ui.backToTop)}
          </button>
          {(settings.instagram || settings.linkedin) && (
            <div className="flex gap-4">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="label link-line">
                  Instagram
                </a>
              )}
              {settings.linkedin && (
                <a href={settings.linkedin} target="_blank" rel="noreferrer" className="label link-line">
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* signature: the real logo, drawn to the full width of the page */}
      <div className="overflow-hidden px-[var(--gutter)]" aria-hidden="true">
        <div data-signature className="border-t hair pt-8">
          <Logo tone="light" className="h-auto w-full opacity-95" title="" />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-[var(--gutter)] pb-8 pt-8 text-sm text-mist sm:flex-row sm:justify-between">
        <span>
          © {n(new Date().getFullYear())} {t(settings.companyName)}. {t(ui.rights)}
        </span>
        <span className="label">{t(ui.tagline)}</span>
      </div>
    </footer>
  );
}
