import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: { default: "Site manager — Archi Builder", template: "%s — Site manager" },
  robots: { index: false, follow: false },
  icons: { icon: "/brand/mark.svg" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVars}>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
