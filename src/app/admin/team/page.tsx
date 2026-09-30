import type { Metadata } from "next";
import { TeamEditor } from "@/components/admin/team-editor";

export const metadata: Metadata = { title: "Team" };

export default function Page() {
  return <TeamEditor />;
}
