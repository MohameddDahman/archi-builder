import type { Metadata } from "next";
import { StudioPage } from "@/components/studio/studio-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/studio">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "ar" ? "من نحن" : "Studio" };
}

export default function Page() {
  return <StudioPage />;
}
