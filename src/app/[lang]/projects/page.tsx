import type { Metadata } from "next";
import { ProjectsPage } from "@/components/projects/projects-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "ar" ? "المشاريع" : "Projects" };
}

export default function Page() {
  return <ProjectsPage />;
}
