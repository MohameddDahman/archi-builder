"use client";

import { createContext, useContext, useMemo } from "react";
import { digits, dirOf, href, tr, type L, type Locale } from "@/lib/i18n";

type Ctx = {
  lang: Locale;
  dir: "ltr" | "rtl";
  t: (v: L | undefined) => string;
  n: (v: string | number) => string;
  to: (path: string) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: dirOf(lang),
      t: (v) => tr(v, lang),
      n: (v) => digits(v, lang),
      to: (p) => href(lang, p),
    }),
    [lang],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
