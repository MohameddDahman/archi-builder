"use client";

import Image from "next/image";
import { forwardRef } from "react";
import clsx from "clsx";
import { Logo, Mark } from "@/components/brand/logo";
import { plain } from "@/components/ui/rich";
import type { Project, SiteContent, Settings, TeamMember } from "@/lib/content/types";
import type { L, Locale } from "@/lib/i18n";
import { digits, tr } from "@/lib/i18n";
import { ui } from "@/lib/dict";

/* ------------------------------------------------------------------
   Page shell. Every page is a size container, so type is set in cqw
   and scales with the book at any size.
------------------------------------------------------------------ */
type PageProps = {
  children?: React.ReactNode;
  className?: string;
  hard?: boolean;
  folio?: string;
  dark?: boolean;
};

export const Page = forwardRef<HTMLDivElement, PageProps>(function Page({ children, className, hard, folio, dark }, ref) {
  return (
    <div ref={ref} data-density={hard ? "hard" : "soft"} className="book-page">
      <div
        className={clsx(
          "@container relative h-full w-full overflow-hidden",
          dark ? "bg-[#101010] text-[#efebe4]" : "bg-[#f3efe7] text-[#141414]",
          className,
        )}
      >
        {children}
        {folio && (
          <span className={clsx("absolute bottom-[3.2cqw] left-1/2 -translate-x-1/2 font-mono text-[clamp(7px,1.7cqw,11px)] tracking-[0.2em]", dark ? "text-white/40" : "text-black/40")}>
            {folio}
          </span>
        )}
        <span className="spine pointer-events-none absolute inset-y-0 w-[9%]" aria-hidden="true" />
      </div>
    </div>
  );
});

type Ctx = { lang: Locale; t: (v: L | undefined) => string; n: (v: string | number) => string };
export const bookCtx = (lang: Locale): Ctx => ({ lang, t: (v) => tr(v, lang), n: (v) => digits(v, lang) });

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[clamp(7px,1.8cqw,11px)] uppercase tracking-[0.22em] text-[#b3801a]">{children}</p>
);

const Title = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={clsx("font-[family-name:var(--display-face)] text-[clamp(18px,6.2cqw,40px)] font-semibold uppercase leading-[0.98] [font-variation-settings:'wdth'_118]", className)}>
    {children}
  </h2>
);

const Body = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={clsx("text-[clamp(8px,2.35cqw,14px)] leading-[1.55] text-black/70", className)}>{children}</p>
);

/** Carved-screen endpaper: a gold lattice like the rawasheen of Al-Balad. */
const lattice = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgb(217 165 42 / .22) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, rgb(217 165 42 / .22) 0 1px, transparent 1px 22px)",
};

/* ------------------------------------------------------------------
   Covers & endpapers
------------------------------------------------------------------ */
export const FrontCover = forwardRef<HTMLDivElement, { c: Ctx }>(function FrontCover({ c }, ref) {
  return (
    <Page ref={ref} hard dark className="bg-[#0f0f0f]">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgb(255_255_255/0.09),transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:url(/images/site/timber.webp)] [background-size:180px]" />
      <div className="absolute inset-[6%] border border-[#d9a52a]/45" />
      <div className="absolute inset-x-[13%] top-[14%]">
        <Logo tone="gold" className="w-[62%]" title="Archi Builder" />
      </div>
      <div className="absolute inset-x-[13%] bottom-[16%]">
        <p className="gold-text font-[family-name:var(--display-face)] text-[clamp(20px,8cqw,54px)] font-semibold uppercase leading-none [font-variation-settings:'wdth'_118]">
          {c.lang === "ar" ? "ملف الأعمال" : "Portfolio"}
        </p>
        <p className="mt-[2cqw] font-mono text-[clamp(7px,1.8cqw,11px)] uppercase tracking-[0.25em] text-[#d9a52a]/80">
          {c.n("2026")} · {c.t(ui.tagline)}
        </p>
      </div>
    </Page>
  );
});

export const Endpaper = forwardRef<HTMLDivElement, { mark?: boolean }>(function Endpaper({ mark }, ref) {
  return (
    <Page ref={ref} dark className="bg-[#0d0d0d]">
      <div className="absolute inset-0" style={lattice} />
      {mark && (
        <div className="absolute inset-0 grid place-items-center">
          <Mark className="h-[16cqw] w-auto opacity-80" />
        </div>
      )}
    </Page>
  );
});

