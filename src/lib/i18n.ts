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
/** Arabic-Indic figures, with the Arabic decimal separator (٢٫٤, not ٢.٤). */
export const digits = (value: string | number, locale: Locale) =>
  locale === "ar"
    ? String(value)
        .replace(/(\d)\.(\d)/g, "$1٫$2")
        .replace(/\d/g, (d) => arabicDigits[Number(d)])
    : String(value);

/**
 * A label that follows a number. Arabic agrees the noun with the count:
 * 3–10 take the plural (٩ مشاريع), 11–99 the singular accusative
 * (١٢ مشروعًا), and 0–2 and the hundreds the singular (١٠٠ مشروع).
 */
export type Counted = { en: string; ar: { few: string; many: string; other: string } };
const arabicPlural = new Intl.PluralRules("ar");
export const counted = (label: Counted, count: number, locale: Locale) => {
  if (locale !== "ar") return label.en;
  const form = arabicPlural.select(count);
  return form === "few" ? label.ar.few : form === "many" ? label.ar.many : label.ar.other;
};

/** The list comma of each language: Arabic writes ، not ,. */
export const comma = (locale: Locale) => (locale === "ar" ? "، " : ", ");

/** Prefix an internal path with the active locale. */
export const href = (locale: Locale, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;
