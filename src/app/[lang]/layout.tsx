import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { dirOf, isLocale, locales } from "@/lib/i18n";
import { LocaleProvider } from "@/components/providers/locale";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { TransitionProvider } from "@/components/providers/transition";
import { SiteHydrator } from "@/components/providers/site-hydrator";
import { ConvexClientProvider } from "@/components/providers/convex";
import { getSiteData } from "@/lib/content/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Preloader } from "@/components/ui/preloader";

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  const title = ar ? "المعماري للبناء — تصميم · تنفيذ · تسليم" : "Archi Builder — Design · Build · Deliver";
  const description = ar
    ? "شركة متخصصة في تنفيذ وتطوير المشاريع السكنية والتجارية والتشطيبات الداخلية في جدة والمملكة."
    : "Design-build, fit-out and project management for residential and commercial spaces in Jeddah and across Saudi Arabia.";
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ??
        (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
    ),
    title: { default: title, template: ar ? "%s — المعماري للبناء" : "%s — Archi Builder" },
    description,
    alternates: { languages: { en: "/en", ar: "/ar" } },
    openGraph: { title, description, images: ["/images/site/villa-dusk.jpg"], locale: ar ? "ar_SA" : "en_US" },
    icons: { icon: "/brand/mark.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const site = await getSiteData();

  return (
    <html lang={lang} dir={dirOf(lang)} className={fontVars} suppressHydrationWarning>
      <body className="grain">
        <ConvexClientProvider>
        <LocaleProvider lang={lang}>
          <SmoothScroll>
            <TransitionProvider>
              <SiteHydrator initial={site} />
              <Preloader />
              <Header />
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer />
            </TransitionProvider>
          </SmoothScroll>
        </LocaleProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