export const BackCover = forwardRef<HTMLDivElement, { c: Ctx; settings: Settings }>(function BackCover({ c, settings }, ref) {
  return (
    <Page ref={ref} hard dark className="bg-[#0f0f0f]">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgb(255_255_255/0.07),transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:url(/images/site/timber.webp)] [background-size:180px]" />
      <div className="absolute inset-[6%] border border-[#d9a52a]/45" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[4cqw] px-[14%] text-center">
        <Mark className="h-[14cqw] w-auto" />
        <p className="text-[clamp(8px,2.2cqw,13px)] leading-relaxed text-[#d9a52a]/85">{c.t(settings.address)}</p>
        <p className="font-mono text-[clamp(8px,2cqw,12px)] tracking-[0.15em] text-[#d9a52a]/85" dir="ltr">
          {settings.phones.join("  ·  ")}
        </p>
      </div>
    </Page>
  );
});

/* ------------------------------------------------------------------
   Front matter
------------------------------------------------------------------ */
export const TitlePage = forwardRef<HTMLDivElement, { c: Ctx; folio: string }>(function TitlePage({ c, folio }, ref) {
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col justify-between p-[10%]">
        <Logo tone="ink" className="w-[46%]" title="Archi Builder" />
        <div>
          <Kicker>{c.t(ui.tagline)}</Kicker>
          <Title className="mt-[3cqw]">{c.lang === "ar" ? "ملف الأعمال" : "Portfolio"}</Title>
          <Body className="mt-[4cqw] max-w-[80%]">{c.t(ui.bookBody)}</Body>
        </div>
        <p className="font-mono text-[clamp(7px,1.8cqw,11px)] uppercase tracking-[0.2em] text-black/50">
          {c.t(ui.basedIn)} · {c.n("2026")}
        </p>
      </div>
    </Page>
  );
});

export const ContentsPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; entries: { label: string; page: number; go: () => void }[] }>(
  function ContentsPage({ c, folio, entries }, ref) {
    return (
      <Page ref={ref} folio={folio}>
        <div className="flex h-full flex-col p-[10%]">
          <Kicker>{c.t(ui.contents)}</Kicker>
          <Title className="mt-[3cqw]">{c.t(ui.contents)}</Title>
          <ol className="mt-[7cqw] flex flex-col">
            {entries.map((e, i) => (
              <li key={e.label} className="border-t border-black/10">
                <button
                  type="button"
                  onClick={e.go}
                  className="flex w-full items-baseline gap-[3cqw] py-[2.2cqw] text-start text-[clamp(8px,2.5cqw,15px)] transition-colors hover:text-[#b3801a]"
                >
                  <span className="font-mono text-[0.8em] text-black/40">{c.n(String(i + 1).padStart(2, "0"))}</span>
                  <span className="flex-1">{e.label}</span>
                  <span className="font-mono text-[0.8em] text-black/50">{c.n(String(e.page + 1).padStart(2, "0"))}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Page>
    );
  },
);

/* ------------------------------------------------------------------
   Studio chapters
------------------------------------------------------------------ */
export const StudioPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; content: SiteContent }>(function StudioPage({ c, folio, content }, ref) {
  return (
    <Page ref={ref} folio={folio}>
      <div className="relative h-[46%]">
        <Image src={content.about.image} alt="" fill sizes="600px" className="object-cover" />
      </div>
      <div className="p-[9%] pt-[6%]">
        <Kicker>01 · {c.t(ui.nav.studio)}</Kicker>
        <p className="mt-[2.5cqw] font-[family-name:var(--display-face)] text-[clamp(11px,3.6cqw,22px)] font-medium leading-[1.2]">{plain(c.t(content.about.title))}</p>
        <Body className="mt-[3cqw]">{c.t(content.about.body[0])}</Body>
      </div>
    </Page>
  );
});

export const VisionPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; content: SiteContent }>(function VisionPage({ c, folio, content }, ref) {
  const blocks = [
    { k: ui.vision, v: content.vision },
    { k: ui.mission, v: content.mission },
  ];
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col gap-[8cqw] p-[10%]">
        {blocks.map((b, i) => (
          <div key={i} className="border-t border-black/15 pt-[4cqw]">
            <Kicker>
              0{i + 2} · {c.t(b.k)}
            </Kicker>
            <p className="mt-[2.5cqw] font-[family-name:var(--display-face)] text-[clamp(11px,3.8cqw,24px)] font-medium leading-[1.18]">{plain(c.t(b.v.title))}</p>
            <Body className="mt-[3cqw]">{c.t(b.v.body)}</Body>
          </div>
        ))}
      </div>
    </Page>
  );
});

