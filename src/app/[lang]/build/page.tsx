import type { Metadata } from "next";
import { BuildPage } from "@/components/house/build-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/build">): Promise<Metadata> {
  const { lang } = await params;
  return lang === "ar"
    ? { title: "مراحل البناء", description: "شاهد فيلا تُبنى من المخطط إلى الخامات النهائية، نهارًا وليلًا." }
    : { title: "The Build", description: "Watch a villa build itself, from the first plan to finished materials, by day and after dark." };
}

export default function Page() {
  return <BuildPage />;
}
