import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { PrintVolume } from "@/components/book/print-volume";

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: PageProps<"/print/book/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  // Printed into the PDF as its title.
  return { title: { absolute: lang === "ar" ? "المعماري للبناء — ملف الأعمال" : "Archi Builder — Portfolio" } };
}

/**
 * Every page of the volume laid flat, in reading order, at the flip-book's own
 * size. Nothing links here: scripts/build-book-pdf.mjs prints it into the PDF
 * copy the book page hands out.
 */
export default async function PrintBookPage({ params }: PageProps<"/print/book/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <PrintVolume lang={lang} />;
}
