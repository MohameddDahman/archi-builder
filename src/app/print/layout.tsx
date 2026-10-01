import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** A bare root for pages that are printed, not browsed: no header, footer or transitions. */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
