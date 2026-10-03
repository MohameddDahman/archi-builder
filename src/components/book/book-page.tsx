"use client";

import { useLocale } from "@/components/providers/locale";
import { ui } from "@/lib/dict";
import { counted } from "@/lib/i18n";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal, RevealText } from "@/components/ui/motion";
import { Rich } from "@/components/ui/rich";
import { BtnA, Slab } from "@/components/ui/primitives";
import copies from "@/lib/book-pdf.json";
import { BookVolume } from "./book-volume";
import { figure } from "./sheets";
import { useBook, useBookCtx } from "./use-book";

type Copy = { pages: number; bytes: number };

export function BookPage() {
  const { t, n, lang } = useLocale();
  const { projects, pages } = useBook();
  const ctx = useBookCtx();
  const copy = (copies as Partial<Record<string, Copy>>)[lang];

  return (
    <>
      <PageHero name={t(ui.bookLabel)} title={t(ui.book.title)} lead={t(ui.book.lead)} index="04">
        <p className="label text-gypsum/45">
          {figure({ lang, n }, projects.length, 2)} {counted(ui.book.projects, projects.length, lang)} · {n(pages.length)} {counted(ui.book.pages, pages.length, lang)}
        </p>
      </PageHero>

      <div className="mt-[var(--bay)]">
        <BookVolume pages={pages} ctx={ctx} />
      </div>

      {copy && (
        <section className="px-[var(--gutter)] py-[var(--bay)]">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="label mb-8 flex items-center gap-3 text-ochre">
                <Slab />
                {t(ui.book.keepLabel)}
              </p>
              <RevealText as="h2" className="mega mega-lg text-balance">
                <Rich text={t(ui.book.keepTitle)} />
              </RevealText>
            </div>
            <Reveal className="flex flex-col items-start gap-8 lg:col-span-4 lg:col-start-9">
              <p className="text-gypsum/65">{t(ui.book.keepBody)}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <BtnA tone="ochre" href={`/book/archi-builder-portfolio-${lang}.pdf`} download={`${t(ctx.settings.companyName)} — ${t(ui.book.volume)}.pdf`}>
                  {t(ui.book.download)}
                </BtnA>
                <p className="label text-gypsum/45">
                  PDF · {n(copy.pages)} {counted(ui.book.pages, copy.pages, lang)} · {n((copy.bytes / 1024 / 1024).toFixed(1))} {t(ui.book.megabytes)}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
