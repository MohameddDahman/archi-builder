import { Alexandria, Archivo, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * One grotesk carries the whole voice: Archivo's width axis runs from
 * condensed body text to monumental extended capitals.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

/** Technical data: dimensions, coordinates, scales, labels. */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

/** Arabic display: geometric, holds its own next to extended Latin capitals. */
export const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const fontVars = [archivo, plexMono, alexandria, plexArabic].map((f) => f.variable).join(" ");
