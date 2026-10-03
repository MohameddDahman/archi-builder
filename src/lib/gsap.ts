"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * How far (yPercent) a masked line drops out of sight. Arabic marks reach past
 * the line box and Arabic masks clip a box grown around it (globals.css), so
 * Arabic lines start lower or their hamzas and shaddas peek out early.
 */
export const maskDrop = (lang: string, base = 110) => (lang === "ar" ? 150 : base);

export { gsap, ScrollTrigger, SplitText, useGSAP };
