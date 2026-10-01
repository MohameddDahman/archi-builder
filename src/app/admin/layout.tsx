import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { ConvexClientProvider } from "@/components/providers/convex";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = {
  title: { default: "Site manager — Archi Builder", template: "%s — Site manager" },
  robots: { index: false, follow: false },
  icons: { icon: "/brand/mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVars}>
      <body>
        <ConvexClientProvider>
          <AdminShell>{children}</AdminShell>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
