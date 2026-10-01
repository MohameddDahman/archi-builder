import { Alexandria, Archivo, IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Instrument_Serif, Markazi_Text } from "next/font/google";

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

/**
 * The printed portfolio is set like a monograph: titles in a book face.
 * Only the book uses these, so they are not preloaded on every page.
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
});

export const markazi = Markazi_Text({
  subsets: ["arabic", "latin"],
  variable: "--font-markazi",
  display: "swap",
  preload: false,
});

export const fontVars = [archivo, plexMono, alexandria, plexArabic, instrumentSerif, markazi].map((f) => f.variable).join(" ");
