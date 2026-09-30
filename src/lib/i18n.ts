export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** A string stored in both site languages. */
export type L = { en: string; ar: string };

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v);

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export const tr = (value: L | undefined, locale: Locale) =>
  value ? value[locale] || value.en : "";

const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
export const digits = (value: string | number, locale: Locale) =>
  locale === "ar"
    ? String(value).replace(/\d/g, (d) => arabicDigits[Number(d)])
    : String(value);

/** Prefix an internal path with the active locale. */
export const href = (locale: Locale, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;
