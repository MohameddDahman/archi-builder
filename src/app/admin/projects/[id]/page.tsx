import type { Metadata } from "next";
import { ProjectEditor } from "@/components/admin/project-editor";

export const metadata: Metadata = { title: "Edit project" };

export default async function Page({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  return <ProjectEditor id={id} />;
}
