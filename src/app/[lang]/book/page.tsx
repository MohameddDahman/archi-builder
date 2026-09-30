import type { Metadata } from "next";
import { BookPage } from "@/components/book/book-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const { lang } = await params;
  return lang === "ar"
    ? { title: "ملف الأعمال", description: "قلّب صفحات ملف أعمال المعماري للبناء." }
    : { title: "The Portfolio", description: "Turn the pages of the Archi Builder portfolio, one project to a spread." };
}

export default function Page() {
  return <BookPage />;
}
