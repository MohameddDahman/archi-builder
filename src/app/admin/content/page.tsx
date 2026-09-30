import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/content-editor";

export const metadata: Metadata = { title: "Page content" };

export default function Page() {
  return <ContentEditor />;
}
