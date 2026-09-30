import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/contact-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "ar" ? "تواصل معنا" : "Contact" };
}

export default function Page() {
  return <ContactPage />;
}
