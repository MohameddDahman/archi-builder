import type { Metadata } from "next";
import { ServicesPage } from "@/components/services/services-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "ar" ? "خدماتنا" : "Services" };
}

export default function Page() {
  return <ServicesPage />;
}
