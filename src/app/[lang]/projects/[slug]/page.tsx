import type { Metadata } from "next";
import { seed } from "@/lib/content/seed";
import { locales } from "@/lib/i18n";
import { ProjectDetail } from "@/components/projects/project-detail";

export const generateStaticParams = () =>
  locales.flatMap((lang) => seed.projects.map((p) => ({ lang, slug: p.slug })));

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = seed.projects.find((x) => x.slug === slug);
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
