"use client";

import { LocaleProvider } from "@/components/providers/locale";
import { SiteHydrator } from "@/components/providers/site-hydrator";
import type { Locale } from "@/lib/i18n";
import type { PublicSite } from "@/lib/content/server";
import { useBook, useBookCtx } from "./use-book";
import { SheetContent } from "./sheets";

function Sheets() {
  const { pages } = useBook();
  const ctx = useBookCtx();
  const count = pages.length;
  const rtl = ctx.lang === "ar";
  return (
    <main className="book-print" dir={rtl ? "rtl" : "ltr"}>
      {pages.map((page, r) => {
        // Pages keep the side they have in the bound volume, so folios print at the outer corner.
        const sheet = rtl ? count - 1 - r : r;
        return (
          <div key={page.id} className="book-print-sheet">
            <SheetContent page={page} side={sheet % 2 === 1 ? "left" : "right"} eager c={ctx} />
          </div>
        );
      })}
    </main>
  );
}

export function PrintVolume({ lang, site }: { lang: Locale; site: PublicSite }) {
  return (
    <LocaleProvider lang={lang}>
      <SiteHydrator initial={site} live={false} />
      <Sheets />
    </LocaleProvider>
  );
}