export const ValuesPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; content: SiteContent }>(function ValuesPage({ c, folio, content }, ref) {
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col p-[10%]">
        <Kicker>04 · {c.t(ui.values)}</Kicker>
        <Title className="mt-[3cqw]">{c.t(ui.values)}</Title>
        <ol className="mt-[6cqw] flex flex-col gap-[3.2cqw]">
          {content.values.map((v, i) => (
            <li key={v.key} className="grid grid-cols-[8cqw_1fr] border-t border-black/10 pt-[2.4cqw]">
              <span className="font-mono text-[clamp(7px,1.8cqw,11px)] text-[#b3801a]">{c.n(String(i + 1).padStart(2, "0"))}</span>
              <div>
                <p className="text-[clamp(9px,2.8cqw,16px)] font-semibold">{c.t(v.title)}</p>
                <Body className="mt-[0.8cqw]">{c.t(v.body)}</Body>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
});

export const ServicesPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; content: SiteContent }>(function ServicesPage({ c, folio, content }, ref) {
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col p-[10%]">
        <Kicker>05 · {c.t(ui.nav.services)}</Kicker>
        <Title className="mt-[3cqw]">{c.t(ui.servicesLabel)}</Title>
        <ol className="mt-[6cqw] grid grid-cols-2 gap-x-[5cqw] gap-y-[4.5cqw]">
          {content.services.map((s, i) => (
            <li key={s.key} className="border-t border-black/10 pt-[2.2cqw]">
              <span className="font-mono text-[clamp(7px,1.7cqw,10px)] text-[#b3801a]">S·{c.n(String(i + 1).padStart(2, "0"))}</span>
              <p className="mt-[1cqw] text-[clamp(9px,2.6cqw,15px)] font-semibold">{c.t(s.title)}</p>
              <Body className="mt-[0.8cqw] !text-[clamp(7px,2cqw,12px)]">{c.t(s.body)}</Body>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
});

export const SectorsPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; content: SiteContent }>(function SectorsPage({ c, folio, content }, ref) {
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col p-[10%]">
        <Kicker>06 · {c.t(ui.sectors)}</Kicker>
        <p className="mt-[3cqw] font-[family-name:var(--display-face)] text-[clamp(11px,3.8cqw,24px)] font-medium leading-[1.18]">{plain(c.t(content.sectorsIntro.title))}</p>
        <div className="mt-[6cqw] grid flex-1 grid-cols-3 gap-[3cqw]">
          {content.sectors.map((s) => (
            <div key={s.key} className="flex flex-col">
              <div className="relative flex-1 overflow-hidden">
                <Image src={s.image} alt="" fill sizes="220px" className="object-cover" />
              </div>
              <p className="mt-[2cqw] text-[clamp(8px,2.3cqw,14px)] font-semibold">{c.t(s.title)}</p>
              <p className="mt-[0.6cqw] text-[clamp(7px,1.9cqw,11px)] leading-snug text-black/60">{s.items.map((it) => c.t(it)).join(" · ")}</p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
});

export const ProcessPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; content: SiteContent }>(function ProcessPage({ c, folio, content }, ref) {
  return (
    <Page ref={ref} folio={folio} dark className="bg-[#111]">
      <div className="flex h-full flex-col p-[10%]">
        <Kicker>07 · {c.t(ui.processLabel)}</Kicker>
        <p className="mt-[3cqw] font-[family-name:var(--display-face)] text-[clamp(11px,3.8cqw,24px)] font-medium leading-[1.18]">{content.statement.map((s) => c.t(s)).join(" ")}</p>
        <ol className="mt-[6cqw] flex flex-col gap-[2.6cqw]">
          {content.process.map((s, i) => (
            <li key={i} className="grid grid-cols-[9cqw_1fr] items-baseline border-t border-white/10 pt-[2.2cqw]">
              <span className="gold-text font-[family-name:var(--display-face)] text-[clamp(10px,3.4cqw,20px)] font-semibold">{c.n(String(i + 1).padStart(2, "0"))}</span>
              <div>
                <p className="text-[clamp(9px,2.6cqw,15px)] font-semibold">{c.t(s.title)}</p>
                <p className="mt-[0.6cqw] text-[clamp(7px,2cqw,12px)] leading-snug text-white/60">{c.t(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
});

/* ------------------------------------------------------------------
   Project spreads: photograph left, the facts right
------------------------------------------------------------------ */
export const ProjectImagePage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; p: Project }>(function ProjectImagePage({ c, folio, p }, ref) {
  return (
    <Page ref={ref} folio={folio} dark>
      <Image src={p.cover} alt="" fill sizes="600px" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.65),transparent_45%)]" />
      <div className="absolute inset-x-[8%] bottom-[9%]">
        <p className="font-mono text-[clamp(7px,1.8cqw,11px)] uppercase tracking-[0.22em] text-[#e0ab26]">{c.t(ui.sectorNames[p.sector])}</p>
        <p className="mt-[1.5cqw] font-[family-name:var(--display-face)] text-[clamp(16px,6cqw,38px)] font-semibold uppercase leading-none [font-variation-settings:'wdth'_118]">
          {c.lang === "ar" ? p.nameAr : p.name}
        </p>
      </div>
    </Page>
  );
});

export const ProjectInfoPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; p: Project; index: number }>(function ProjectInfoPage({ c, folio, p, index }, ref) {
  const thumbs = p.gallery.filter((g) => g !== p.cover).slice(0, 3);
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col p-[9%]">
        <Kicker>
          P·{c.n(String(index + 1).padStart(2, "0"))} · {c.t(p.city)}
        </Kicker>
        <Title className="mt-[2.5cqw]">{c.lang === "ar" ? p.nameAr : p.name}</Title>
        <p className="mt-[1.5cqw] text-[clamp(8px,2.2cqw,13px)] font-medium text-black/60">{c.t(p.type)}</p>
        <Body className="mt-[4cqw]">{c.t(p.summary)}</Body>
        <div className="mt-[3.5cqw] flex flex-wrap gap-[1.5cqw]">
          {p.scope.map((s) => (
            <span key={s.en} className="border border-black/15 px-[1.8cqw] py-[0.8cqw] font-mono text-[clamp(6px,1.6cqw,10px)] uppercase tracking-[0.12em] text-black/60">
              {c.t(s)}
            </span>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-3 gap-[2cqw] pt-[5cqw]">
          {thumbs.map((src) => (
            <div key={src} className="relative aspect-[3/4] overflow-hidden">
              <Image src={src} alt="" fill sizes="180px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
});

/* ------------------------------------------------------------------
   Back matter
------------------------------------------------------------------ */
export const TeamPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; team: TeamMember[]; content: SiteContent }>(function TeamPage({ c, folio, team, content }, ref) {
  return (
    <Page ref={ref} folio={folio}>
      <div className="flex h-full flex-col p-[9%]">
        <Kicker>08 · {c.t(ui.team)}</Kicker>
        <p className="mt-[3cqw] font-[family-name:var(--display-face)] text-[clamp(11px,3.6cqw,22px)] font-medium leading-[1.2]">{plain(c.t(content.teamIntro.title))}</p>
        <ul className="mt-[5cqw] flex flex-col gap-[3.5cqw]">
          {team.map((m) => (
            <li key={m.id} className="grid grid-cols-[16cqw_1fr] gap-[3cqw] border-t border-black/10 pt-[3cqw]">
              <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
                {m.photo ? (
                  <Image src={m.photo} alt="" fill sizes="120px" className="object-cover grayscale" />
                ) : (
                  <span className="gold-text absolute inset-0 grid place-items-center font-[family-name:var(--display-face)] text-[clamp(10px,4cqw,24px)] font-semibold" dir="ltr">
                    {m.name.en
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[clamp(9px,2.6cqw,15px)] font-semibold">{c.t(m.name)}</p>
                <p className="font-mono text-[clamp(6px,1.6cqw,10px)] uppercase tracking-[0.14em] text-[#b3801a]">{c.t(m.role)}</p>
                <p className="mt-[1cqw] line-clamp-3 text-[clamp(7px,1.95cqw,12px)] leading-snug text-black/60">{c.t(m.bio)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
});

export const ContactPage = forwardRef<HTMLDivElement, { c: Ctx; folio: string; settings: Settings }>(function ContactPage({ c, folio, settings }, ref) {
  return (
    <Page ref={ref} folio={folio} dark className="bg-[#111]">
      <div className="flex h-full flex-col justify-between p-[10%]">
        <div>
          <Kicker>09 · {c.t(ui.nav.contact)}</Kicker>
          <p className="mt-[3cqw] font-[family-name:var(--display-face)] text-[clamp(14px,5.4cqw,34px)] font-semibold uppercase leading-[1] [font-variation-settings:'wdth'_118]">
            {plain(c.t(ui.ctaTitle))}
          </p>
        </div>
        <div className="flex flex-col gap-[3cqw] text-[clamp(8px,2.3cqw,14px)]">
          <p className="text-white/70">{c.t(settings.address)}</p>
          <p className="font-mono tracking-[0.1em]" dir="ltr">
            {settings.phones.join("  ·  ")}
          </p>
          <Mark className="mt-[2cqw] h-[10cqw] w-auto self-start" />
        </div>
      </div>
    </Page>
  );
});
