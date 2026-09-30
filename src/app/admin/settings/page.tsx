import type { Metadata } from "next";
import { SettingsEditor } from "@/components/admin/settings";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsEditor />;
}
