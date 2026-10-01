import type { Metadata } from "next";
import { getSiteData } from "@/lib/content/server";
import { locales } from "@/lib/i18n";
import { ProjectDetail } from "@/components/projects/project-detail";

/** Published projects are prerendered; one added later renders on its first visit. */
export async function generateStaticParams() {
  const { projects } = await getSiteData();
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const { projects } = await getSiteData();
  const p = projects.find((x) => x.slug === slug);
  if (!p) return { title: lang === "ar" ? "مشروع" : "Project" };
  const ar = lang === "ar";
  return {
    title: ar ? p.nameAr : p.name,
    description: ar ? p.summary.ar : p.summary.en,
    openGraph: { images: [p.cover] },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} />;
}
