"use client";

import { forwardRef, useMemo } from "react";
import clsx from "clsx";

type Props = {
  count: number;
  /** Starting angle in degrees: 0 = closed screen, 90 = edge-on (open). */
  angle?: number;
  /** Board thickness in px. */
  depth?: number;
  className?: string;
};

/**
 * A rawshan: the carved timber window screens of Jeddah's Al-Balad,
 * rebuilt as CSS 3D boards. Each board is a box (front, back, two edges)
 * that pivots on its centre line. Rotate `[data-louver]` with GSAP.
 */
export const Louvers = forwardRef<HTMLDivElement, Props>(function Louvers(
  { count, angle = 0, depth = 16, className },
  ref,
) {
  // Real boards differ: give each its own slice of grain.
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => ((i * 97) % 240) - 120), [count]);
  return (
    <div ref={ref} className={clsx("flex [perspective:1800px]", className)} dir="ltr" aria-hidden="true">
      {offsets.map((off, i) => (
        <div
          key={i}
          data-louver
          className="relative h-full flex-1 [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${angle}deg)`, marginInline: "-0.5px" }}
        >
          <div
            className="slat-face absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: `translateZ(${depth / 2}px)`, backgroundPosition: `0 0, ${off}px ${off * 2}px` }}
          />
          <div
            className="slat-face absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: `rotateY(180deg) translateZ(${depth / 2}px)`, backgroundPosition: `0 0, ${-off}px ${off}px` }}
          />
          <Edge side="left" depth={depth} />
          <Edge side="right" depth={depth} />
        </div>
      ))}
    </div>
  );
});

function Edge({ side, depth }: { side: "left" | "right"; depth: number }) {
  return (
    <div
      className={clsx("slat-side absolute inset-y-0", side === "left" ? "left-0 origin-left" : "right-0 origin-right")}
      style={{
        width: depth,
        transform:
          side === "left"
            ? `translateZ(${depth / 2}px) rotateY(90deg)`
            : `translateZ(${depth / 2}px) rotateY(-90deg)`,
      }}
    />
  );
}
